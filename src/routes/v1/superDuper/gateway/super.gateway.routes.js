import express from "express";
import { methodNotAllowed } from "../../../../middlewares/methodNotAllowedMiddleware.js";
import { addNewGateway } from "../../../../controllers/superDuper/gateway/super.gateway.controller.js";

const superGatewayRouter = express.Router();

superGatewayRouter
  .route("/add-new-gateway")
  .post(addNewGateway)
  .all(methodNotAllowed);

  export default superGatewayRouter;