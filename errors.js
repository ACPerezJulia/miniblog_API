function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export const badRequest = (msg) => createError(400, msg);
export const notFound = (msg) => createError(404, msg);
