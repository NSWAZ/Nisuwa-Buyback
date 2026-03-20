import { Router, type IRouter } from "express";
import healthRouter from "./health";
import appraiseRouter from "./appraise";
import buybackRouter from "./buyback";

const router: IRouter = Router();

router.use(healthRouter);
router.use(appraiseRouter);
router.use(buybackRouter);

export default router;
