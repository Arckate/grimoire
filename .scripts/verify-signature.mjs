import { execSync } from "node:child_process";
import chalk from "chalk";

const EXPECTED_AUTHOR = "Emeric LEBBRECHT <emeric.lebbrecht@gmail.com>";

try {
    const log = execSync("git log --pretty=format:'%H|%G?|%an <%ae>'", { encoding: "utf8" });
    const lines = log.trim().split("\n");

    const unsigned = lines.filter(line => !line.includes("|G|"));
    const badAuthor = lines.filter(line => !line.includes(EXPECTED_AUTHOR));

    if (unsigned.length > 0) {
        console.error("❌ Unsigned commits detected:");
        console.error(unsigned.join("\n"));
        process.exit(1);
    }

    if (badAuthor.length > 0) {
        console.error("❌ Commits signed by someone else:");
        console.error(badAuthor.join("\n"));
        process.exit(1);
    }

    console.log(chalk.green('✔'),"All commits are signed and authored by Emeric.");
} catch (err) {
    console.error("🚨 Error during verification:", err.message);
    process.exit(1);
}