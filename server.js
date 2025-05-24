import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/authRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Väliohjelmisto
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Reitit
app.use("/authentication", authRoutes);
app.use("/recipes", recipeRoutes);

// Tarjoillaan kirjautumissivua
app.get("/index.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
})

// Tarjoillaan pääsivua
app.get("/pages/main-page.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "pages", "main-page.html"));
});

// Tarjoillaan reseptin lisäyssivua
app.get("/pages/add-recipe.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "pages", "add-recipe.html"));
});

// Tarjoillaan käyttäjän reseptisivua
app.get("/pages/user-recipes.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "pages", "user-recipes.html"))
});

// Käynnistetään palvelin
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Palvelin on käynnissä portissa ${PORT}`);
})