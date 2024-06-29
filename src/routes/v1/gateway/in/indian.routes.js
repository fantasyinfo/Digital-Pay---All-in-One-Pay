import express from "express";
import { methodNotAllowed } from "../../../../middlewares/methodNotAllowedMiddleware.js";

const gatewayRouter = express.Router();

gatewayRouter
  .route("/init")
  .post((req, res) =>

    res.status(200).json({ "status": "success", "data": req.client })
  )
  .all(methodNotAllowed);

export default gatewayRouter;
