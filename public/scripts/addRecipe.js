import { renderTagCheckboxes } from "../utils/tagUtils.js";

$(document).ready(function() {
    const id = localStorage.getItem("id");
    let selectedTags = [];

    // Tarkistetaan, onko käyttäjä kirjautunut sisään
    if (!id) {
        alert("Sinun täytyy olla kirjautuneena sisään, jotta voit lisätä reseptejä");
        window.location.href = "/index.html";
        return;
    }

    // Lisätään uusi ainesosa
    $("#add-ingredient-button").click(function() {
        const ingredientsHtml = `
            <div class="ingredient mb-2">
                <div class="row">
                    <div class="col-3">
                        <input type="text" class="form-control ingredient-amount-and-unit" placeholder="Määrä (esim. 100g)" required>
                    </div>
                    <div class="col-6">
                        <input type="text" class="form-control ingredient-name" placeholder="Ainesosa" required>
                    </div>
                </div>
            </div>
        `;
        $(".ingredients").append(ingredientsHtml);
    });

    // Lisätään uusi vaihe
    $("#add-step-button").click(function() {
        const stepCount = $(".step").length + 1;
        const stepsHtml = `
            <div class="step mb-2">
                <div class="row">
                    <div class="col-1">
                        <span class="step-number">${stepCount}.</span>
                    </div>
                    <div class="col-11">
                        <textarea class="form-control step-text" rows="3" placeholder="Vaihe ${stepCount}" required></textarea>
                    </div>
                </div>
            </div>
        `;
        $(".steps").append(stepsHtml);
    });

    // Luodaan tag-checkboxit dynaamisesti
    renderTagCheckboxes("#tag-checkboxes", "recipe-tag-checkbox");

    // Käsitellään tagien valinta
    $("#save-tags-button").click(function() {
        selectedTags = [];
        $("input.form-check-input:checked").each(function() {
            const tagValue = $(this).val(); // Reseptin tagin input arvo, esim. t1
            const labelText = $(`label[for="${$(this).attr("id")}"]`).text(); // Checkboxia vastaava label, esim. air fryer
            selectedTags.push({ value: tagValue, label: labelText });
        });
        const labelList = selectedTags.map(t => t.label);
        $("#selected-tags").text(labelList.length > 0 ? `Valitut tagit: ${labelList.join(", ")}` :
        "Ei valittuja tageja"); // Näytetään tagin teksti (input arvon sijasta)
        $("#recipe-tags-modal").modal("hide");
    });

    // Peruuta-nappi
    $("#cancel-button").click(function() {
        window.location.href = "/pages/main-page.html";
    });

    // Käsitellään käyttäjän uloskirjautuminen
    $("#logout-link").click(function() {
        localStorage.removeItem("id");
        window.location.href = "/index.html";
    })

    // Lomakkeen lähetys
    $(".add-recipe-form").submit(function(e) {
        e.preventDefault();

        const recipeName = $("#recipe-name").val().trim();
        const servingSize = parseInt($("#recipe-serving-size").val());
        const preparationTime = parseInt($("#recipe-preparation-time").val());
        const imageFile = $("#recipe-image")[0].files[0];

        // Tarkistus
        if (!recipeName || recipeName.length < 2 || recipeName.length > 60) {
            alert("Reseptin nimen pitää olla 2-10 merkkiä pitkä");
            return;
        }
        if (!servingSize || servingSize < 1 || servingSize > 10) {
            alert("Annosten määrä pitää olla 1 ja 10 välillä");
            return;
        }
        if (!preparationTime || preparationTime < 1 || preparationTime > 1000) {
            alert("Valmistusajan pitää olla 1 ja 1000 minuutin välillä");
            return;
        }

        // Kootaan ainesosat
        const ingredients = [];
        $(".ingredient").each(function() {
            const amountAndUnit = $(this).find(".ingredient-amount-and-unit").val().trim();
            const ingredientName = $(this).find(".ingredient-name").val().trim();
            if (amountAndUnit && ingredientName) {
                if (amountAndUnit.length > 15 || ingredientName.length > 50) {
                    alert("Määrä on liian suuri tai aineosan nimi on liian pitkä");
                    return false;
                }
                ingredients.push({ amountAndUnit, ingredientName });
            }
        });

        // Kootaan vaiheet
        const steps = [];
        $(".step").each(function() {
            const text = $(this).find(".step-text").val().trim();
            if (text) {
                if (text.length > 600) {
                    alert("Valmistusvaihe on liian pitkä");
                    return false;
                }
                steps.push(text);
            }
        });

        if (ingredients.length === 0) {
            alert("Vähintään yksi ainesosa on pakollinen")
            return;
        }
        if (steps.length === 0) {
            alert("Vähintään yksi valmistusvaihe on pakollinen");
            return;
        }

        // Luodaan FormData-olio lähetystä varten
        const formData = new FormData();
        formData.append("name", recipeName);
        formData.append("servingSize", servingSize);
        formData.append("preparationTime", preparationTime);
        formData.append("ingredients", JSON.stringify(ingredients));
        formData.append("steps", JSON.stringify(steps));
        formData.append("tags", JSON.stringify(selectedTags));
        formData.append("authorId", id);
        if (imageFile) {
            if (imageFile.size > 5 * 1024 * 1024) {
                alert("Kuvatiedoston koko on liian suuri (> 5MB)");
                return;
            }
            formData.append("image", imageFile);
        }

        // Lähetetään data palvelimelle
        $.ajax({
            url: "/recipes/add",
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    window.location.href = "/pages/main-page.html";
                } else {
                    alert("Reseptin lisääminen epäonnistui: " + response.message);
                }
            },
            error: function(jqXHR) {
                if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                    alert("Reseptin lisääminen epäonnistui: " + jqXHR.responseJSON.message);
                } else {
                    alert("Palvelimeen yhdistäminen epäonnistui: " + (jqXHR.statusText || "Tuntematon virhe"));
                }
            }
        });
    });
});