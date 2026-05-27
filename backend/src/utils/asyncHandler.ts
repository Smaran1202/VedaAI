import type { AsyncController } from "../types/api.types";

export function asyncHandler(controller: AsyncController): AsyncController {
  return async (request, response, next) => {
    try {
      await controller(request, response, next);
    } catch (error) {
      next(error);
    }
  };
}
