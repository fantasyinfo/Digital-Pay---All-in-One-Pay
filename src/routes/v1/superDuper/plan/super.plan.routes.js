import express from "express";
import { methodNotAllowed } from "../../../../middlewares/methodNotAllowedMiddleware.js";
import {
  addNewPlan,
  fetchAllPlan,
} from "../../../../controllers/superDuper/plan/super.plan.controller.js";
import { validateSuperDuper } from "../../../../middlewares/superDuperMiddleware.js";

const superPlanRouter = express.Router();

// super duper admin routes
superPlanRouter
  .route("/add-new-plan")
  .post(validateSuperDuper, addNewPlan)
  .all(methodNotAllowed);



// normal
superPlanRouter
  .route("/fetch-all-plan")
  .get(fetchAllPlan)
  .all(methodNotAllowed);

export default superPlanRouter;
