import path from "path";
import fs from "fs/promises";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const dbPath = path.resolve("db.json");

// Kirjautumisohjain
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Käyttäjänimi tai salasana puuttuu" });
        }

        const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));
        const user = db.users.find((u) => u.username === username);

        if (!user) {
            return res.status(400).json({ success: false, message: "Käyttäjää ei löytynyt" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Virheellinen salasana" });
        }

        res.json({ success: true, message: "Kirjautuminen onnistui ", id: user.id });
        
    } catch (error) {
        res.status(500).json({ success: false, message: "Palvelinvirhe: " + error.message });
    }
};

// Rekisteröitymisohjain
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));

        if (!username || !password || !email) {
            return res.status(400).json({ success: false, message: "Pakollisia tietoja puuttuu" });
        }

        // Tarkistetaan, että ovatko käyttäjänimi ja sähköposti uniikkeja
        if (db.users.some((u) => u.username === username)) {
            return res.status(400).json({ success: false, message: "Käyttäjänimi on jo käytössä" });
        }
        if (db.users.some((u) => u.email === email)) {
            return res.status(400).json({ success: false, message: "Sähköposti on jo käytössä" });
        }

        // Salataan salasana
        const iterations = 10;
        const hashedPassword = await bcrypt.hash(password, iterations);

        // Luodaan uusi käyttäjä
        const newUser = {
            id: uuidv4(),
            username,
            email,
            password: hashedPassword
        };

        // Lisätään käyttäjä tietokantaan
        db.users.push(newUser);
        await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

        res.json({ success: true, message: "Rekisteröityminen onnistui", id: newUser.id });

    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Palvelinvirhe: " + error.message });
        }
    }
};

// Ohjain salasanan tarkistamisene
const verifyPassword = async (req, res) => {
    try {
        const { id, password } = req.body;

        if (!id || !password) {
            return res.status(400).json({ success: false, message: "Käyttäjän id tai salasana puuttuu" });
        }

        const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));
        const user = db.users.find(u => u.id === id);

        if (!id) {
            return res.status(404).json({ success: false, message: "Käyttäjää ei löytynyt" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Virheellinen salasana" });
        }

        res.json({ success: true });

    } catch (error) {
        res.status(500).json({ success: false, message: "Palvelinvirhe: " + error.message });
    }
};

// Ohjain käyttäjätietojen päivittämiseen
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { currentPassword, username, email, password } = req.body;

        if (!currentPassword) {
            return res.status(400).json({ success: false, message: "Nykyinen salasana puuttuu" })
        }

        const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));
        const userIndex = db.users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ success: false, message: "Käyttäjää ei löytynyt "});
        }

        // Tarkistetaan nykyinen salasana
        const isMatch = await bcrypt.compare(currentPassword, db.users[userIndex].password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Virheellinen salasana" });
        }

        // Tarkistetaan ja päivitetään kentät tarvittaessa (jos kentät ovat muuttuneet)
        if (username) {
            if (db.users.some(u => u.username === username && u.id !== userId)) {
                return res.status(400).json({ success: false, message: "Käyttäjänimi on jo käytössä" });
            }
            db.users[userIndex].username = username;
        }

        if (email) {
            if (db.users.some(u => u.email === email && u.id !== userId)) {
                return res.status(400).json({ success: false, message: "Sähköposti on jo käytössä" });
            }
            db.users[userIndex].email = email;
        }

        if (password) {
            const itrations = 10;
            db.users[userIndex].password = await bcrypt.hash(password, itrations);
        }

        // Päivitetään reseptien tekijän nimi, jos käyttäjänimi vaihtui
        if (username) {
            db.recipes.forEach(recipe => {
                if (recipe.authorId === userId) {
                    recipe.authorName = username;
                }
            });
        }

        // Tallennetaan muutokset tietokantaan
        await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
        res.json({ success: true });

    } catch (error) {
        res.status(500).json({ success: false, message: "Palvelinvirhe: " + error.message });
    }
};

// Ohjain käyttäjän poistamiseen
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { password } = req.body;

        if (!password) {
            await res.status(400).json({ success: false, message: "Salasana puuttuu" });
        }

        const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));
        const userIndex = db.users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ success: false, message: "Käyttäjää ei löytynyt" });
        }

        // Tarkistetaan salasana
        const isMatch = await bcrypt.compare(password, db.users[userIndex].password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Virheellinen salasana" });
        }

        // Poistetaan käyttäjän reseptit ja liittyvät kuvat
        const recipesToDelete = db.recipes.filter(r => r.authorId === userId);
        for (const recipe of recipesToDelete) {
            if (recipe.imagePath) {
                await fs.unlink(path.join(__dirname, "..", "public", "images", recipe.imagePath)).catch(() => {});
            }
        }

        // Poistetaan käyttäjä ja reseptit tietokannasta
        db.recipes = db.recipes.filter(r => r.authorId !== userId);
        db.users.splice(userIndex, 1);

        // Tallennetaan muutokset tietokantaan
        await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
        res.json({ success: true });

    } catch (error) {
        res.status(500).json({ success: false, message: "Palvelinvirhe: " + error.message });
    }
};

// Ohjain käyttäjätietojen hakuun
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));
        const user = db.users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "Käyttäjää ei löytynyt" });
        }

        res.json({ success: true, user: { username: user.username, email: user.email } });

    } catch (error) {
        res.status(500).json({ success: false, message: "Palvelinvirhe: " + error.message });
    }
};

export { 
    login, 
    register, 
    verifyPassword,
    updateUser, 
    deleteUser, 
    getUserProfile 
};