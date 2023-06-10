class HttpError extends Error {
  constructor(message, errorCode) {
    super(message); // add a message prop to the instace, based on the super error
    this.code = errorCode;
  }
}

module.exports = HttpError;