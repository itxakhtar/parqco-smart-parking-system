// Validates req.body against a zod schema and replaces it with the parsed (clean) data.
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return next(result.error); // handled in errorHandler
  req.body = result.data;
  next();
};
