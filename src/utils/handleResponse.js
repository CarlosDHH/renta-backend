export const generateResponse = (
  statusCode,
  success,
  message,
  data = null,
  errors = null
) => {
  const response = {
    statusCode,
    success,
    message,
    data,
    ...(errors && { errors }),
  };

  return response;
};

