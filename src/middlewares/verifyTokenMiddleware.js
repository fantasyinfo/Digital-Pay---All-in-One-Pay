import { APIstatusCodes } from "../utils/constants.js";
import { responseHandler } from "../utils/responseHandler.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
// Verify JWT token function (middleware)
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return responseHandler.customError(
        req,
        res,
        null,
        "token.auth.missingToken",
        APIstatusCodes[401]
      );
    }
    const token = authHeader.split(" ")[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return responseHandler.customError(
          req,
          res,
          err,
          "token.auth.unauthorizeToken",
          APIstatusCodes[401]
        );
      }
      req.userId = decoded.userId;
      next();
    });
  };