import { ZodError } from 'zod';

export const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Single place that turns any error into a consistent JSON response.
export const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong on our side.';

  if (err instanceof ZodError) {
    statusCode = 400;
    message = err.issues.map((issue) => issue.message).join('. ');
  } else if (err.code === 11000) {
    statusCode = 409;
    message = `${Object.keys(err.keyValue || {})[0] || 'Value'} already exists.`;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier.';
  }

  if (statusCode === 500) console.error(err);
  res.status(statusCode).json({ success: false, message });
};
