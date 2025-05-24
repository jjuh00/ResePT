import { fileURLToPath } from "url";
import path from "path";
import multer from "multer";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve("db.json");
const uploadPath = path.join(__dirname, "..", "public", "images");

// Valmistellaan Multer kuvien latausta varten
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Vain kuvatiedostot ovat sallittuja"), false);
        }
    }
}).single("image");

// Ohjain reseptin lisäämiseen
const addRecipe = async (req, res) => {
    upload(req, res, async (error) => {
        if (error) {
            return res.status(400).json({ success: false, message: "Virhe kuvan lataamisessa: " + error.message });
        }

        try {
            const { name, ingredients, steps, tags, authorId, servingSize, preparationTime } = req.body;

            const parsedIngredients = JSON.parse(ingredients);
            const parsedSteps = JSON.parse(steps);
            const parsedTags = JSON.parse(tags);

            if (!name || !ingredients || !steps || !authorId || !servingSize || !preparationTime) {
                return res.status(400).json({ success: false, message: "Pakollisia tietoja puuttuu" });
            }

            if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0 ||
                !Array.isArray(parsedSteps) || parsedSteps.length === 0) {
                return res.status(400).json({ success: false, message: "Ainesosat ja valmistusvaiheet ovat pakollisia" });
            }

            const servSize = parseInt(servingSize);
            const prepTime = parseInt(preparationTime);

            if (servSize < 1 || servSize > 10) {
                return res.status(400).json({ success: false, message: "Annosten määrä pitää olla 1 ja 10 välillä" });
            }

            if (prepTime < 1 || prepTime > 1000) {
                return res.status(400).json({ success: false, message: "Valmistusajan pitää olla 1 ja 1000 minuutin välillä" });
            }

            const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));

            const user = db.users.find(u => u.id === authorId);
            if (!user) {
                return res.status(400).json({ success: false, message: "Käyttäjää ei löytynyt" });
            }

            const recipe = {
                id: uuidv4(),
                name: name.trim(),
                ingredients: parsedIngredients,
                steps: parsedSteps,
                tags: Array.isArray(parsedTags) ? parsedTags : [],
                servingSize: servSize,
                preparationTime: prepTime,
                authorId,
                authorName: user.username,
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString(),
                imagePath: req.file ? req.file.filename : ""
            };
            
            db.recipes.push(recipe);
            await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

            res.json({ success: true, message: "Resepti lisätty onnistuneesti", recipeId: recipe.id });
        } catch (err) {
            res.status(500).json({ success: false, message: "Palvelinvirhe: " + err.message });
        }
    });
};

// Ohjain reseptien hakuun
const searchRecipes = async (req, res) => {
    try {
        const { query, tags } = req.query;
        const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));
        let recipes = db.recipes;

        if (query && query.trim()) {
            const searchTerm = query.toLowerCase().trim()
            recipes = recipes.filter(recipe =>
                recipe.name.toLowerCase().includes(searchTerm) ||
                recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        if (tags && tags.trim()) {
            const searchTags = tags.split(",").map(tag => tag.trim());
            recipes = recipes.filter(recipe =>
                searchTags.every(searchTag => recipe.tags.some(tag => tag === searchTag))
            );
        }

        // Palautetaan hakua vastaavat reseptit
        const searchResults = recipes.map(recipe => ({
            id: recipe.id,
            name: recipe.name,
            tags: recipe.tags,
            servingSize: recipe.servingSize,
            preparationTime: recipe.preparationTime,
            authorName: recipe.authorName,
            dateCreated: recipe.dateCreated,
            imagePath: recipe.imagePath
        }));

        res.json({ success: true, recipes: searchResults });
    } catch (error) {
        res.status(500).json({ success: false, message: "Palvelinvirhe: " + error.message });
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
            servingSize: recipe.servingSize,
            preparationTime: recipe.preparationTime,
            authorName: recipe.authorName,
            dateCreated: recipe.dateCreated,
            imagePath: recipe.imagePath
        }));

        res.json({ success: true, recipes: recipeList });
    } catch (error) {
        res.status(500).json({ success: false, message: "Palvelinvirhe: " + error.message });
    }
};

export { addRecipe, searchRecipes, getUserRecipes };