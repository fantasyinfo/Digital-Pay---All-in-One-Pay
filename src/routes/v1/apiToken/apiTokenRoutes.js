import express from "express";
import { APIstatusCodes } from "../../../utils/constants.js";
import { responseHandler } from "../../../utils/responseHandler.js";
import { methodNotAllowed } from "../../../middlewares/methodNotAllowedMiddleware.js";

const apiTokenRouter = express.Router();

apiTokenRouter
  .route("/generate-sanbox-details")
  .get((req, res) => {
    res.json({
      message: "Access granted to protected route.",
      userId: req.userId,
    });
  })
  .all(methodNotAllowed);

export default apiTokenRouter;
