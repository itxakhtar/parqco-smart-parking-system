// An error that carries an HTTP status code, so controllers can simply `throw new ApiError(404, '...')`.
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
