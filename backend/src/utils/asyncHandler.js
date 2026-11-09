// Wraps async route handlers so any thrown error reaches the global error handler.
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
