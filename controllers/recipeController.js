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

            // Tarkistus
            if (!name || name.length < 2 || name.length > 60) {
                return res.status(400).json({ success: false, message: "Reseptin nimen pitää olla 2-60 merkki" });
            }
            if (!ingredients || !steps || !authorId || !servingSize || !preparationTime) {
                return res.status(400).json({ success: false, message: "Pakollisia tietoja puuttuu" });
            }
            if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0 ||
                !Array.isArray(parsedSteps) || parsedSteps.length === 0) {
                return res.status(400).json({ success: false, message: "Ainesosat ja valmistusvaiheet ovat pakollisia tietoja" });
            }
            if (parsedIngredients.some(ing => !ing.amountAndUnit || !ing.ingredientName ||
                ing.amountAndUnit.length > 15 || ing.ingredientName.length > 50)) {
                return res.status(400).json({ success: false, message: "Virheellinen ainesosa" });
            }
            if (parsedSteps.some(step => step.length > 600)) {
                return res.status(400).json({ success: false, message: "Valmistusvaihe on liian pitkä" });
            }
            if (!Array.isArray(parsedTags)) {
                return res.status(400).json({ success: false, message: "Tagien pitää olla lista" });
            }

            const servSize = parseInt(servingSize);
            const prepTime = parseInt(preparationTime);

            if (servSize < 1 || servSize > 20) {
                return res.status(400).json({ success: false, message: "Annosten määrä pitää olla 1 ja 20 välillä" });
            }

            if (prepTime < 1 || prepTime > 1000) {
                return res.status(400).json({ success: false, message: "Valmistusajan pitää olla 1 ja 1000 minuutin välillä" });
            }

            const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));

            const user = db.users.find(u => u.id === authorId);
            if (!user) {
                return res.status(404).json({ success: false, message: "Käyttäjää ei löytynyt" });
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

        } catch (error) {
            res.status(500).json({ success: false, message: "Palvelinvirhe: " + error.message });
        }
    });
};

// Ohjain olemassaolevan reseptin päivittämiseen
const updateRecipe = async (req, res) => {
    upload(req, res, async (error) => {
        if (error) {
            return res.status(400).json({ success: false, message: "Virhe kuvan lataamisessa: " + error.message });
        }

        try {
            const { recipeId } = req.params;
            const { name, ingredients, steps, tags, authorId, servingSize, preparationTime } = req.body;

            const parsedIngredients = JSON.parse(ingredients);
            const parsedSteps = JSON.parse(steps);
            const parsedTags = JSON.parse(tags);

            // Tarkistus
            if (!name || name.length < 2 || name.length > 60) {
                return res.status(400).json({ success: false, message: "Reseptin nimen pitää olla 2-60 merkkiä "});
            }
            if (!ingredients || !steps || !authorId || !servingSize || !preparationTime) {
                return res.status(400).json({ success: false, message: "Pakollisia tietoja puuttuu" });
            }
            if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0 || 
                !Array.isArray(parsedSteps) || parsedSteps.length === 0) {
                return res.status(400).json({ success: false, message: "Ainesosat ja valmistusvaiheet ovat pakollisia tietoja" });
            }
            if (parsedIngredients.some(ing => !ing.amountAndUnit || !ing.ingredientName ||
                ing.amountAndUnit.length > 15 || ing.ingredientName.length > 50)) {
                return res.status(400).json({ success: false, message: "Virheellinen ainesosa" });
            }
            if (parsedSteps.some(step => step.length > 600)) {
                return res.status(400).json({ success: false, message: "Valmistusvaihe on liian pitkä" });
            }
            if (!Array.isArray(parsedTags)) {
                return res.status(400).json({ success: false, message: "Tagien pitää olla lista" });
            }

            const servSize = parseInt(servingSize);
            const prepTime = parseInt(preparationTime);

            if (servSize < 1 || servSize > 20) {
                return res.status(400).json({ success: false, message: "Annosten määrä pitää olla 1 ja 20 välillä" });
            }
            
            if (prepTime < 1 || prepTime > 1000) {
                return res.status(400).json({ success: false, message: "Valmistusajan pitää olla 1 ja 1000 minuutin välillä" });
            }

            const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));
            const recipeIndex = db.recipes.findIndex(r => r.id === recipeId);

            if (recipeIndex === -1) {
                return res.status(404).json({ success: false, message: "Reseptiä ei löytynyt" });
            }

            if (db.recipes[recipeIndex].authorId !== authorId) {
                return res.status(403).json({ success: false, message: "Ei oikeutta muokata reseptiä (et ole reseptin tekijä)" });
            }

            // Poistetaan edellinen kuva, jos uusi kuva ladataan
            if (req.file && db.recipes[recipeIndex].imagePath) {
                await fs.unlink(path.join(uploadPath, db.recipes[recipeIndex].imagePath)).catch(() => {});
            }

            // Ladataan kuva
            db.recipes[recipeIndex] = {
                ...db.recipes[recipeIndex],
                name: name.trim(),
                ingredients: parsedIngredients,
                steps: parsedSteps,
                tags: parsedTags,
                servingSize: servSize,
                preparationTime: prepTime,
                dateModified: new Date().toISOString(),
                imagePath: req.file ? req.file.filename : db.recipes[recipeIndex].imagePath
            };

            // Päivitetään reseptin tiedot tietokantaan
            await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
            res.json({ success: true });

        } catch (error) {
            res.status(500).json({ success: false, message: "Palvelinvirhe: " + error.message });
        }
    });
};

