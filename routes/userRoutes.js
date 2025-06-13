import express from "express";
import { 
    login, 
    register,
    verifyPassword,
    updateUser, 
    deleteUser, 
    getUserProfile 
} from "../controllers/userController.js";

const router = express.Router();

// Kirjautumisreitti
router.post("/login", login);

// Rekisteröitymisreitti
router.post("/register", register);

// Salasanan tarkistusreitti
router.post("/verify", verifyPassword);

// Käyttäjän muokkausreitti
router.put("/update/:userId", updateUser);

// Käyttäjän poistamisreitti
router.delete("/delete/:userId", deleteUser);

// Käyttäjätietojen reitti
router.get("/user/:userId", getUserProfile);

export default router;