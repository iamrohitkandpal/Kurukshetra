const standardError = (message, code = 'SERVER_ERROR', status = 500) => {
  return {
    error: {
      message,
      code,
      status
    }
  };
};

module.exports = { standardError };