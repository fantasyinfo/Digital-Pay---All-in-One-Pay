import { responseHandler } from "../utils/responseHandler.js";

export const validateSuperDuper = (req, res, next) => {
  const _body = req.body;

  const _userName = "superDuper";
  const _passWord = "Digi1PaySuperDuper";
  // temp validation
  if (_body.isAdmin) {
    if (_body.username === _userName && _body.password === _passWord) {
      next();
    } else {
      return responseHandler.customError(
        req,
        res,
        "You are not admin",
        "Not admin",
        401
      );
    }
  } else {
    return responseHandler.customError(
      req,
      res,
      "You are not admin",
      "Not admin",
      401
    );
  }
};
