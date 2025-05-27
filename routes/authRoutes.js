import express from "express";
import { login, register, getUserProfile } from "../controllers/authController.js";

const router = express.Router();

// Kirjautumisreitti
router.post("/login", login);

// Rekisteröitymisreitti
router.post("/register", register);

// Käyttäjätietojen reitti
router.get("/user/:userId", getUserProfile);

export default router;