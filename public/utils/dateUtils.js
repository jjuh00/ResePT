/*
    Päivämäärän muotoilu:
    - Näytetään "tänään" tai "eilen" teksti sekä kellonaika (Tänään/Eilen klo hh.mm), jos reseptin lisättiin tänään tai eilen
    Sama logiikka pätee, jos sitä muokattiin tänään tai eilen.
    Reseptiä pidetään muokattuna, jos muokattu aika on yli 1 sekunti (1000 ms) lisätyn ajan jälkeen.
    - Jos resepti lisättiin aikaisemmin kuin eilen, näytetään vain päivämäärä (pp.mm.yyyy). Sama logiikka, jos reseptiä muokattiin aikaisemmin kuin eilen.
    - Näytetään "Luotu" tai "Muokattu" teksti ennen pvm:ää, riippuen siitä onko reseptiä muokattu.
*/
function formatRecipeDate(dateCreated, dateModified) {
    const today = new Date();
    const created = new Date(dateCreated);
    const modified = new Date(dateModified);
    const isModified = dateCreated && (modified.getTime() - created.getTime() > 1000); // Reseptiä pidetään muokattuna, jos muokattu pvm väh. 1 sekunti lisätty pvm jälkeen

    const baseDate = isModified ? modified : created;
    const prefix = isModified ? "Muokattu" : "Luotu";

    const isToday = baseDate.toDateString() === new Date().toDateString();
    const isYesterDay = baseDate.toDateString() === new Date(Date.now() - 86400000).toDateString();

    if (isToday) {
        return `${prefix}: Tänään ${baseDate.toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (isYesterDay) {
        return `${prefix}: Eilen ${baseDate.toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" })}`;
    } else {
        return `${prefix}: ${baseDate.toLocaleDateString("fi-FI")}`;
    }
}

export { formatRecipeDate };