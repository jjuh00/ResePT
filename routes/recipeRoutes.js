import express from "express";
import { addRecipe, searchRecipes, getUserRecipes } from "../controllers/recipeController.js";

const router = express.Router();

// Reseptin lisäysreitti
router.post("/add", addRecipe);

// Reseptien hakureitti
router.get("/search", searchRecipes);

// Käyttäjän reseptien hakureitti
router.get("/user/:userId", getUserRecipes);

export default router;