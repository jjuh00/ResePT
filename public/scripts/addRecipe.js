$(document).ready(function() {
    // Tarkistetaan, onko käyttäjä kirjautunut sisään
    const id = localStorage.getItem("id");
    if (!id) {
        alert("Sinun täytyy olla kirjautuneena sisään, jotta voit lisätä reseptejä");
        window.location.href = "/index.html";
        return;
    }

    let selectedTags = [];

    // Lisätään uusi ainesosa
    $("#add-ingredient-button").click(function() {
        const ingredientHtml = `
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
        $(".ingredients").append(ingredientHtml);
    });

    // Lisätään uusi vaihe
    $("#add-step-button").click(function() {
        const stepCount = $(".step").length + 1;
        const stepHtml = `
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
        $(".steps").append(stepHtml);
    });

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

    // Lomakkeen lähetys
    $(".add-recipe-form").submit(function(e) {
        e.preventDefault();

        const recipeName = $("#recipe-name").val().trim();
        const servingSize = parseInt($("#recipe-serving-size").val());
        const preparationTime = parseInt($("#recipe-preparation-time").val());
        const imageFile = $("#recipe-image")[0].files[0];

        // Kootaan ainesosat
        const ingredients = [];
        $(".ingredient").each(function() {
            const amountAndUnit = $(this).find(".ingredient-amount-and-unit").val().trim();
            const ingredientName = $(this).find(".ingredient-name").val().trim();
            if (amountAndUnit && ingredientName) {
                ingredients.push({ amountAndUnit, ingredientName });
            }
        });

        // Kootaan vaiheet
        const steps = [];
        $(".step").each(function() {
            const text = $(this).find(".step-text").val().trim();
            if (text) {
                steps.push(text);
            }
        });

        // Tarkistus
        if (!recipeName) {
            alert("Reseptin nimi on pakollinen");
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