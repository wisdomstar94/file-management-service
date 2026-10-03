import { Router } from "express";
import { generateCommonRes } from "../../utils/generate-common-res/index.js";
import { adminRouter } from "./admin-router/index.js";
import { publicRouter } from "./public-router/index.js";

const router = Router();

router.get("/health", (_, res) => {
  res.json(generateCommonRes({ status: "ok" }));
});

// /api/admin/**/*
router.use("/admin", adminRouter);

// /api/public/**/*
router.use("/public", publicRouter);

export const apiRouter = router;
