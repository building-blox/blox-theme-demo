const fs = require("fs");

const tailwindColorsPath = "tailwind.colors.js";
const themeCSSPath = "src/assets/scss/dist/_theme.scss";

module.exports = {
  doTheme: async (globalData) => {
    let theme = globalData.blox.db.meta.space.theme;
    let colorsString = await module.exports.doColors(theme);
    await module.exports.doTailwindColors(theme);
    let fontsString = await module.exports.doFonts(globalData);

    fs.writeFileSync(
      themeCSSPath,
      `/* Theme */\n\n:root {${colorsString + fontsString}\n}`,
      null,
      4
    );
  },
  doFonts: async (globalData) => {
    let fonts = globalData.blox.db.meta.space.theme.fonts;
    await module.exports.doFontHeadElements(globalData, fonts);
    let fontsString = await module.exports.getFontCSSVariables(fonts);
    return fontsString;
  },
  doFontHeadElements: async (globalData, fonts) => {
    const keys = Object.keys(fonts);
    let headElements = [];
    for (const slug of keys) {
      let font = fonts[slug];
      headElements.push({
        tagName: 'link',
        attributes: [{
          'name': 'href',
          'value': font.link
        },{
          'name': 'rel',
          'value': 'stylesheet'
        }]
      })
    }
    globalData.blox.page.headElements.push(...headElements);
  },
  doColors: async (theme) => {
    let colorPairs = theme.colorPairs;
    let colorsString = await module.exports.getColorCSSVariables(colorPairs);
    return colorsString;
    // fs.writeFileSync(
    //   themeCSSPath,
    //   `/* Theme */\n\n:root {${colorsString}}`,
    //   null,
    //   4
    // );
    module.exports.doTailwindColors(theme);
  },
  doTailwindColors: (theme) => {
    let tailwindColors = {};
    const colorPairs = Object.keys(theme.colorPairs);
    for (const colorSlug of colorPairs) {
      let colorPair = theme.colorPairs[colorSlug];
      let color = colorPair.color;
      tailwindColors[colorSlug] = `var(--${colorSlug})`;
      if (color.levels) {
        for (let i = 1; i < 10; i++) {
          tailwindColors[`color-${colorSlug}-${i}0`] = `var(--${colorSlug}-${i}0)`;
        }
      }
      if (color.hue) {
        tailwindColors[`color-${colorSlug}-warm`] = `var(--${colorSlug}-warm)`;
        tailwindColors[`color-${colorSlug}-cold`] = `var(--${colorSlug}-cold)`;
      }
      if (color.saturation) {
        //Color Manipulation (Saturation)
        tailwindColors[`color-${colorSlug}-low`] = `var(--${colorSlug}-low)`;
        tailwindColors[`color-${colorSlug}-lowest`] = `var(--${colorSlug}-lowest)`;
      }
      if (color.lightness) {
        //Color Manipulation (Lightness)
        tailwindColors[`color-${colorSlug}-light`] = `var(--${colorSlug}-light)`;
        tailwindColors[`color-${colorSlug}-dark`] = `var(--${colorSlug}-dark)`;

        if (colorPair.contrastColor) {
          tailwindColors[
            `color-${colorSlug}-contrast`
          ] = `var(--${colorSlug}-contrast)`;
        }
      }
    }
    let tailwindColorsString =
      "module.exports = " + JSON.stringify(tailwindColors);
    fs.writeFileSync(tailwindColorsPath, tailwindColorsString, null, 4);
  },
  getFontCSSVariables(fonts) {
    return new Promise((resolve) => {
      let fontString = '';
      for (const fontSlug of Object.keys(fonts)) {
        let font = fonts[fontSlug];
        fontString += `\n--font-${font.slug}: ${font.fontFamily};`;
      }
      resolve(fontString);
    });
  },
  getColorCSSVariables(colorPairs) {
    return new Promise((resolve) => {
      let colorString = "";
      for (const colorSlug of Object.keys(colorPairs)) {
        let colorPair = colorPairs[colorSlug];
        let color = colorPair.color;
        colorString += `
  --color-${colorPair.slug}-h: ${color.h};
  --color-${colorPair.slug}-s: ${color.s}%;
  --color-${colorPair.slug}-l: ${color.l}%;
  --color-${colorPair.slug}-hsl: var(--color-${colorPair.slug}-h), var(--color-${colorPair.slug}-s), var(--color-${colorPair.slug}-l);

  --color-${colorPair.slug}: hsl(var(--color-${colorPair.slug}-hsl));`;

        if (color.levels) {
          colorString += module.exports.getColorLevels(colorPair.slug);
        }

        if (color.hue) {
          colorString += `
  --color-${colorPair.slug}-warm: hsl(calc(var(--color-${colorPair.slug}-h) + 80), var(--color-${colorPair.slug}-s), var(--color-${colorPair.slug}-l));
  --color-${colorPair.slug}-cold: hsl(calc(var(--color-${colorPair.slug}-h) - 80), var(--color-${colorPair.slug}-s), var(--color-${colorPair.slug}-l));
`;
        }
        if (color.saturation) {
          colorString += `
  --color-${colorPair.slug}-low: hsl(var(--color-${colorPair.slug}-h), calc(var(--color-${colorPair.slug}-s) / 2), var(--color-${colorPair.slug}-l));
  --color-${colorPair.slug}-lowest: hsl(var(--color-${colorPair.slug}-h), calc(var(--color-${colorPair.slug}-s) / 4), var(--color-${colorPair.slug}-l));
  `;
        }
        if (color.lightness) {
          colorString += `
  --color-${colorPair.slug}-light: hsl(var(--color-${colorPair.slug}-h), var(--color-${colorPair.slug}-s), calc(var(--color-${colorPair.slug}-l) / .9));
  --color-${colorPair.slug}-dark: hsl(var(--color-${colorPair.slug}-h), var(--color-${colorPair.slug}-s), calc(var(--color-${colorPair.slug}-l) * .9));
`;
        }
        colorString += `
  /* Each color in the palette may have a contrast color specified (used for inverted text, icons, etc) */
  --color-${colorPair.slug}-contrast-h: ${colorPair.contrastColor.h};
  --color-${colorPair.slug}-contrast-s: ${colorPair.contrastColor.s}%;
  --color-${colorPair.slug}-contrast-l: ${colorPair.contrastColor.l}%;
  --color-${colorPair.slug}-contrast-hsl: var(--color-${colorPair.slug}-contrast-h), var(--color-${colorPair.slug}-contrast-s), var(--color-${colorPair.slug}-contrast-l);
  --color-${colorPair.slug}-contrast: hsl(var(--color-${colorPair.slug}-contrast-hsl));
`;
        if (colorPair.contrastColor.levels) {
          colorString += module.exports.getColorLevels(`${colorPair.slug}-contrast`);
        }
      }
      resolve(colorString);
    });
  },
  getColorLevels(name) {
    return `
--color-${name}-hs: var(--color-${name}-h), var(--color-${name}-s);
--color-${name}-10: hsl(var(--color-${name}-hs), 90%);
--color-${name}-20: hsl(var(--color-${name}-hs), 80%);
--color-${name}-30: hsl(var(--color-${name}-hs), 70%);
--color-${name}-40: hsl(var(--color-${name}-hs), 60%);
--color-${name}-50: hsl(var(--color-${name}-hs), 50%);
--color-${name}-60: hsl(var(--color-${name}-hs), 40%);
--color-${name}-70: hsl(var(--color-${name}-hs), 30%);
--color-${name}-80: hsl(var(--color-${name}-hs), 20%);
--color-${name}-90: hsl(var(--color-${name}-hs), 10%);`;
  },
};
