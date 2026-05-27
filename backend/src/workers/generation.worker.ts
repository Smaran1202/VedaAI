import { Worker } from "bullmq";
import { connectDatabase, registerDatabaseShutdown } from "../config/database";
import { ASSIGNMENT_STATUS } from "../constants/assignment.constants";
import { createRedisConnection } from "../config/redis";
import {
  ASSIGNMENT_GENERATION_QUEUE,
  type AssignmentGenerationJob
} from "../queue/generation.types";
import {
  completeAssignmentGeneration,
  getAssignmentById,
  markAssignmentFailed,
  markAssignmentProcessing
} from "../services/assignment.service";
import { generateQuestionPaper } from "../services/ai.service";
import { wait } from "../utils/timing";
import { emitAssignmentEvent } from "../socket";

export async function startGenerationWorker() {
  registerDatabaseShutdown();

  const workerConnection = createRedisConnection();

  if (!workerConnection) {
    return undefined;
  }

  const worker = new Worker<AssignmentGenerationJob>(
    ASSIGNMENT_GENERATION_QUEUE,
    async (job) => {
      await connectDatabase();
      const { assignmentId } = job.data;

      emitAssignmentEvent("assignment:processing", {
        assignmentId,
        status: ASSIGNMENT_STATUS.PROCESSING,
        message: "Generating assignment paper"
      });

      await markAssignmentProcessing(assignmentId);

      await wait(1500);

      const assignment = await getAssignmentById(assignmentId);
      const generatedPaper = await generateQuestionPaper(assignment);
      await completeAssignmentGeneration(assignmentId, generatedPaper);

      emitAssignmentEvent("assignment:completed", {
        assignmentId,
        status: ASSIGNMENT_STATUS.COMPLETED,
        message: "Assignment paper generated successfully"
      });
    },
    {
      connection: workerConnection,
      concurrency: 2
    }
  );

  worker.on("failed", async (job) => {
    const assignmentId = job?.data.assignmentId;

    if (!assignmentId) {
      return;
    }

    try {
      await markAssignmentFailed(assignmentId);
    } catch {
      console.error("Failed to update assignment after generation failure.");
    }

    emitAssignmentEvent("assignment:failed", {
      assignmentId,
      status: ASSIGNMENT_STATUS.FAILED,
      message: "Assignment generation failed"
    });
  });

  worker.on("error", () => {
    console.error("Assignment generation worker error.");
  });

  console.info("Worker started: assignment-generation");
  void worker.waitUntilReady().catch(() => {
    console.error("Assignment generation worker could not connect to Redis.");
  });
  return worker;
}

void startGenerationWorker();
