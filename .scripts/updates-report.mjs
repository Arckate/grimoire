import fs from "node:fs";

const updatesRaw = fs.readFileSync("updates.txt", "utf8").trim().split("\n");

let updatesList = "";
for (const line of updatesRaw) {
  if (line.startsWith("📦")) {
    updatesList += `- ${line}\n`;
  } else if (line.startsWith("🔴")) {
    updatesList += `  - ${line}\n`;
  } else if (line.startsWith("🟠")) {
    updatesList += `  - ${line}\n`;
  } else if (line.startsWith("🟢")) {
    updatesList += `  - ${line}\n`;
  }
}

console.log(updatesList);