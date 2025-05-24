import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "..", "db.json");

// Ohjaus reseptin lisäämiseen
const addRecipe = async (req, res) => {
    try {
        const { name, ingredients, steps, tags, authorId } = req.body;

        // Tarkistus
        if (!name || !ingredients || !steps || !authorId) {
            return res.status(400).json({ success: false, message: "Pakollisia tietoja puuttuu" });
        }

        if (!Array.isArray(ingredients) || ingredients.length === 0 || !Array.isArray(steps) || steps.length === 0) {
            return res.status(400).json({ success: false, message: "Ainesosat ja vaiheet ovat pakollisia" });
        }

        const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));

        // Tarkistetaan, että käyttäjä on olemassa
        const user = db.users.find(u => u.id === authorId);
        if (!user) {
            return res.status(400).json({ success: false, message: "Käyttäjää ei löytynyt" });
        }

        // Luodaan uusi resepti
        const recipe = {
            id: uuidv4(),
            name: name.trim(),
            ingredients,
            steps,
            tags: Array.isArray(tags) ? tags : [],
            authorId,
            authorName: user.username,
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString()
        };

        db.recipes.push(recipe);
        await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

        res.json({ success: true, message: "Resepti lisätty onnistuneesti", recipeId: recipe.id });
    } catch (error) {
        res.status(500).json({ success: false, message: "Palvelinvirhe" })
    }
};

// Ohjain reseptien hakuun
const searchRecipes = async (req, res) => {
    try {
        const { query } = req.query;
        const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));
        
        let recipes = db.recipes;

        if (query && query.trim()) {
            const searchTerm = query.toLowerCase().trim()
            recipes = recipes.filter(recipe =>
                recipe.name.toLowerCase().includes(searchTerm) ||
                recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // Palautetaan vain tarvittavat tiedot
        // Tämä on vain väliaikainen ratkaisu
        const searchResults = recipes.map(recipe => ({
            id: recipe.id,
            name: recipe.name,
            tags: recipe.tags,
            authorName: recipe.authorName,
            dateCreated: recipe.dateCreated
        }));

        res.json({ success: true, recipes: searchResults });
    } catch (error) {
        res.status(500).json({ success: false, message: "Palvelinvirhe" });
    }
};

// Ohjain käyttäjän reseptien hakemiselle
const getUserRecipes = async (req, res) => {
    try {
        const { userId } = req.params;
        const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));

        const userRecipes = db.recipes.filter(recipe => recipe.authorId === userId);

        const recipeList = userRecipes.map(recipe => ({
            id: recipe.id,
            name: recipe.name,
            tags: recipe.tags,
            dateCreated: recipe.dateCreated,
            dateModified: recipe.dateModified
        }));

        res.json({ success: true, recipes: recipeList });
    } catch (error) {
        res.status(500).json({ success: false, message: "Palvelinvirhe" });
    }
};

export { addRecipe, searchRecipes, getUserRecipes };