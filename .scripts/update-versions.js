#!/usr/bin/env node
import fs from "fs";
import path from "path";

// Récupère la version depuis le tag Git (ex: v1.2.3 ou v1.2.3-rc.1)
const tag = process.env.GITHUB_REF_NAME;
if (!tag) {
  console.error("❌ No tag provided in GITHUB_REF_NAME");
  process.exit(1);
}
const version = tag.startsWith("v") ? tag.slice(1) : tag;
console.log(`🔄 Updating package.json files to version ${version}`);

// Fonction utilitaire pour parcourir le repo
function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, callback);
    } else if (entry.isFile() && entry.name === "package.json") {
      callback(fullPath);
    }
  }
}

// Mise à jour des package.json
walk(process.cwd(), (pkgPath) => {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  let updated = false;

  // Met à jour la version du package
  if (pkg.version && pkg.version !== version) {
    pkg.version = version;
    updated = true;
  }

  // Met à jour les dépendances internes "workspace:*"
  const sections = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];
  for (const section of sections) {
    if (pkg[section]) {
      for (const dep in pkg[section]) {
        if (pkg[section][dep].startsWith("workspace:")) {
          pkg[section][dep] = version;
          updated = true;
        }
      }
    }
  }

  if (updated) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
    console.log(`✅ Updated ${pkgPath}`);
  } else {
    console.log(`ℹ️ No changes needed for ${pkgPath}`);
  }
});

console.log("🎉 All package.json files updated successfully!");