// Ohjain reseptin poistamiseen
const deleteRecipe = async (req, res) => {
    try {
        const { recipeId } = req.params;
        const { userId } = req.body;
        const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));
        const recipeIndex = db.recipes.findIndex(r => r.id === recipeId);

        if (recipeId === -1) {
            return res.status(404).json({ success: false, message: "Reseptiä ei löytynyt" });
        }

        if (db.recipes[recipeIndex].authorId !== userId) {
            return res.status(403).json({ success: false, message: "Ei oikeutta muokata reseptiä (et ole reseptin tekijä)" });
        }

        // Poistetaan reseptiin liittyvä kuva
        if (db.recipes[recipeIndex].imagePath) {
            await fs.unlink(path.join(uploadPath, db.recipes[recipeIndex].imagePath)).catch(() => {});
        } 

        // Poistetaan resepti tietokannasta
        db.recipes.splice(recipeIndex, 1);
        await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
        res.json({ success: true });

    } catch (error) {
        res.status(500).json({ success: false, message: "Palvelinvirhe: " + error.message });
    }
};

// Ohjain reseptien hakuun
const searchRecipes = async (req, res) => {
    try {
        const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));
        const { query = "" } = req.query;
        const trimmedQuery = query.trim().toLowerCase();
        let filteredRecipes;

        // Palautetaan kaikki reseptit mainPagea varten
        if (!trimmedQuery) {
            filteredRecipes = db.recipes;
        } else {
            // Suodatetaan reseptit hakusanan perusteella
            filteredRecipes = db.recipes.filter(recipe => {
                const matchesQuery = trimmedQuery ?
                    recipe.name.toLowerCase().includes(trimmedQuery) : false;

                return (trimmedQuery && matchesQuery); 
            });
        }

        res.json({ success: true, recipes: filteredRecipes });

    } catch (error) {
        res.status(500).json({ success: false, message: "Palvelinvirhe: " + error.message });
    }
};

// Ohjain reseptin tarkasteluun
const viewRecipe = async (req, res) => {
    try {
        const { recipeId } = req.params;
        const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));
        const recipe = db.recipes.find(r => r.id === recipeId);

        if (!recipe) {
            return res.status(404).json({ success: false, message: "Reseptiä ei löytynyt" });
        }

        res.json({
            success: true,
            recipe: {
                id: recipe.id,
                name: recipe.name,
                tags: recipe.tags,
                servingSize: recipe.servingSize,
                preparationTime: recipe.preparationTime,
                authorName: recipe.authorName,
                dateCreated: recipe.dateCreated,
                imagePath: recipe.imagePath,
                ingredients: recipe.ingredients,
                steps: recipe.steps
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Palvelinvirhe: " + error.message });
    }
};

// Ohjain käyttäjän reseptien hakuun
const getUserRecipes = async (req, res) => {
    try {
        const { userId } = req.params;
        const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));

        // Haetaan käyttäjän reseptit tietokannasta
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

// Ohjain reseptin lisäämiseksi suosikkeihin
const addToFavourites = async (req, res) => {
    try {
        const { userId } = req.body;
        const recipeId = req.params.id;
        const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));

        // Haetaan reseptin tiedot tietokannasta
        const recipe = db.recipes.find(r => r.id === recipeId);
        if (!recipe) {
            return res.status(404).json({ success: false, message: "Reseptiä ei löytynyt" });
        }

        if (!recipe.favouritedBy) recipe.favouritedBy = [];
        if (!recipe.favouritedBy.includes(userId)) {
            // Lisätään resepti käyttäjän suosikkeihin
            recipe.favouritedBy.push(userId);
            await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
        }
        res.json({ success: true });

    } catch (error) {
        res.status(500).json({ success: false, message: "Palvelinvirhe: " + error.message });
    }
};

// Ohjain reseptin poistamiseksi suosikeista
const removeFromFavourites = async (req, res) => {
    try {
        const { userId } = req.body;
        const recipeId = req.params.id;
        const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));

        // Haetaan resepti tietokannasta
        const recipe = db.recipes.find(r => r.id === recipeId);
        if (!recipe) {
            return res.status(404).json({ success: false, message: "Reseptiä ei löytynyt" });
        }

        if (recipe.favouritedBy) {
            // Poistetaan resepti käyttäjän suosikeista
            recipe.favouritedBy = recipe.favouritedBy.filter(id => id !== userId);
            await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
        }
        res.json({ success: true });

    } catch (error) {
        res.status(500).json({ success: false, message: "Palvelinvirhe: " + error.message });
    }
};

// Ohjain käyttäjän suosikkireseptien hakuun
const getUserFavourites = async (req, res) => {
    try {
        const userId = req.params.id;
        const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));

        // Haetaan käyttäjän suosikkireseptit tietokannasta
        const recipes = db.recipes.filter(r => r.favouritedBy?.includes(userId));
        res.json({ success: true, recipes });
    } catch (error) {
        res.status(500).json({ success: false, message: "Palvelinvirhe: " + error.message });
    }
};

export { 
    addRecipe, 
    updateRecipe,
    deleteRecipe,
    searchRecipes, 
    viewRecipe, 
    getUserRecipes, 
    addToFavourites,
    removeFromFavourites,
    getUserFavourites
};