import express from "express";
import { methodNotAllowed } from "../../../../middlewares/methodNotAllowedMiddleware.js";
import { addNewGateway,fetchAllGateway } from "../../../../controllers/superDuper/gateway/super.gateway.controller.js";

const superGatewayRouter = express.Router();

superGatewayRouter
  .route("/add-new-gateway")
  .post(addNewGateway)
  .all(methodNotAllowed);

  superGatewayRouter
  .route("/fetch-all-gateway")
  .post(fetchAllGateway)
  .all(methodNotAllowed);


  export default superGatewayRouter;