import { Router } from "express";
import { accessPolicyMiddleware } from "../../../middlewares/access-policy-middleware/index.js";
import { adminAuthMiddleware } from "../../../middlewares/admin-auth-middleware/index.js";
import { accessPolicyGroupsRouter } from "./access-policy-groups-router/index.js";
import { accountsRouter } from "./accounts-router/index.js";
import { authRouter } from "./auth-router/index.js";
import { documentsRouter } from "./documents-router/index.js";
import { permissionGroupsRouter } from "./permission-groups-router/index.js";
import { permissionsRouter } from "./permissions-router/index.js";

const router = Router();

// /api/admin/auth/**/*
router.use("/auth", authRouter);

// 아래 라우트는 로그인 + 접근 정책 통과가 필요하다.
router.use(adminAuthMiddleware, accessPolicyMiddleware);

// /api/admin/documents/**/*
router.use("/documents", documentsRouter);

// /api/admin/accounts/**/*
router.use("/accounts", accountsRouter);

// /api/admin/permissions/**/*
router.use("/permissions", permissionsRouter);

// /api/admin/permission-groups/**/*
router.use("/permission-groups", permissionGroupsRouter);

// /api/admin/access-policy-groups/**/*
router.use("/access-policy-groups", accessPolicyGroupsRouter);

export const adminRouter = router;
