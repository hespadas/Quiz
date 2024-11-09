// i18next-scanner.config.js

module.exports = {
  input: ["src/**/*.{js,jsx}"],
  output: "./",
  options: {
    debug: true,
    removeUnusedKeys: false,
    sort: true,
    lngs: ["en", "pt-BR"],
    defaultLng: "en",
    defaultNs: "translation",
    ns: ["translation"],
    resource: {
      loadPath: "public/i18n/{{lng}}/{{ns}}.json",
      savePath: "public/i18n/{{lng}}/{{ns}}.json",
      jsonIndent: 2,
      lineEnding: "\n",
    },
    keySeparator: false,
    nsSeparator: false,
    interpolation: {
      prefix: "{{",
      suffix: "}}",
    },
    func: {
      list: ["t", "i18next.t"],
      extensions: [".js", ".jsx"],
    },
    trans: {
      component: "Trans",
      i18nKey: "i18nKey",
      defaultsKey: "defaults",
      extensions: [".js", ".jsx"],
    },
  },
};
