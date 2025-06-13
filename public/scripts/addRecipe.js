import { renderTagCheckboxes } from "../utils/tagUtils.js";

$(document).ready(function() {
    const id = localStorage.getItem("id");
    let selectedTags = [];

    // Tarkistetaan, onko käyttäjä kirjautunut sisään
    if (!id) {
        alert("Sinun täytyy olla kirjautuneena sisään, jotta voit lisätä reseptejä");
        window.location.href = "/index.html";
        return;
    } else {
        // Päivitetään navigointipalkin menun sisältö
        $("#user-page-link").removeClass("d-none");
        $("#favourites-link").removeClass("d-none");
        $("#logout-link").removeClass("d-none");
    }

    // Käsitellään käyttäjän uloskirjautuminen
    $("#logout-link").click(function() {
        localStorage.removeItem("id");
    });

    // Luodaan tag-checkboxit dynaamisesti
    renderTagCheckboxes("#tag-checkboxes", "recipe-tag-checkbox");

    // Lisätään uusi ainesosakenttä
    $(document).on("click", "#add-ingredient-button", function() {
        const ingredientsHtml = `
            <div class="ingredient">
                <div class="row align-items-center">
                    <div class="col-3">
                        <input type="text" class="form-control ingredient-amount-and-unit" placeholder="Määrä (esim. 100g)" required>
                    </div>
                    <div class="col-6">
                        <input type="text" class="form-control ingredient-name" placeholder="Ainesosa" required>
                    </div>
                    <div class="col-3 ingredient-buttons d-flex gap-2 justify-content-end">
                        <button type="button" class="btn" id="add-ingredient-button">
                            <i class="fi fi-br-plus"></i>
                        </button>
                        <button type="button" class="btn" id="delete-ingredient-button">
                            <i class="fi fi-br-minus-small"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        $(".ingredients").append(ingredientsHtml);
        updateButtonVisibility();
    });

    // Lisätään uusi vaihekenttä
    $(document).on("click", "#add-step-button", function() {
        const stepCount = $(".step").length + 1;
        const stepsHtml = `
            <div class="step">
                <div class="row align-items-center">
                    <div class="col-1">
                        <span class="step-number">${stepCount}.</span>
                    </div>
                    <div class="col-8">
                        <textarea class="form-control step-text" rows="3" placeholder="Vaihe ${stepCount}" required></textarea>
                    </div>
                    <div class="col-3 step-buttons d-flex gap-2 justify-content-end">
                        <button type="button" class="btn" id="add-step-button">
                            <i class="fi fi-br-plus"></i>
                        </button>
                        <button type="button" class="btn" id="delete-step-button">
                            <i class="fi fi-br-minus-small"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        $(".steps").append(stepsHtml);
        updateButtonVisibility();
    });

    // Poistetaan ainesosakenttä
    $(document).on("click", "#delete-ingredient-button", function() {
        if ($(".ingredient").length > 1) {
            $(this).closest(".ingredient").remove();
            updateButtonVisibility();
        }
    });

    // Poistetaan vaihekenttä
    $(document).on("click", "#delete-step-button", function() {
        if ($(".step").length > 1) {
            $(this).closest(".step").remove();
            // Päivitetään vaiheen numero
            $(".step").each(function(i) {
                $(this).find(".step-number").text(`${i + 1}.`);
                $(this).find(".step-text").attr("placeholder", `Vaihe ${i + 1}`);
            });
            updateButtonVisibility();
        }
    });

    /*
        Ainesosan ja vaiheen lisäys-/poistonappien näkyvyys:
        Napit näkyvät vain viimeisimmän ainesosan/vaiheen kohdalla
    */
    function updateButtonVisibility() {
        $(".ingredient-buttons").addClass("d-none");
        $(".step-buttons").addClass("d-none");
        $(".ingredient").last().find(".ingredient-buttons").removeClass("d-none");
        $(".step").last().find(".step-buttons").removeClass("d-none");
    }

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

    // Lomakkeen lähetys
    $(".add-recipe-form").submit(function(e) {
        e.preventDefault();

        const recipeName = $("#recipe-name").val().trim();
        const servingSize = parseInt($("#recipe-serving-size").val());
        const preparationTime = parseInt($("#recipe-preparation-time").val());
        const imageFile = $("#recipe-image")[0].files[0];

        // Tarkistus
        if (!recipeName || recipeName.length < 2 || recipeName.length > 60) {
            alert("Reseptin nimen pitää olla 2-60 merkkiä pitkä");
            return;
        }
        if (!servingSize || servingSize < 1 || servingSize > 20) {
            alert("Annosten määrä pitää olla 1 ja 20 välillä");
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

    // Käsitellään peruuta-napin klikkaus
    $("#cancel-button").click(function() {
        window.location.href = "/pages/main-page.html";
    });

    // Alustetaan nappien näkyvyys
    updateButtonVisibility();
});