$(document).ready(function() {
    const id = localStorage.getItem("id");

    // Tarkistetaan, onko käyttäjä kirjautunut sisään
    if (!id) {
        alert("Kirjaudu sisään muokataksesi käyttäjätietoja");
        window.location.href = "/index.html";
        return;
    } else {
        // Päivitetään navigointipalkin menun sisältö
        $("#add-new-recipe-link").removeClass("d-none");
        $("#user-page-link").removeClass("d-none");
        $("#favourites-link").removeClass("d-none");
        $("#logout-link").removeClass("d-none");
    }

    // Käsitellään käyttäjän uloskirjautuminen
    $("#logout-link").click(function() {
        localStorage.removeItem("id");
        window.location.href = "/index.html";
    });

    // Käsitellään peruuta-napin klikkaus
    $("#cancel-button").click(function() {
        window.location.href = "/pages/user-page.html";
    });

    // Käsitellään käyttäjätietojen muokkaus
    $(".edit-user-form").submit(function(e) {
        e.preventDefault();

        const newUsername = $("#new-username").val().trim();
        const newEmail = $("#new-email").val().trim();
        const currentPassword = $("#current-password").val().trim();
        const newPassword = $("#new-password").val().trim();

        if (!currentPassword) {
            alert("Syötä nykyinen salasana");
            return;
        }

        // Valmistellaan data muokkausta varten (säilytetän vain kentät, jotka ovat muuttuneet)
        const updateData = { currentPassword };
        if (newUsername) updateData.username = newUsername;
        if (newEmail) updateData.email = newEmail;
        if (newPassword) updateData.password = newPassword;

        $.ajax({
            url: `/authentication/update/${id}`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(updateData),
            success: function(response) {
                if (response.success) {
                    window.location.href = "/pages/user-page.html";
                } else {
                    alert("Käyttsäjätietojen päivittäminen epäonnistui: " + response.message);
                }
            },
            error: function(jqXHR) {
                if (jqXHR.status === 0) {
                    // Verkkovirhe
                    window.location.href = "/pages/user-page.html";
                } else {
                    alert("Päivittäminen epäonnistui: " + (jqXHR.responseJSON?.message || "Tuntematon virhe"));
                }
            }
        });
    });
});