$(document).ready(function() {
    const id = localStorage.getItem("id");

    // Tarkistetaa, että onko käyttäjä kirjautunut sisään
    if (!id) {
        alert("Kirjaudu sisään nähdäksesi omat reseptit");
        window.location.href = "/index.html";
        return;
    }

    // Navigointinapit
    $(".back-button").click(function() {
        window.location.href = "/pages/main-page.html";
    });

    $(".add-new-recipe-button").click(function() {
        window.location.href = "/pages/add-recipe.html";
    });

    loadUserRecipes();

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

    function displayRecipes(recipes) {
        if (recipes.length === 0) {
            $(".recipes-length").html('<p class="text-center">Et ole lisännyt yhtään reseptiä</p>');
            return;
        }

        let html = "";
        recipes.forEach(recipe => {
            const tagsText = recipe.tags.length > 0 ? recipe.tags.join(", ") : "Ei tageja";
            const createdDate = new Date(recipe.dateCreated).toLocaleString("fi-FI");
            
            html += `
                <div class="recipe border rounded">
                    <h5>${recipe.name}</h5>
                    <div class="recipe-meta">
                        <p class="mb-1><strong>Tagit:</strong> ${tagsText}</p>
                        <p class="mb-0"><small class="text-muted">Luotu: ${createdDate}</small></p>
                    </div>
                </div>
            `
        });
        $(".recipes-list").html(html);
    }
});