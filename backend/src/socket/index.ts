import type { Server } from "socket.io";

type AssignmentSocketEvent =
  | "assignment:queued"
  | "assignment:processing"
  | "assignment:completed"
  | "assignment:failed";

interface AssignmentSocketPayload {
  assignmentId: string;
  status: "queued" | "processing" | "completed" | "failed";
  message: string;
}

let ioInstance: Server | null = null;

export function initializeSocket(io: Server) {
  ioInstance = io;

  io.on("connection", (socket) => {
    socket.emit("connected", { message: "VedaAI backend socket connected" });
  });
}

export function emitAssignmentEvent(event: AssignmentSocketEvent, payload: AssignmentSocketPayload) {
  ioInstance?.emit(event, payload);
}
