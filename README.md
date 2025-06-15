# ResePT

**ResePT** on reseptien hallintasovellus, jossa käyttäjät voivat selata, lisätä, muokata ja tallentaa reseptejä.

## Projektin tarkoitus

Tämän projektin tarkoituksena oli harjoitella seuraavien teknologioiden käyttöä:

- HTML & CSS: Käyttöliittymä <br />
- JavaScript: Toiminnallisuus <br />
- Node.js + Express.js: Palvelinpuoli

## Hakemistorakenne
ResePT/ <br />
db.json <br />
server.js <br />
package.json <br />
routes/ <br />
... <br />
controllers/ <br />
public/ <br />
index.html <br />
pages/ <br />
... <br />
styles/ <br />
... <br />
scripts/ <br />
... <br />

## Kuinka ohjelma toimii?
1. Käynnistä Express.js-pavelin (alla ohje).
2. Avaa selaimessa osoite `http://localhost:<PORTTI>`. Katso portti kohdasta Asennus ja käyttöönotto.
3. Käyttäjät voivat:
    - Rekisteröityä/kirjautua sisään. On myös mahdollista olla tekemättä käyttäjää, mutta käyttäjän oikeudet ovat tällöin rajalliset.
    - Lisätä reseptejä.
    - Muokata tai poistaa omia reseptejään.
    - Selailla reseptejä
    - Merkitä reseptejä suosikeiksi

Sovelluksessa * tarkoittaa pakollista kohtaa.

## Asennus ja käyttöönotto
1. Kloonaa projekti.
2. Asenna tarvittavat paketit: Anna ./ResePT-hakemistossa komentokehotteessa komento npm install
3. Käynnistä palvelin: Anna ./ResePT-hakemistossa komentokehotteessa komento npm start
4. Tarkista tai muuta käytössä oleva portti tiedostosta server.js:
const PORT = process.env.PORT || 3002;
→ Voit vaihtaa portin numeroa, jos haluat.

## Tulevaisuuden kehitysideoita
Projektiin on tulossa seuraavaksi yksikkötestit ja testausautomaatio. Lisäksi projektiin on suunnitteilla seuraavat ominaisuudet, jos niihin riitää tarpeeksi aikaa, osaamista ja motivaatiota
- Reseptien arvostelut ja kommentointi
- Filtterit reseptien hakuun esimerkiksi arvoisteluiden, tagien, valmistusajan tai annoskoon mukaan
