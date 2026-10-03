import { Router } from "express";
import { publicShareLinksRouter } from "./share-links-router/index.js";

const router = Router();

// /api/public/share-links/**/*
router.use("/share-links", publicShareLinksRouter);

export const publicRouter = router;
