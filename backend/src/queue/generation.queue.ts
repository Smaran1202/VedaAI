import { Queue } from "bullmq";
import { createRedisConnection } from "../config/redis";
import {
  ASSIGNMENT_GENERATION_QUEUE,
  type AssignmentGenerationJob
} from "./generation.types";

export const generationQueueConnection = createRedisConnection();

export const generationQueue = generationQueueConnection
  ? new Queue<AssignmentGenerationJob>(ASSIGNMENT_GENERATION_QUEUE, {
      connection: generationQueueConnection,
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: "exponential",
          delay: 2000
        },
        removeOnComplete: 100,
        removeOnFail: 100
      }
    })
  : undefined;

export async function enqueueAssignmentGeneration(assignmentId: string) {
  if (!generationQueue) {
    return false;
  }

  try {
    console.info("[assignment:queue:add]", { assignmentId });
    await generationQueue.add("generate-assignment", { assignmentId });
    return true;
  } catch {
    console.error("Failed to enqueue assignment generation job.");
    return false;
  }
}
