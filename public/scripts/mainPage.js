$(document).ready(function() {
    // Asetetaan "logout-button" -napin teksti riippuen, onko käyttäjä kirjautuneena sisään vai ei
    const id = localStorage.getItem("id");
    $("#logout-button").text(id ? "Kirjaudu ulos" : "Takaisin kirjautumissivulle");


    // Näytetään navigointipainikkeet vain kirjautuneille käyttäjille
    if (id) {
        $("#add-new-recipe-link").removeClass("d-none");
        $("#user-recipes-link").removeClass("d-none");
    }

    // Käsitellään "logout-button" -napin klikkaus
    $("#logout-button").click(function() {
        // Tyhjennetään kaikki tallennetut käyttäjätiedot (esim. käyttäjäid localStoragessa)
        localStorage.removeItem("id");
        // Uudelleenohjataan index.html:ään
        window.location.href = "/index.html";
    });

    // Käsitellään reseptien haku
    $(".search-form").submit(function(e) {
        e.preventDefault();
        const query = $("#search-input").val().trim();

        if(!query) {
            alert("Syötä hakusana");
            return;
        }

        $.ajax({
            url: `/recipes/search?query=${encodeURIComponent(query)}`,
            method: "GET",
            success: function(response) {
                if (response.success && response.recipes) {
                    displaySearchResults(response.recipes);
                } else {
                    $("#recipe-results").html('<option value="" disabled>Virhe reseptien haussa</option>');
                }
            },
            error: (function() {
                $("#recipe-results").html('<option value="" disabled>Palvelimeen yhdistäminen epäonnistui</option>');
            })
        });
    });

    // Näytetään hakutulokset select-valikossa
    function displaySearchResults(recipes) {
        let html = "";
        if (recipes.length === 0) {
            html = '<option value="" disabled>Ei tuloksia</option>';
        } else {
            recipes.forEach(recipe => {
                const tagsText = recipe.tags.length > 0 ? recipe.tags.join(", ") : "Ei tageja";
                html += `<option value="${recipe.id}" disabled>${recipe.name} (Tagit: ${tagsText}, tekijä: ${recipe.authorName})</option>`;
            });
        }
        $("#recipe-results").html(html);
    }
});