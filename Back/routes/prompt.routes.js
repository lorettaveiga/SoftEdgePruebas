import express from "express";
import { savePrompt, getPromptsByUser } from "../controllers/prompt.controllers.js";

const router = express.Router();

// Ruta para guardar un nuevo prompt
router.post("/history", savePrompt);

// Ruta para obtener prompts por usuario
router.get("/history/:userId", getPromptsByUser);

export default router;