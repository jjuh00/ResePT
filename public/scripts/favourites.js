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
                recipe.tags.map(tag => typeof tag === "string" ? tagMap[tag] || tag : tag.label).join(", ") : 
                "Ei tageja";

            html += `
                <button class="btn mt-3" id="back-button">
                <i class="fi fi-rr-arrow-left"></i></button>
                <div class="col-md-4 recipe-card">
                    <img src="${imagePath}" alt="${recipe.name}">
                    <h5>${recipe.name}</h5>
                    <p class="mb-1"><i class="fi fi-sr-tags"></i> ${tagsText}</p>
                    <p class="mb-0"><i class="fi fi-sr-plate-utensils"></i> ${recipe.servingSize} annosta</p>
                    <p class="mb-0"><i class="fi fi-sr-clock-three"></i> ${recipe.preparationTime} min</p>
                    <p class="mb-0"><small class="text-muted">Luotu: ${createdDate}</small></p>
                    <div class="recipe-buttons">
                        <a class="btn" href="/pages/recipe-view.html?id=${recipe.id}">
                            <i class="fi fi-rr-magnifying-glass-eye"></i>
                        </a>
                        <button type="button" class="btn remove-fav-button" data-recipe-id="${recipe.id}">
                            <i class="fi fi-sr-star"></i>
                        </button>
                    </div>
                </div>
            `;
        });
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