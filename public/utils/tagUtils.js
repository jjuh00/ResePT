const tagMap = {
    t1: "air fryer", t2: "arki",
    t3: "gluteetiton", t4: "grilliruoka",
    t5: "hedelmät", t6: "hitaasti haudutettu",
    t7: "höyrytetty ruoka", t8: "intialainen",
    t9: "japanilainen", t10: "joulu",
    t11: "juhannus", t12: "juhlava",
    t13: "juoma", t14: "jälkiruoka",
    t15: "kakku", t16: "kala",
    t17: "kana", t18: "kastike",
    t19: "kasvis", t20: "kasvisruoka",
    t21: "keitto", t22: "keksi",
    t23: "kiinalainen", t24: "laatikkoruoka",
    t25: "laktoositon", t26: "leipä",
    t27: "leivos", t28: "liharuoka",
    t29: "lihaton", t30: "lisuke",
    t31: "maidoton", t32: "makeinen",
    t33: "marinoitu", t34: "marjat",
    t35: "mausteinen", t36: "meksikolainen",
    t37: "merenelävät", t38: "mikrossa tehty",
    t39: "munaruoka", t40: "munaton",
    t41: "muu", t42: "nopea",
    t43: "paistettu", t44: "pasta",
    t45: "pataruoka", t46: "perinneruoka",
    t47: "peruna", t48: "piirakka",
    t49: "pikaruoka", t50: "pirtelö",
    t51: "pääsiäinen", t52: "salaatti",
    t53: "sisältää maitoa", t54: "sisältää viljoja",
    t55: "sokerillinen", t56: "sokeriton",
    t57: "suklaa", t58: "suolainen",
    t59: "suomalainen", t60: "tex-mex",
    t61: "tofu", t62: "trendikäs",
    t63: "tulinen", t64: "uunissa tehty",
    t65: "valmistujaiset", t66: "vappu",
    t67: "vegaaninen", t68: "vehnätön",
    t69: "voileipäkakku", t70: "vähähiilihydraattinen",
    t71: "välimerellinen", t72: "yrtit"
};

// Tämä funktio luo dynaamisesti checkboxien syötteet (inputs) ja labelit tagMapin avulla
function renderTagCheckboxes(containerSelector, inputPrefix) {
    const $container = $(containerSelector);
    $container.empty();

    let counter = 1;
    for (const [value, label] of Object.entries(tagMap)) {
        const inputId = `${inputPrefix}-${counter}`;
        const tagHtml = `
            <div class="col-4 mb-2">
                <input type="checkbox" class="form-check-input" id="${inputId}" value="${value}">
                <label class="form-check-label" for="${inputId}">${label}</label>
            </div>
        `;
        $container.append(tagHtml);
        counter++;
    }
}

export { tagMap, renderTagCheckboxes };