import fs from "node:fs";

const log = fs.readFileSync("coverage.log", "utf8");
const lines = log.split("\n");

let currentPkg = null;
const coverageData = [];

for (const line of lines) {
  const pkgMatch = line.match(/^(@[^\s:]+):test/);
  if (pkgMatch) {
    currentPkg = pkgMatch[1];
  }

  const covMatch = line.match(
    /^All files\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/
  );
  if (covMatch && currentPkg) {
    const [ , stmts, branches, funcs, linesCov ] = covMatch;
    coverageData.push({
      pkg: currentPkg,
      stmts,
      branches,
      funcs,
      lines: linesCov,
    });
  }
}

let table = "| Package | Lines | Branches | Functions | Statements |\n";
table += "|---------|-------|----------|-----------|------------|\n";

for (const row of coverageData) {
  table += `| ${row.pkg} | ${row.lines} | ${row.branches} | ${row.funcs} | ${row.stmts} |\n`;
}

console.log(table);