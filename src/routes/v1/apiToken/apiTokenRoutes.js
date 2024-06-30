import express from "express";
import { APIstatusCodes } from "../../../utils/constants.js";
import { responseHandler } from "../../../utils/responseHandler.js";
import { methodNotAllowed } from "../../../middlewares/methodNotAllowedMiddleware.js";
import { generateSandboxToken,generateLiveToken,getSandboxKeys,getLiveKeys } from "../../../controllers/apiToken/apiTokenController.js";

const apiTokenRouter = express.Router();

apiTokenRouter
  .route("/generate-sandbox-details")
  .post(generateSandboxToken)
  .all(methodNotAllowed);

apiTokenRouter
  .route("/generate-live-details")
  .post(generateLiveToken)
  .all(methodNotAllowed);

apiTokenRouter.route('/get-sandbox-keys').get(getSandboxKeys).all(methodNotAllowed);
apiTokenRouter.route('/get-live-keys').get(getLiveKeys).all(methodNotAllowed);


export default apiTokenRouter;
