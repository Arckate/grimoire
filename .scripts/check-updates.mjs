import fs from "node:fs";
import path from "node:path";
import ncu from "npm-check-updates";
import semver from "semver";
import yaml from "yaml";

function readWorkspacePatterns() {
    const wsPath = path.resolve("pnpm-workspace.yaml");
    const content = fs.readFileSync(wsPath, "utf8");
    const ws = yaml.parse(content);
    return Array.isArray(ws?.packages) ? ws.packages : [];
}

function resolvePackageJsonPaths(pattern) {
    const base = pattern.replace(/\/\*$/, "");
    const baseAbs = path.resolve(base);
    if (!fs.existsSync(baseAbs)) return [];
    return fs
        .readdirSync(baseAbs, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => path.join(baseAbs, e.name, "package.json"))
        .filter((pkgPath) => fs.existsSync(pkgPath));
    }

    function getCurrentVersion(pkgJson, dep) {
    const all = {
        ...(pkgJson.dependencies || {}),
        ...(pkgJson.devDependencies || {}),
        ...(pkgJson.optionalDependencies || {}),
        ...(pkgJson.peerDependencies || {}),
    };
    return all[dep];
}

function normalizeVersion(rangeOrVersion) {
    if (!rangeOrVersion) return null;
    const min = semver.minVersion(rangeOrVersion);
    return min ? min.version : null;
}

async function checkOnePackage(pkgPath) {
    const pkgJson = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const upgrades = await ncu.run({
        packageFile: pkgPath,
        upgrade: false,
        jsonUpgraded: true,
        loglevel: "silent",
    });

    let major = 0, minor = 0, patch = 0;

    for (const [dep, newVersion] of Object.entries(upgrades)) {
        const currentRange = getCurrentVersion(pkgJson, dep);
        const currentVersion = normalizeVersion(currentRange);
        if (!currentVersion) continue;

        const next = semver.valid(newVersion) || normalizeVersion(newVersion);
        if (!next) continue;

        const diff = semver.diff(currentVersion, next);
        if (diff === "major") major++;
        else if (diff === "minor") minor++;
        else if (diff === "patch") patch++;
    }

    return { major, minor, patch };
}

async function checkUpdates() {
    const patterns = readWorkspacePatterns();
    const allPkgPaths = patterns.flatMap(resolvePackageJsonPaths);
    const rootPkg = path.resolve("package.json");
    if (fs.existsSync(rootPkg)) allPkgPaths.unshift(rootPkg);

    let totalMajor = 0, totalMinor = 0, totalPatch = 0;

    for (const pkgPath of allPkgPaths) {
        const { major, minor, patch } = await checkOnePackage(pkgPath);
        totalMajor += major;
        totalMinor += minor;
        totalPatch += patch;
    }

    console.log("📦 Updates needed (across workspace):");
    console.log(`  🔴 Major: ${totalMajor}`);
    console.log(`  🟠 Minor: ${totalMinor}`);
    console.log(`  🟢 Patch: ${totalPatch}`);
}

checkUpdates().catch((err) => {
    console.error("❌ Error while checking updates:", err?.message || err);
    process.exit(1);
});
