import express from "express";
import { APIstatusCodes } from "../../../utils/constants.js";
import { responseHandler } from "../../../utils/responseHandler.js";
import { methodNotAllowed } from "../../../middlewares/methodNotAllowedMiddleware.js";
import { generateSanboxToken,generateLiveToken } from "../../../controllers/apiToken/apiTokenController.js";

const apiTokenRouter = express.Router();

apiTokenRouter
  .route("/generate-sanbox-details")
  .get(generateSanboxToken)
  .all(methodNotAllowed);

apiTokenRouter
  .route("/generate-live-details")
  .get(generateLiveToken)
  .all(methodNotAllowed);


export default apiTokenRouter;
