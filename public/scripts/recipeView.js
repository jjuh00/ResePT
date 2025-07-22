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
        localStorage.removeItem("id");
    });

    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get("id");

    if (!recipeId) {
        $(".recipe-details").html('<p class="text-center">Reseptiä ei löytynyt</p>');
        return;
    }

    // Haetaan reseptin tiedot
    $.ajax({
        url: `/recipes/view/${recipeId}`,
        method: "GET",
        success: function(response) {
            if (response.success && response.recipe) {
                displayRecipe(response.recipe);
            } else {
                $(".recipe-details").html('<p class="text-center">Virhe reseptin haussa</p>');
            }
        },
        error: function() {
            $(".recipe-details").html('<p class="text-center">Palvelimeen yhdistäminen epäonnistui<p>');
        }
    });

    // Näytetään reseptin tiedot
    function displayRecipe(recipe) {
        const imagePath = recipe.imagePath ? `/images/${recipe.imagePath}` : "";
        let ingredientsHtml = "<h4>Ainesosat</h4><ul>";
        const tagsText = recipe.tags.length > 0 ? 
            recipe.tags.map(tag => typeof tag === "string" ? tagMap[tag] || tag : tag.label).join(", ") : 
            "Ei tageja";

        recipe.ingredients.forEach(ing => {
            ingredientsHtml += `<li>${ing.amountAndUnit} ${ing.ingredientName}</li>`;
        });
        ingredientsHtml += "</ul>";

        let stepsHtml = "<h4>Valmistusohje</h4><ol>";
        recipe.steps.forEach((step, idx) => {
            stepsHtml += `<li>${step}</li>`;
        });
        stepsHtml += "</ol>";

        $("#recipe-name").text(recipe.name);

        const html = `
            <img src="${imagePath}" alt="${recipe.name}">
            <p class="mb-1"><i class="fi fi-sr-tags"></i>&nbsp;${tagsText}</p>
            <p class="mb-0"><i class="fi fi-sr-plate-utensils"></i>&nbsp;${recipe.servingSize} annosta</p>
            <p class="mb-0"><i class="fi fi-sr-clock-three"></i>&nbsp;${recipe.preparationTime} min</p>
            <p class="mb-1"><i class="fi fi-sr-user-writer"></i>&nbsp;${recipe.authorName}</p>
            <p class="mb-0"><small class="text-muted">${formatRecipeDate(recipe.dateCreated, recipe.dateModified)}</small></p>
            <div class="recipe-details">
                ${ingredientsHtml}
                ${stepsHtml}
            </div>
        `;
        $(".recipe-details").html(html);
    }
});