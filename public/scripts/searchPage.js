import { tagMap } from "../utils/tagUtils.js";
import { formatRecipeDate } from "../utils/dateUtils.js";

$(document).ready(function() {
    const id = localStorage.getItem("id");
    const recipesPerPage = 3; // Max. 3 reseptiä yhdellä sivulla
    let currentPage = 1;
    let totalRecipes = 0;

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

    // Ladataan hakutulokset URL-parametrien perusteella
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("query") || "";

    // Käsitellään haku
    $(".search-form").submit(function(e) {
        e.preventDefault();
        currentPage = 1; // Palautetaan ensimmäiselle sivulle, kun uusi resepti haetaan
        searchRecipes();
    });

    $("#search-input").val(query);
    searchRecipes();

    // Suoritetaan haku
    function searchRecipes() {
        const query = $("#search-input").val().trim();

        if (!query) {
            alert("Syötä hakusana");
            $(".search-section").html(""); // Siivotaan edelliset tulokset
            return;
        }

        const url = `/recipes/search?query=${encodeURIComponent(query)}`;

        $.ajax({
            url: url,
            method: "GET",
            success: function(response) {
                if (response.success && response.recipes) {
                    totalRecipes = response.recipes.length;
                    displayRecipes(response.recipes);
                    updatePageControls();
                } else {
                    $(".search-section").html('<p class="text-center">Virhe reseptien haussa</p>');
                }
            },
            error: function() {
                $(".search-section").html('<p class="text-center">Palvelimeen ei saatu yhteyttä</p>');
            }
        });
    }

    // Näytetään hakutulokset nykyiselle sivulle
    function displayRecipes(recipes) {
        let html = '<div class="back-button-div"><button type=button" class="btn" id="back-button"><i class="fi fi-rr-arrow-left"></i></button></div>';
        const startIndex = (currentPage - 1) * recipesPerPage;
        const endIndex = startIndex + recipesPerPage;
        const paginatedRecipes = recipes.slice(startIndex, endIndex);

        if (paginatedRecipes.length === 0) {
            html += '<p class="text-center">Ei tuloksia</p>';
        } else {
            html += '<div class="d-flex flex-wrap gap-1">';
            paginatedRecipes.forEach(recipe => {
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
                                <i class="fi ${isFavourited ? 'fi-ss-heart' : 'fi-ts-heart'}"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            html += "</div>";
        }
        $(".search-section").html(html);
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
    $(document).on("click", "#back-button", function() {
        window.location.href = "/pages/main-page.html";
    });

    // Navigointinappien logiikka ja niiden klikkaamisen käsittely
    $(document).on("click", "#first-page-button", function() {
        if (currentPage !== 1) {
            currentPage = 1;
            searchRecipes();
        }
    });

    $(document).on("click", "#prev-page-button", function() {
        if (currentPage > 1) {
            currentPage--;
            searchRecipes();
        }
    });

    $(document).on("click", "#next-page-button", function() {
        const totalPages = Math.ceil(totalRecipes / recipesPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            searchRecipes();
        }
    });

    $(document).on("click", "#last-page-button", function() {
        const totalPages = Math.ceil(totalRecipes / recipesPerPage);
        if (currentPage !== totalPages) {
            currentPage = totalPages;
            searchRecipes();
        }
    });

    $(document).on("click", ".favourite-button", function() {
        const userId = localStorage.getItem("id");
        if (!userId) return;

        const $button = $(this);
        const recipeId = $(this).data("recipe-id");
        const isFavourited = $(this).hasClass("favourited");
        const $icon = $button.find("i");

        // Lisätään tai poistetaan suosikkiresepti
        $.ajax({
            url: `recipes/favourites/${recipeId}`,
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