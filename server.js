import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Väliohjelmisto
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Reitit
app.use("/authentication", userRoutes);
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

// Tarjoillaan reseptin muokkaussivua
app.get("/pages/edit-recipe.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "pages", "edit-recipe.html"));
});

// Tarjoillaan käyttäjän profiilisivua
app.get("/pages/user-page.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "pages", "user-recipes.html"))
});

// Tarjoillaan reseptin hakusivua
app.get("/pages/search-page.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "pages", "search-page.html"));
});

// Tarjoillaan reseptin näkymäsivua
app.get("/pages/recipe-view.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "pages", "recipe-view.html"));
});

// Tarjoillaan käyttäjän suosikkireseptien sivua
app.get("/pages/favourites.html", (req, res) => {
    res.sendFile(__dirname, "public", "pages", "favourites.html");
});

// Käsitellään 404-virheet
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, "public", "pages", "error-404.html"));
});

// Käsitellään 503-virheet
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(503).sendFile(path.join(__dirname, "public", "pages", "error-503.html"));
});

// Käynnistetään palvelin
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Palvelin on käynnissä portissa ${PORT}`);
});