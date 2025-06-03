import { Router } from "express";
import { login, registro, exchangeWhoopToken, refreshWhoopToken } from "../controllers/auth.controllers.js";
import { proxyWhoopRequest } from "../controllers/whoop.controllers.js";

const router = Router();

router.post("/login", login);

router.post("/registro", registro);

router.post('/whoop/token', exchangeWhoopToken);

router.post('/whoop/refresh', refreshWhoopToken);

// New proxy routes for WHOOP API
router.get('/whoop/sleep', proxyWhoopRequest);
router.get('/whoop/recovery', proxyWhoopRequest);
router.get('/whoop/cycle', proxyWhoopRequest);
router.get('/whoop/workout', proxyWhoopRequest);
router.get('/whoop/profile', proxyWhoopRequest);

export default router;
