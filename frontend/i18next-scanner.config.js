// i18next-scanner.config.js

module.exports = {
  input: ["src/**/*.{js,jsx}"],
  output: "./",
  options: {
    debug: true,
    removeUnusedKeys: true,
    sort: true,
    lngs: ["en", "pt"],
    defaultLng: "en",
    defaultNs: "translation",
    ns: ["translation"],
    resource: {
      loadPath: "i18n/{{lng}}/{{ns}}.json",
      savePath: "i18n/{{lng}}/{{ns}}.json",
      jsonIndent: 2,
      lineEnding: "\n",
    },
    keySeparator: false,
    nsSeparator: false,
    interpolation: {
      prefix: "{{",
      suffix: "}}",
      escapeValue: false,
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
    defaultValue: "__STRING_NOT_TRANSLATED__",
  },
};
