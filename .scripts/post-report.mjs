import fs from "node:fs";
import { Octokit } from "@octokit/rest";

const runReport = async () => {
    const github = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

    const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
    const issue_number = event.pull_request?.number;

    if (!issue_number) {
        console.log(`Event ${process.env.GITHUB_EVENT_NAME} is not a PR, skipping comment.`);
        return;
    }

    const coverageTable = fs.readFileSync("coverage-report.md", "utf8").trim();
    const updates = fs.readFileSync("updates-report.md", "utf8").trim();

    const body = `### ✅ CI Report

**Coverage (per package)**
${coverageTable}

**Dependencies**

${updates}
`;

    const { data: comments } = await github.rest.issues.listComments({
        issue_number,
        owner,
        repo,
    });

    const botComment = comments.find(
        (c) =>
        c.user.login === "github-actions[bot]" &&
        c.body.startsWith("### ✅ CI Report")
    );

    if (botComment) {
        await github.rest.issues.updateComment({
        comment_id: botComment.id,
        owner,
        repo,
        body,
        });
    } else {
        await github.rest.issues.createComment({
        issue_number,
        owner,
        repo,
        body,
        });
    }
};

runReport().catch((err) => {
    console.error("Error while posting report:", err);
    process.exit(1);
});