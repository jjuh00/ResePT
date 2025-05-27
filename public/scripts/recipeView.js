import { tagMap } from "../utils/tagUtils.js";

$(document).ready(function() {
    const id = localStorage.getItem("id");

    // Käsitellään käyttäjän uloskirjautuminen
    $("#logout-link").click(function() {
        localStorage.removeItem("id");
        window.location.href = "/index.html";
    });

    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get("id");

    if (!recipeId) {
        $("#recipe-details").html('<p class="text-center">Reseptiä ei löytynyt</p>');
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
                $("#recipe-details").html('<p class="text-center">Virhe reseptin haussa</p>');
            }
        },
        error: function() {
            $("#recipe-details").html('<p class="text-center">Palvelimeen yhdistäminen epäonnistui<p>');
        }
    });

    // Näytetään reseptin tiedot
    function displayRecipe(recipe) {
        const imagePath = recipe.imagePath ? `/images/${recipe.imagePath}` : "";
        const createdDate = new Date(recipe.dateCreated).toLocaleString("fi-FI");
        let ingredientsHtml = "<h4>Ainesosat</h4><ul>";
        const tagsText = recipe.tags.length > 0 ?
            recipe.tags.map(tag => tagMap[tag] || tag).join(", ") : "Ei tageja";

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
            <p class="mb-1"><strong>Tagit:</strong> ${tagsText}</p>
            <p class="mb-0">Annokset: ${recipe.servingSize}</p>
            <p class="mb-0">Valmistusaika: ${recipe.preparationTime} min</p>
            <p class="mb-1">Tekijä: ${recipe.authorName}</p>
            <p class="mb-0"><small class="text-muted">Luotu: ${createdDate}</small></p>
            <div class="recipe-details">
                ${ingredientsHtml}
                ${stepsHtml}
            </div>
        `;
        $("#recipe-details").html(html);
    }
});