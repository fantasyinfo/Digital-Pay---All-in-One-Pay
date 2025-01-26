import express from "express";
import { methodNotAllowed } from "../../../../middlewares/methodNotAllowedMiddleware.js";
import {
  addDomains,
  getAllDomains,
} from "../../../../controllers/dashboard/domain/dashboard.domain.controller.js";
import { validateSubscription } from "../../../../middlewares/checkActiveSubscriptionMiddleware.js";

const domainsRouter = express.Router();

domainsRouter
  .route("/add-domains")
  .post(validateSubscription, addDomains)
  .all(methodNotAllowed);
domainsRouter
  .route("/get-all-domains")
  .get(getAllDomains)
  .all(methodNotAllowed);

export default domainsRouter;
