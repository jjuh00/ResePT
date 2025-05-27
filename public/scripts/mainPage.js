import { tagMap, renderTagCheckboxes } from "../utils/tagUtils.js";

$(document).ready(function() {
    const id = localStorage.getItem("id");
    let selectedSearchTags = [];

    // Päivitetään navigointipalkin menun sisältö riippuen siitä, onko käyttäjä kirjautunut sisään vai ei
    if (id) {
        $("#add-new-recipe-link").removeClass("d-none");
        $("#user-page-link").removeClass("d-none");
        $("#favourites-link").removeClass("d-none");
        $("#logout-link").removeClass("d-none");
    } else {
        $("#login-link").removeClass("d-none");
    }

    // Luodaan tag-checkboxit dynaamisesti
    renderTagCheckboxes("#search-tag-checkboxes", "search-tag-checkbox")

    // Käsitellään hakutagien valinta
    $("#save-search-tags-button").click(function() {
        selectedSearchTags = [];
        $("input.form-check-input:checked").each(function() {
            selectedSearchTags.push($(this).val());
        });
        $("#search-tags-modal").modal("hide");
    });

    // Käsitellään käyttäjän uloskirjautuminen
    $("#logout-link").click(function() {
        // Tyhjennetään kaikki tallennetut käyttäjätiedot (esim. käyttäjäid localStoragessa)
        localStorage.removeItem("id");
        // Uudelleenohjataan kirjautumissivulle
        window.location.href = "/index.html";
    });

    // Käsitellään reseptien haku
    $(".search-form").submit(function(e) {
        e.preventDefault();
        const query = $("#search-input").val().trim();
        const tags = selectedSearchTags.join(",");
        window.location.href = `/pages/search-page.html?query=${encodeURIComponent(query)}&tags=${encodeURIComponent(tags)}`;
    });

    loadLatestRecipes();

    // Ladataan viimeisimmäksi lisätyt reseptit
    function loadLatestRecipes() {
        $.ajax({
            url: "/recipes/search",
            method: "GET",
            success: function(response) {
                if (response.success && response.recipes) {
                    // Haetaan 6 viimeisimmäksi lisättyä reseptiä
                    const latestRecipes = response.recipes
                        .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
                        .slice(0, 6);
                    displayRecipes(latestRecipes);
                } else {
                    $("#latest-recipes").html('<p class="text-center">Virhe reseptien lataamisessa</p>')
                }
            },
            error: function() {
                $("#latest-recipes").html('<p class="text-center">Palvelimeen yhdistäminen epäonnistui</p>')
            }
        });
    }

    // Näytetään reseptit ja niiden tiedot
    function displayRecipes(recipes) {
        let html = "";
        if (recipes.length === 0) {
            html = '<p class="text-center">Ei tuloksia</p>';
        } else {
            recipes.forEach(recipe => {
                const isFavourited = recipe.favouritedBy?.includes(id);
                const buttonText = isFavourited ? "Poista suosikeista" : "Lisää suosikkeihin";
                const buttonClass = isFavourited ? "favourited" : "";
                const imagePath = recipe.imagePath ? `/images/${recipe.imagePath}` : "";
                const tagsText = recipe.tags.length > 0 ? 
                    recipe.tags.map(tag => typeof tag === "string" ? tagMap[tag] || tag : tag.label).join(", ") : 
                    "Ei tageja";

                html += `
                    <div class="col-md-4 recipe-card">
                        <img src="${imagePath}" alt="${recipe.name}">
                        <h5>${recipe.name}</h5>
                        <p class="mb-1"><strong>Tagit:</strong> ${tagsText}</p>
                        <p class="mb-0">Annokset: ${recipe.servingSize}</p>
                        <p class="mb-0">Valmistusaika: ${recipe.preparationTime} min</p>
                        <p class="mb-1">Tekijä: ${recipe.authorName}<p>
                        <p class="mb-0"><small class="text-muted">Luotu: ${new Date(recipe.dateCreated).toLocaleString("fi-FI")}</small></p>
                        <div class="recipe-buttons">
                            <a class="btn btn-primary" href="/pages/recipe-view.html?id=${recipe.id}">Näytä resepti</a>
                            <button class="btn btn-primary ${id ? '' : 'd-none'} favourite-button ${buttonClass}" style="${isFavourited ? 'background-color: red;' : ''}" data-recipe-id="${recipe.id}">${buttonText}</button>
                        </div>
                    </div>
                `;
            });
        }
        $("#latest-recipes").html(html);
    }

    $(document).on("click", ".favourite-button", function() {
        const userId = localStorage.getItem("id");
        if (!userId) return;

        const recipeId = $(this).data("recipe-id");
        const isFavourited = $(this).hasClass("favourited");

        // Lisätään tai poistetaan suosikkiresepti
        $.ajax({
            url: `/recipes/favourites/${recipeId}`,
            method: isFavourited ? "DELETE" : "POST",
            contentType: "application/json",
            data: JSON.stringify({ userId }),
            success: () => {
                // favourite-button -napin teksti ja taustaväri riippuu siitä, onko käyttäjä lisännyt reseptin suosikkeihinsa
                if (isFavourited) {
                    $(this).removeClass("favourited").text("Lisää suosikkeihin").css("backgroud-color", "");
                } else {
                    $(this).addClass("favourited").text("Poista suosikeista").css("background-color", "red");
                }
            }
        });
    });
});