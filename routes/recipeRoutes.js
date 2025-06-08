import express from "express";
import {
    addRecipe,
    updateRecipe,
    deleteRecipe, 
    searchRecipes, 
    getUserRecipes, 
    viewRecipe, 
    addToFavourites, 
    removeFromFavourites, 
    getUserFavourites 
} from "../controllers/recipeController.js";

const router = express.Router();

// Reseptin lisäysreitti
router.post("/add", addRecipe);

// Reseptin päivitysreitti
router.put("/update/:recipeId", updateRecipe);

// Reseptin poistamisreitti
router.delete("/delete/:recipeId", deleteRecipe);

// Reseptien hakureitti
router.get("/search", searchRecipes);

// Käyttäjän reseptien hakureitti
router.get("/user/:userId", getUserRecipes);

// Reseptin näkymäreitti
router.get("/view/:recipeId", viewRecipe)

//Suosikkireseptin lisäämisreitti
router.post("/favourites/:id", addToFavourites);

// Suosikkireseptin poistamisreitti
router.delete("/favourites/:id", removeFromFavourites);

// Käyttäjän suosikkireseptien hakureitti
router.get("/favourites/user/:id", getUserFavourites);

export default router;