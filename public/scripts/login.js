$(document).ready(function() {
    // Vaihtuminen kirjautumis- ja rekisteröitymislomakkeiden välillä
    $("#show-register").click(function(e) {
        e.preventDefault();
        $(".login-section").addClass("d-none");
        $(".register-section").removeClass("d-none");
    });

    $("#show-login").click(function(e) {
        e.preventDefault();
        $(".register-section").addClass("d-none");
        $(".login-section").removeClass("d-none");
    });

    // Käsitellään "guest-link" -linkin klikkaus (käyttäjä ei ole kirjautuneena sisään)
    $("#guest-link").click(function(e) {
        e.preventDefault();
        // Varmistetaan, että käyttäjän id:tä ei tallenneta
        localStorage.removeItem("id");
        window.location.href = "/pages/main-page.html";
    });

    // Käsitellään kirjautumislomakkeen lähettäminen
    $(".login-form").submit(function(e) {
        e.preventDefault();
        const username = $("#login-username").val();
        const password = $("#login-password").val();

        $.ajax({
            url: "/authentication/login",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ username, password }),
            success: function(response) {
                if (response.success) {
                    // Tallennetaan käyttäjäid localStorageen
                    localStorage.setItem("id", response.id);
                    window.location.href = "/pages/main-page.html";
                } else {
                    alert("Kirjautuminen epäonnistui: " + response.message);
                }
            },
            error: function(jqXHR) {
                if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                    alert("Kirjautuminen epäonnistui: " + jqXHR.responseJSON.message);
                } else {
                    alert("Palvelimeen yhdistäminen epäonnistui: " + (jqXHR.statusText || "Tuntematon virhe"));
                }
            }
        });
    });

    // Käsitellään rekisteröitymislomakkeen lähettäminen
    $(".register-form").submit(function(e) {
        e.preventDefault();
        const username = $("#register-username").val();
        const email = $("#register-email").val();
        const password = $("#register-password").val();

        $.ajax({
            url: "/authentication/register",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ username, email, password }),
            success: function(response) {
                if (response.success) {
                    // Tallennetaan käyttäjäid localStorageen
                    localStorage.setItem("id", response.id);
                    window.location.href = "/pages/main-page.html";
                } else {
                    alert("Rekisteröityminen epäonnistui: " + response.message);
                }
            },
            error: function(jqXHR) {
                if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                    alert("Rekisteröityminen epäonnistui: " + jqXHR.responseJSON.message);
                } else {
                    alert("Palvelimeen yhdistäminen epäonnistui: " + (jqXHR.statusText || "Tuntematon virhe"));
                }
            }
        });
    });
});