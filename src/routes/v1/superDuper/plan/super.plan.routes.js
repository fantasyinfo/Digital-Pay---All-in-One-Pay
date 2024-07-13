import express from "express";
import { methodNotAllowed } from "../../../../middlewares/methodNotAllowedMiddleware.js";
import { addNewPlan } from "../../../../controllers/superDuper/plan/super.plan.controller.js";


const superPlanRouter = express.Router();

superPlanRouter.route("/add-new-plan").post(addNewPlan).all(methodNotAllowed);

export default superPlanRouter;
