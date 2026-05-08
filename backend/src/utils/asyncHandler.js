/**
 * A wrapper function to catch async errors and pass them to Express error handlers
 * without needing try-catch blocks in every controller.
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
