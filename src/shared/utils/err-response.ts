export const errResponse = (message: string) => ({
  status: 'error',
  error: message,
  message,
});
