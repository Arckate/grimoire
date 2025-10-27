import { execSync } from "node:child_process";

const tag = process.env.GITHUB_REF_NAME;
    if (!tag) {
    console.error("❌ No tag provided");
    process.exit(1);
}

try {
    const output = execSync(`git tag -v ${tag}`, { encoding: "utf8" });
    console.log(output);

    if (!output.includes("Good signature from")) {
        console.error("❌ Tag not signed or invalid");
        process.exit(1);
    }

    console.log("✅ Signature valid");
} catch (err) {
    console.error("❌ Error verifying tag:", err.message);
    process.exit(1);
}