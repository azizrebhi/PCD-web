import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { handleWebRTCSignaling } from "../Controllers/webrtc.controller.js";

const router = express.Router();

// HTTP endpoint for WebRTC signaling (optional fallback)
router.post("/signal", verifyToken, handleWebRTCSignaling);

export default router;