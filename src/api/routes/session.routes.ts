import { Router } from "express";
import { SessionController } from "../controllers/session.controller";

const router = Router()

router.post("/start", SessionController.startSession);
router.post("/stop", SessionController.stopSession);
router.get("/status", SessionController.getStatus);
router.post("/upload-bhav", SessionController.uploadMiddleware, SessionController.uploadBhavCopy);

export default router;
