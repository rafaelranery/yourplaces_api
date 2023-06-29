const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authentication.split(" ")[1];

    if (!token) {
      throw new HttpError("Authentication failed", 401);
    }
    const decodedToken = jwt.verify(token, "very_secret_private_key");
    req.userData = { userId: decodedToken.userId, email: decodedToken.email };
    next();
  } catch (err) {
    const error = new HttpError("Authentication failed", 500);
    return next(error);
  }
};
