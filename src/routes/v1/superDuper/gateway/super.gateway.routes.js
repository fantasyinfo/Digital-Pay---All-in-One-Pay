import express from "express";
import { methodNotAllowed } from "../../../../middlewares/methodNotAllowedMiddleware.js";
import { addNewGateway,fetchAllGateway } from "../../../../controllers/superDuper/gateway/super.gateway.controller.js";
import { validateSuperDuper } from "../../../../middlewares/superDuperMiddleware.js";

const superGatewayRouter = express.Router();

// super duper ruoutes
superGatewayRouter
  .route("/add-new-gateway")
  .post(validateSuperDuper,addNewGateway)
  .all(methodNotAllowed);


  // normal routes
  superGatewayRouter
  .route("/fetch-all-gateway")
  .get(fetchAllGateway)
  .all(methodNotAllowed);


  export default superGatewayRouter;