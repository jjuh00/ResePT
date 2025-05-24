import path from "path";
import fs from "fs/promises";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const dbPath = path.resolve("db.json");

// Kirjautumisohjain
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Tarkistus
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

        // Lisätään uusi käyttäjä tietokantaan
        db.users.push({ id: uuidv4(), username, email, password: hashedPassword });
        await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

        res.json({ success: true, message: "Rekisteröityminen onnistui", id: id });
    } catch (error) {
        res.status(500).json({ success: false, message: "Palvelinvirhe: " + error.message });
    }
};

export { login, register };