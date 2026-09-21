import { NotFoundError } from '../lib/errors';

export function assertFound<T>(entity: T | null | undefined, message: string): asserts entity is T {
  if (!entity) {
    throw new NotFoundError(message);
  }
}
