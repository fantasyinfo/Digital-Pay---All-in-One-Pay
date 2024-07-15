import express from "express";
import { methodNotAllowed } from "../../../../middlewares/methodNotAllowedMiddleware.js";
import { addDomains, getAllDomains } from "../../../../controllers/dashboard/domain/dashboard.domain.controller.js";

const domainsRouter = express.Router();

domainsRouter.route("/add-domains").post(addDomains).all(methodNotAllowed);
domainsRouter.route("/get-all-domains").post(getAllDomains).all(methodNotAllowed);

export default domainsRouter;
