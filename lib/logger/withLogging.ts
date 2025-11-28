import logger from './server';

// A function to check if a value is an error object
function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function withLogging<T extends any[], R>(
  fn: (...args: T) => R,
  functionName: string,
) {
  const log = logger.child({ function: functionName });

  return (...args: T): R => {
    log.debug({ args }, `Entering function.`);

    try {
      const result = fn(...args);

      if (result instanceof Promise) {
        return result
          .then((res) => {
            log.debug({ result: res }, `Exiting function (async).`);
            return res;
          })
          .catch((err) => {
            if (isError(err)) {
              log.error({ err: { name: err.name, message: err.message, stack: err.stack } }, `Exiting function with error (async).`);
            } else {
              log.error({ err }, `Exiting function with non-Error exception (async).`);
            }
            throw err;
          }) as R;
      }

      log.debug({ result }, `Exiting function.`);
      return result;
    } catch (error) {
      if (isError(error)) {
        log.error({ err: { name: error.name, message: error.message, stack: error.stack } }, `Exiting function with error.`);
      } else {
        log.error({ err: error }, `Exiting function with non-Error exception.`);
      }
      throw error;
    }
  };
}
