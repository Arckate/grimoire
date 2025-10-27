import fs from "node:fs";

const updatesRaw = fs.readFileSync("updates.txt", "utf8").trim().split("\n");

let updatesList = "";
for (let line of updatesRaw) {
  line = line.trim();
  if (line.includes("📦")) {
    updatesList += `- ${line}\n`;
  } else if (line.includes("🔴")) {
    updatesList += `  - ${line}\n`;
  } else if (line.includes("🟠")) {
    updatesList += `  - ${line}\n`;
  } else if (line.includes("🟢")) {
    updatesList += `  - ${line}\n`;
  }
}

console.log(updatesList);