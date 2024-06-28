import { APIstatusCodes } from "../utils/constants.js";
import { responseHandler } from "../utils/responseHandler.js";

export const methodNotAllowed = (req, res) => {
    return responseHandler.customError(
      req,
      res,
      req.method.toUpperCase(),
      'methodNotAllowed',
      APIstatusCodes[405]
    );
  };
