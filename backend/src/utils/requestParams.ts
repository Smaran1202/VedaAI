import { ApiError } from "./apiError";

export function readStringParam(value: string | string[] | undefined, name: string) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  throw new ApiError(400, `Invalid ${name} parameter`);
}
