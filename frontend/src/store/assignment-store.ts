"use client";

import { create } from "zustand";
import { isAxiosError } from "axios";
import * as assignmentService from "@/services/assignment.service";
import { socket } from "@/lib/socket";
import type { Assignment, AssignmentStatus } from "@/types";

interface AssignmentState {
  assignments: Assignment[];
  selectedAssignment: Assignment | null;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  fetchAssignments: (params?: assignmentService.AssignmentListParams) => Promise<void>;
  fetchAssignmentById: (id: string) => Promise<void>;
  createAssignment: (payload: assignmentService.CreateAssignmentPayload) => Promise<string>;
  deleteAssignment: (id: string) => Promise<void>;
  regenerateAssignment: (id: string) => Promise<void>;
  subscribeToGenerationEvents: () => () => void;
}

interface AssignmentSocketPayload {
  assignmentId: string;
  status: AssignmentStatus;
  message: string;
}

function getErrorMessage(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  assignments: [],
  selectedAssignment: null,
  isLoading: false,
  isFetching: false,
  error: null,
  fetchAssignments: async (params) => {
    const firstLoad = get().assignments.length === 0;
    set({ isLoading: firstLoad, isFetching: true, error: null });

    try {
      const response = await assignmentService.getAssignments(params);
      set({ assignments: response.data, isLoading: false, isFetching: false });
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false, isFetching: false });
    }
  },
  fetchAssignmentById: async (id) => {
    const selectedId = get().selectedAssignment?.id ?? get().selectedAssignment?._id;
    const firstLoad = selectedId !== id;
    set({ isLoading: firstLoad, isFetching: true, error: null });

    try {
      const assignment = await assignmentService.getAssignmentById(id);
      set({ selectedAssignment: assignment, isLoading: false, isFetching: false });
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false, isFetching: false });
    }
  },
  createAssignment: async (payload) => {
    set({ isFetching: true, error: null });

    try {
      const result = await assignmentService.createAssignment(payload);
      set({ isFetching: false });
      return result.id;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message, isFetching: false });
      throw new Error(message);
    }
  },
  deleteAssignment: async (id) => {
    set({ isFetching: true, error: null });

    try {
      await assignmentService.deleteAssignment(id);
      set((state) => ({
        assignments: state.assignments.filter((assignment) => (assignment._id ?? assignment.id) !== id),
        isFetching: false
      }));
    } catch (error) {
      set({ error: getErrorMessage(error), isFetching: false });
    }
  },
  regenerateAssignment: async (id) => {
    set({ isFetching: true, error: null });

    try {
      await assignmentService.regenerateAssignment(id);
      set((state) => ({
        selectedAssignment:
          state.selectedAssignment &&
          (state.selectedAssignment.id === id || state.selectedAssignment._id === id)
            ? { ...state.selectedAssignment, status: "queued", generatedPaper: null }
            : state.selectedAssignment,
        assignments: state.assignments.map((assignment) =>
          assignment.id === id || assignment._id === id
            ? { ...assignment, status: "queued", generatedPaper: null }
            : assignment
        ),
        isFetching: false
      }));
    } catch (error) {
      set({ error: getErrorMessage(error), isFetching: false });
    }
  },
  subscribeToGenerationEvents: () => {
    if (!socket.connected) {
      socket.connect();
    }

    const updateStatus = (payload: AssignmentSocketPayload) => {
      set((state) => ({
        assignments: state.assignments.map((assignment) =>
          assignment.id === payload.assignmentId || assignment._id === payload.assignmentId
            ? { ...assignment, status: payload.status }
            : assignment
        ),
        selectedAssignment:
          state.selectedAssignment &&
          (state.selectedAssignment.id === payload.assignmentId ||
            state.selectedAssignment._id === payload.assignmentId)
            ? { ...state.selectedAssignment, status: payload.status }
            : state.selectedAssignment
      }));
    };

    const completeStatus = (payload: AssignmentSocketPayload) => {
      updateStatus(payload);
      void get().fetchAssignmentById(payload.assignmentId);
    };

    socket.on("assignment:queued", updateStatus);
    socket.on("assignment:processing", updateStatus);
    socket.on("assignment:completed", completeStatus);
    socket.on("assignment:failed", updateStatus);

    return () => {
      socket.off("assignment:queued", updateStatus);
      socket.off("assignment:processing", updateStatus);
      socket.off("assignment:completed", completeStatus);
      socket.off("assignment:failed", updateStatus);
    };
  }
}));
