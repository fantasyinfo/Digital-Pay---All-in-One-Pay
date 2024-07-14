import express from "express";
import { methodNotAllowed } from "../../../../middlewares/methodNotAllowedMiddleware.js";
import { addNewPlan,fetchAllPlan } from "../../../../controllers/superDuper/plan/super.plan.controller.js";


const superPlanRouter = express.Router();

superPlanRouter.route("/add-new-plan").post(addNewPlan).all(methodNotAllowed);
superPlanRouter.route("/fetch-all-plan").post(fetchAllPlan).all(methodNotAllowed);

export default superPlanRouter;
