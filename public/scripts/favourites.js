import { tagMap } from "../utils/tagUtils.js";
import { formatRecipeDate } from "../utils/dateUtils.js";

$(document).ready(function() {
    const userId = localStorage.getItem("id");
    const recipesPerPage = 3; // Max. 3 reseptiä yhdellä sivulla
    let currentPage = 1;
    let totalRecipes = 0;

    // Tarkistetaan, onko käyttäjä kirjautunut sisään
    if (!userId) {
        alert("Kirjaudu sisään nähdäksesi suosikit");
        window.location.href = "/index.html";
        return;
    } else {
        // Päivitetään navigointipalkin menun sisältö
        $("#add-new-recipe-link").removeClass("d-none");
        $("#user-page-link").removeClass("d-none");
        $("#logout-link").removeClass("d-none");
    }

    // Käsitellään käyttäjän uloskirjautuminen
    $("#logout-link").click(function() {
        localStorage.removeItem("id");
    });

    // Haetaan käyttäjän suosikkireseptit
    function loadFavourites() {
        $.ajax({
            url: `/recipes/favourites/user/${userId}`,
            method: "GET",
            success: function (response) {
                if (response.success && response.recipes.length > 0) {
                    totalRecipes = response.recipes.length;
                    displayRecipes(response.recipes);
                    updatePageControls();
                } else {
                    $(".favourites-section").html('<p class="text-center">Ei suosikkireseptejä</p>');
                }
            }
        });
    }

    // Näytetään nykyisen sivun reseptit
    function displayRecipes(recipes) {
        let html = '<div class="back-button-div"><button type="button" class="btn" id="back-button"><i class="fi fi-rr-arrow-left"></i></button></div>'
        html += '<div class="d-flex flex-wrap gap-1">';
        const startIndex = (currentPage - 1) * recipesPerPage;
        const endIndex = startIndex + recipesPerPage;
        const paginatedRecipes = recipes.slice(startIndex, endIndex);

        paginatedRecipes.forEach(recipe => {
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
                    <p class="mb-0"><small class="text-muted">${formatRecipeDate(recipe.dateCreated, recipe.dateModified)}</small></p>
                    <div class="recipe-buttons">
                        <a class="btn" href="/pages/recipe-view.html?id=${recipe.id}">
                            <i class="fi fi-rr-magnifying-glass-eye"></i>
                        </a>
                        <button type="button" class="btn" id="remove-fav-button" data-recipe-id="${recipe.id}">
                            <i class="fi fi-ss-heart"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        html += "</div>";
        $(".favourites-section").html(html);
    }

    // Päivitetään sivun navigointinapit
    function updatePageControls() {
        const totalPages = Math.ceil(totalRecipes / recipesPerPage);
        const isFirstPage = currentPage === 1;
        const isLastPage = currentPage === totalPages;

        if (totalPages <= 1) {
            $(".page-controls").html("");
            return;
        }

        const html = `
            <div>
                <button type="button" class="btn" id="first-page-button" ${isFirstPage ? 'disabled' : ''}>
                    <i class="fi fi-rr-angle-double-left"></i>
                </button>
                <button type="button" class="btn" id="prev-page-button" ${isFirstPage ? 'disabled' : ''}>
                    <i class="fi fi-rr-angle-left"></i>
                </button>
                <span>${currentPage} / ${totalPages}</span>
                <button type="button" class="btn" id="next-page-button" ${isLastPage ? 'disabled' : ''}>
                    <i class="fi fi-rr-angle-right"></i>
                </button>
                <button type="button" class="btn" id="last-page-button" ${isLastPage ? 'disabled' : ''}>
                    <i class="fi fi-rr-angle-double-right"></i>
                </button>
            </div>
        `;
        $(".page-controls").html(html);
    }

    // Navigoidaan käyttäjä takaisin "pääsivulle"
    $(document).on("click", "#back-button", function () {
        window.location.href = "/pages/main-page.html";
    });

    // Navigointinappien logiikka ja niiden klikkaamisen käsittely
    $(document).on("click", "#first-page-button", function() {
        if (currentPage !== 1) {
            currentPage = 1;
            loadFavourites();
        }
    });

    $(document).on("click", "#prev-page-button", function() {
        if (currentPage > 1) {
            currentPage--;
            loadFavourites();
        }
    });

    $(document).on("click", "#next-page-button", function() {
        const totalPages = Math.ceil(totalRecipes / recipesPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            loadFavourites();
        }
    });

    $(document).on("click", "#last-page-button", function() {
        const totalPages = Math.ceil(totalRecipes / recipesPerPage);
        if (currentPage !== totalPages) {
            currentPage = totalPages;
            loadFavourites();
        }
    });

    // Käsitellään reseptin poistaminen käyttäjän suosikeista
    $(document).on("click", "#remove-fav-button", function() {
        const recipeId = $(this).data("recipe-id");
        
        $.ajax({
            url: `/recipes/favourites/${recipeId}`,
            method: "DELETE",
            contentType: "application/json",
            data: JSON.stringify({ userId }),
            success: () => location.reload()
        });
    });

    loadFavourites();
});