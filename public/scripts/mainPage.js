import { tagMap } from "../utils/tagUtils.js";
import { formatRecipeDate } from "../utils/dateUtils.js";

$(document).ready(function() {
    const id = localStorage.getItem("id");

    // Päivitetään navigointipalkin menun sisältö riippuen siitä, onko käyttäjä kirjautunut sisään vai ei
    if (id) {
        $("#add-new-recipe-link").removeClass("d-none");
        $("#user-page-link").removeClass("d-none");
        $("#favourites-link").removeClass("d-none");
        $("#logout-link").removeClass("d-none");
    } else {
        $("#login-link").removeClass("d-none");
    }

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

        if (!query) {
            alert("Syötä hakusana");
            return;
        }

        window.location.href = `/pages/search-page.html?query=${encodeURIComponent(query)}`;
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
                    $(".latest-recipes").html('<p class="text-center">Virhe reseptien lataamisessa</p>')
                }
            },
            error: function() {
                $(".latest-recipes").html('<p class="text-center">Palvelimeen yhdistäminen epäonnistui</p>')
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
                const buttonClass = isFavourited ? "favourited" : "";
                const imagePath = recipe.imagePath ? `/images/${recipe.imagePath}` : "";
                const tagsText = recipe.tags.length > 0 ? 
                    recipe.tags.map(tag => typeof tag === "string" ? tagMap[tag] || tag : tag.label).join(", ") : 
                    "Ei tageja";

                html += `
                    <div class="col-md-4 recipe-card">
                        <img src="${imagePath}" alt="${recipe.name}">
                        <h5>${recipe.name}</h5>
                        <p class="mb-1"><i class="fi fi-sr-tags"></i> ${tagsText}</p>
                        <p class="mb-0"><i class="fi fi-sr-plate-utensils"></i> ${recipe.servingSize} annosta</p>
                        <p class="mb-0"><i class="fi fi-sr-clock-three"></i> ${recipe.preparationTime} min</p>
                        <p class="mb-1"><i class="fi fi-sr-user-writer"></i> ${recipe.authorName}<p>
                        <p class="mb-0"><small class="text-muted">${formatRecipeDate(recipe.dateCreated, recipe.dateModified)}</small></p>
                        <div class="recipe-buttons">
                            <a class="btn" href="/pages/recipe-view.html?id=${recipe.id}">
                                <i class="fi fi-rr-magnifying-glass-eye"></i>
                            </a>
                            <button class="btn ${id ? '' : 'd-none'} favourite-button ${buttonClass}" data-recipe-id="${recipe.id}">
                                <i class="fi ${isFavourited ? 'fi-sr-star' : 'fi-rr-star'}"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        $(".latest-recipes").html(html);
    }

    $(document).on("click", ".favourite-button", function() {
        const userId = localStorage.getItem("id");
        if (!userId) return;

        const $button = $(this);
        const recipeId = $(this).data("recipe-id");
        const isFavourited = $(this).hasClass("favourited");
        const $icon = $button.find("i");

        // Lisätään tai poistetaan suosikkiresepti
        $.ajax({
            url: `/recipes/favourites/${recipeId}`,
            method: isFavourited ? "DELETE" : "POST",
            contentType: "application/json",
            data: JSON.stringify({ userId }),
            success: () => {
                // favourite-button -napin sisältö riippuu siitä, onko käyttäjä lisännyt reseptin suosikkeihinsa
                if (isFavourited) {
                    $button.removeClass("favourited");
                    $icon.removeClass("fi-sr-star").addClass("fi-rr-star");
                } else {
                    $button.addClass("favourited");
                    $icon.removeClass("fi-rr-star").addClass("fi-sr-star");
                }
            }
        });
    });
});