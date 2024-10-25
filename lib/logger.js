import pino from "pino";

export function createLogger(name, opts = {}) {
  return pino(opts).child({ name });
}
