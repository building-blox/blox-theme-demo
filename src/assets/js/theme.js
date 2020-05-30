export default function doTheme() {
  const themes = {
    dark: {
      name: "dark",
      add: "fa-sun",
      remove: "fa-moon",
    },
    light: {
      name: "light",
      add: "fa-moon",
      remove: "fa-sun",
    },
  };
  const defaultTheme = themes.dark;
  let storedTheme = localStorage.getItem("theme");

  $(function () {
    let bodyEl = $("body");
    let themeEl = $(".theme");
    let theme = defaultTheme;
    if (storedTheme) {
      theme = JSON.parse(storedTheme);
    }
    switchTheme(theme, themeEl, bodyEl);

    themeEl.on("click", function () {
      if ($(this).hasClass("fa-moon")) {
        switchTheme(themes.dark, $(this), bodyEl);
      } else {
        switchTheme(themes.light, $(this), bodyEl);
      }
    });
  });

  function switchTheme(args, themeEl, containerEl) {
    let { name, add, remove } = args;
    themeEl.removeClass(remove);
    themeEl.addClass(add);
    localStorage.setItem("theme", JSON.stringify(args));
    containerEl.attr("data-theme", name);
  }
};
