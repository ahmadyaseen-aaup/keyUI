(function () {
    const STORAGE_KEY = "keygo-lang";
    const SUPPORTED_LANGS = ["ar", "en", "he"];
    const RTL_LANGS = new Set(["ar", "he"]);

    const html = document.documentElement;
    const bootstrapCss = document.getElementById("bootstrapCss");
    const langLinks = Array.from(document.querySelectorAll(".lang-switch a[lang]"));

    function normalizeLang(lang) {
        return SUPPORTED_LANGS.includes(lang) ? lang : "ar";
    }

    function isRtl(lang) {
        return RTL_LANGS.has(lang);
    }

    function applyLanguage(lang, persistSelection) {
        const normalizedLang = normalizeLang(lang);
        const rtl = isRtl(normalizedLang);

        html.setAttribute("lang", normalizedLang);
        html.setAttribute("dir", rtl ? "rtl" : "ltr");

        if (bootstrapCss) {
            const nextHref = rtl ? bootstrapCss.dataset.rtlHref : bootstrapCss.dataset.ltrHref;

            if (nextHref && bootstrapCss.getAttribute("href") !== nextHref) {
                bootstrapCss.setAttribute("href", nextHref);
            }
        }

        langLinks.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("lang") === normalizedLang);
        });

        if (persistSelection) {
            window.localStorage.setItem(STORAGE_KEY, normalizedLang);
        }

        window.dispatchEvent(new CustomEvent("keygo:languagechange", {
            detail: {
                lang: normalizedLang,
                dir: rtl ? "rtl" : "ltr"
            }
        }));
    }

    const initialLang = normalizeLang(window.localStorage.getItem(STORAGE_KEY) || html.getAttribute("lang") || "ar");
    applyLanguage(initialLang, false);

    langLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            applyLanguage(link.getAttribute("lang"), true);
        });
    });
})();
