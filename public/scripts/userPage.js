import { tagMap } from "../utils/tagUtils.js";
import { formatRecipeDate } from "../utils/dateUtils.js";

$(document).ready(function() {
    const id = localStorage.getItem("id");

    // Tarkistetaan, että onko käyttäjä kirjautunut sisään
    if (!id) {
        alert("Kirjaudu sisään nähdäksesi omat reseptit");
        window.location.href = "/index.html";
        return;
    } else {
        // Päivitetään navigointipalkin menun sisältö
        $("#add-new-recipe-link").removeClass("d-none");
        $("#favourites-link").removeClass("d-none");
        $("#logout-link").removeClass("d-none");
    }

    // Käsitellään käyttäjän uloskirjautuminen
    $("#logout-link").click(function() {
        localStorage.removeItem("id");
        window.location.href = "/index.html";
    });

    loadUserProfile();
    loadUserRecipes();

    // Ladataan käyttäjän tiedot
    function loadUserProfile(){
        $.ajax({
            url: `/authentication/user/${id}`,
            method: "GET",
            success: function(response) {
                if (response.success && response.user) {
                    const html = `
                        <tr>
                            <th>Käyttäjänimi</th>
                            <td>${response.user.username}</td>
                        </tr>
                        <tr>
                            <th>Sähköposti</th>
                            <td>${response.user.email}</td>
                        </tr>
                    `;
                    $("#user-profile-meta").html(html);
                } else {
                    $("#user-profile-meta").html('<tr><td colspan="2">Virhe käyttäjätietojen lataamisessa</td></tr>');
                }
            },
            error: function() {
                $("#user-profile-meta").html('<tr><td colspan="2">Palvelimeen yhdistäminen epäonnistui</td></tr>');
            }
        });
    }

    // Ladataan käyttäjän reseptit
    function loadUserRecipes() {
        $.ajax({
            url: `/recipes/user/${id}`,
            method: "GET",
            success: function(response) {
                $(".loading-message").hide();
                if (response.recipes) {
                    displayRecipes(response.recipes);
                } else {
                    $(".recipes-list").html('<p class="text-center">Virhe omien reseptien lataamisessa</p>');
                }
            },
            error: function() {
                $(".loading-message").hide();
                $(".recipes-list").html('<p class="text-center">Virhe omien reseptien lataamisessa</p>')
            }
        });
    }

    // Näytetään käyttäjän lisäämät reseptit
    function displayRecipes(recipes) {
        let html = "";
        if (recipes.length === 0) {
            html = '<p class="text-center">Et ole lisännyt yhtään reseptiä</p>';
        } else {
            html += "<h3>Omat reseptit</h3>";
            recipes.forEach(recipe => {
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
                            <button type="button" class="btn" id="edit-button" data-recipe-id="${recipe.id}">
                                <i class="fi fi-rr-pencil"></i>
                            </button>
                            <button type="button" class="btn" id="delete-button" data-recipe-id="${recipe.id}">
                                <i class="fi fi-bs-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        $(".recipes-list").html(html);
    }

    // Käsitellään muokkaus-napin klikkaus
    $(document).on("click", "#edit-button", function() {
        const recipeId = $(this).data("recipe-id");
        window.location.href = `/pages/edit-recipe.html?id=${recipeId}`;
    });

    // Käsitellään poista-napin klikkaus
    $(document).on("click", "#delete-button", function() {
        const recipeId = $(this).data("recipe-id");
        if (confirm("Haluatko varmasti poistaa tämän respetin?")) {
            $.ajax({
                url: `/recipes/delete/${recipeId}`,
                method: "DELETE",
                contentType: "application/json",
                data: JSON.stringify({ userId: id }),
                success: function(response) {
                    if (response.success) {
                        location.reload();
                    } else {
                        alert("Reseptin poistaminen epäonnistui: " + response.message);
                    }
                },
                error: function(jqXHR) {
                    alert("Reseptin poistaminen epäonnistui: " + (jqXHR.responseJSON?.message || "Tuntematon virhe"));
                }
            });
        }
    });
});