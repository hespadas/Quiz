const fs = require("fs");
const path = require("path");

const localesPath = "./public/i18n";
const tempPath = "./temp/translations";
const languages = ["pt-BR"];
const namespace = "translation";

languages.forEach((lng) => {
  const finalFilePath = path.join(localesPath, lng, `${namespace}.json`);
  const tempFilePath = path.join(tempPath, lng, `${namespace}.json`);

  let existingTranslations = {};
  if (fs.existsSync(finalFilePath)) {
    existingTranslations = JSON.parse(fs.readFileSync(finalFilePath, "utf8"));
  }

  let newTranslations = {};
  if (fs.existsSync(tempFilePath)) {
    newTranslations = JSON.parse(fs.readFileSync(tempFilePath, "utf8"));
  }

  Object.keys(newTranslations).forEach((key) => {
    if (!existingTranslations[key]) {
      existingTranslations[key] = newTranslations[key];
      console.log(
        `Added new key: "${key}" with value: "${newTranslations[key]}"`
      );
    }
  });

  fs.writeFileSync(
    finalFilePath,
    JSON.stringify(existingTranslations, null, 2),
    "utf8"
  );
  console.log(`Merged translations saved for ${lng} at: ${finalFilePath}`);
});

console.log("\nTranslation merging completed.");
