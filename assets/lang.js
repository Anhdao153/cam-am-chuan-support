(function () {
  var STORAGE_KEY = "camamchuan.lang";
  var SUPPORTED = ["vi", "en"];
  var root = document.documentElement;

  function normalize(value) {
    return typeof value === "string" && value.toLowerCase().indexOf("en") === 0
      ? "en"
      : "vi";
  }

  function getSavedLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED.indexOf(saved) !== -1 ? saved : null;
    } catch (error) {
      return null;
    }
  }

  function getInitialLang() {
    return getSavedLang() || normalize(navigator.language || "vi");
  }

  function saveLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      /* localStorage may be unavailable */
    }
  }

  function applyLang(lang) {
    var next = SUPPORTED.indexOf(lang) !== -1 ? lang : "vi";

    root.lang = next;
    root.dataset.lang = next;

    var title = next === "en" ? root.dataset.titleEn : root.dataset.titleVi;
    if (title) {
      document.title = title;
    }

    var description =
      next === "en" ? root.dataset.descriptionEn : root.dataset.descriptionVi;
    var meta = document.querySelector('meta[name="description"]');
    if (meta && description) {
      meta.setAttribute("content", description);
    }

    document.querySelectorAll("[data-vi][data-en]").forEach(function (element) {
      var text = next === "en" ? element.dataset.en : element.dataset.vi;
      if (text) {
        element.textContent = text;
      }
    });

    document.querySelectorAll("[data-set-lang]").forEach(function (button) {
      var active = button.dataset.setLang === next;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("is-active", active);
    });
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-set-lang]");
    if (!button) return;

    var lang = button.dataset.setLang;
    saveLang(lang);
    applyLang(lang);
  });

  applyLang(getInitialLang());
})();
