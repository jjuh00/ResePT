import { tagMap } from "../utils/tagUtils.js";

$(document).ready(function() {
    const id = localStorage.getItem("id");

    // Tarkistetaan, että onko käyttäjä kirjautunut sisään
    if (!id) {
        alert("Kirjaudu sisään nähdäksesi omat reseptit");
        window.location.href = "/index.html";
        return;
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
                            <button type="button" class="btn btn-primary" id="edit-button" data-recipe-id="${recipe.id}">Muokkaa</button>
                            <button type="button" class="btn btn-primary" id="delete-button" data-recipe-id="${recipe.id}">Poista</button>
                        </div>
                    </div>
                `;
            });
        }
        $(".recipes-list").html(html);
    }
});