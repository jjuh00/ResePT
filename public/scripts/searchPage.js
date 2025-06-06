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
        $(".input.form-check-input:checked").each(function() {
            selectedSearchTags.push($(this).val());
        });
        $("#search-tags-modal").modal("hide");
    });

    // Käsitellään käyttäjän uloskirjautuminen
    $("#logout-link").click(function() {
        localStorage.removeItem("id");
        window.location.href = "/index.html";
    });

    // Käsitellään haku
    $(".search-form").submit(function(e) {
        e.preventDefault();
        searchRecipes();
    });

    // Ladataan hakutulokset URL-parametrien perusteella
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("query") || "";
    const tags = urlParams.get("tags") ? urlParams.get("tags").split(",") : [];
    $("#search-input").val(query);
    selectedSearchTags = tags;
    searchRecipes();

    // Suoritetaan haku
    function searchRecipes() {
        const query = $("#search-input").val().trim();
        if (!query && selectedSearchTags.length === 0) {
            alert("Syötä hakusana tai valitse ainakin yksi tagi");
            return;
        }

        const tags = selectedSearchTags.join(",");
        const url = `/recipes/search?query=${encodeURIComponent(query)}&tags=${encodeURIComponent(tags)}`;

        $.ajax({
            url: url,
            method: "GET",
            success: function(response) {
                if (response.success && response.recipes) {
                    displayRecipes(response.recipes);
                } else {
                    $("#search-results").html('<p class="text-center">Virhe reseptien haussa</p>');
                }
            },
            error: function() {
                $("#search-results").html('<p class="text-center">Palvelimeen ei saatu yhteyttä</p>');
            }
        });
    }

    // Näytetään hakutulokset
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
                        <p class="mb-0"><small class="text-muted">Luotu: ${new Date(recipe.dateCreated).toLocaleString("fi-FI")}</small></p>
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
        $("#search-results").html(html);
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