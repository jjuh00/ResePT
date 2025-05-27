import { tagMap } from "../utils/tagUtils.js";

$(document).ready(function() {
    const userId = localStorage.getItem("id");
    if (!userId) {
        alert("Kirjaudu sisään nähdäksesi suosikit");
        window.location.href = "/index.html";
        return;
    }

    // Käsitellään käyttäjän uloskirjautuminen
    $("#logout-link").click(function() {
        localStorage.removeItem("id");
        window.location.href = "/index.html";
    });

    // Haetaan käyttäjän suosikkireseptit
    $.ajax({
        url: `/recipes/favourites/user/${userId}`,
        method: "GET",
        success: function (response) {
            if (response.success && response.recipes.length > 0) {
                displayRecipes(response.recipes);
            } else {
                $(".favourites-section").html('<p class="text-center">Ei suosikkireseptejä</p>');
            }
        }
    });

    // Näytetään reseptit
    function displayRecipes(recipes) {
        let html = "";
        recipes.forEach(recipe => {
            const imagePath = recipe.imagePath ? `/images/${recipe.imagePath}` : "";
            const createdDate = new Date(recipe.dateCreated).toLocaleString("fi-FI");
            const tagsText = recipe.tags.length > 0 ? 
                recipe.tags.map(tag => tagMap[tag] || tag).join(", ") : "Ei tageja";

            html += `
                <div class="col-md-4 recipe-card">
                    <img src="${imagePath}" alt="${recipe.name}">
                    <h5>${recipe.name}</h5>
                    <p class="mb-1"><strong>Tagit:</strong> ${tagsText}</p>
                    <p class="mb-0">Annokset: ${recipe.servingSize}</p>
                    <p class="mb-0">Valmistusaika: ${recipe.preparationTime}</p>
                    <p class="mb-0"><small class="text-muted">Luotu: ${createdDate}</small></p>
                    <div class="recipe-buttons">
                        <a class="btn btn-primary" href="/pages/recipe-view.html?id=${recipe.id}">Näytä resepti</a>
                        <button type="button" class="btn btn-primary remove-fav-button" styles="background-color: red;" data-recipe-id="${recipe.id}">Poista suosikeista</button>
                    </div>
                </div>
            `;
        });
        html += `<button class="btn btn-secondary mt-3" id="back-button">Takaisin</button>`;
        $(".favourites-section").html(html);
    }

    $(document).on("click", ".remove-fav-button", function() {
        const recipeId = $(this).data("recipe-id");
        // Poistetaan resepti käyttäjän suosikeista
        $.ajax({
            url: `/recipes/favourites/${recipeId}`,
            method: "DELETE",
            contentType: "application/json",
            data: JSON.stringify({ userId }),
            success: () => location.reload()
        });
    });

    // Navigoidaan käyttäjä takaisin "pääsivulle"
    $(document).on("click", "#back-button", function () {
        window.location.href = "/pages/main-page.html";
    });
})