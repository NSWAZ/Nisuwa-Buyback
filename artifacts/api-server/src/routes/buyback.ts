import { Router, type IRouter } from "express";
import { GetBuybackRatesResponse } from "@workspace/api-zod";
import {
  BUYBACK_RATES,
  DEFAULT_BUYBACK_RATE,
} from "../lib/buyback-rates.js";

const router: IRouter = Router();

router.get("/buyback/rates", (_req, res): void => {
  const result = GetBuybackRatesResponse.parse({
    defaultRate: DEFAULT_BUYBACK_RATE,
    rates: BUYBACK_RATES.map((r) => ({
      groupName: r.groupName,
      rate: r.rate,
    })),
  });
  res.json(result);
});

export default router;
