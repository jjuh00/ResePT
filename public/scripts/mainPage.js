$(document).ready(function() {
    // Asetetaan "logout-button" -napin teksti riippuen, onko käyttäjä kirjautuneena sisään vai ei
    const id = localStorage.getItem("id");
    $("#logout-button").text(id ? "Kirjaudu ulos" : "Takaisin kirjautumissivulle");


    // Näytetään navigointipainikkeet vain kirjautuneille käyttäjille
    if (id) {
        $("#add-new-recipe-link").removeClass("d-none");
        $("#user-recipes-link").removeClass("d-none");
    }

    let selectedSearchTags = [];

    // Käsitellään hakutagien valinta
    $("#save-search-tags-button").click(function() {
        selectedSearchTags = [];
        $("input.form-check-input:checked").each(function() {
            const searchTagValue = $(this).val(); // Reseptin tagin input arvo, esim. t1
            const searchTagLabelText = $(`label[for="${$(this).attr("id")}"]`).text(); // Checkboxia vastaava label, esim. air fryer
            selectedSearchTags.push({ value: searchTagValue, label: searchTagLabelText });
        });
        const searchLabelList = selectedSearchTags.map(t => t.label);
        $(".recipes-list").text(searchLabelList.length > 0 ? `Valitut tagit: ${searchLabelList.join(", ")}` :
        "Ei valittuja tageja"); // Näytetään tagin teksti (input arvon sijasta)
        $("#search-tags-modal").modal("hide");
    });

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
        const url = `/recipes/search?query=${encodeURIComponent(query)}&
        tags=${encodeURIComponent(selectedSearchTags.join(", "))}`;

        $.ajax({
            url: url,
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
                html += `<option value="${recipe.id}" disabled>${recipe.name} (Tagit;
                ${tagsText}, tekijä: ${recipe.authorName}, annokset: ${recipe.servingSize},
                aika: ${recipe.preparationTime} min)</option>`;
            });
        }
        $("#recipe-results").html(html);
    }
});