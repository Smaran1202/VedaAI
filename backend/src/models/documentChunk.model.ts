import { Schema, model } from "mongoose";

export const documentChunkSchema = new Schema(
  {
    assignmentId: { type: String, required: true, trim: true, index: true },
    chunkIndex: { type: Number, required: true, min: 0 },
    text: { type: String, required: true, trim: true },
    tokenHint: { type: Number, required: true, min: 1 }
  },
  { timestamps: true }
);

documentChunkSchema.index({ assignmentId: 1, chunkIndex: 1 }, { unique: true });
documentChunkSchema.index({ text: "text" });

export const DocumentChunkModel = model("DocumentChunk", documentChunkSchema);
