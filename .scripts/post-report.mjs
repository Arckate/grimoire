import fs from 'node:fs';
import { Octokit } from '@octokit/rest';

const runReport = async ({ github }) => {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    const refMatch = process.env.GITHUB_REF.match(/refs\/pull\/(\d+)\/merge/);
    const issue_number = refMatch ? refMatch[1] : null;

    if (!issue_number) {
        console.log("No PR context, skipping comment.");
        return;
    }

    const coverageLines = fs.readFileSync('coverage.txt', 'utf8').trim().split('\n');
    const updates = fs.readFileSync('updates.txt', 'utf8').trim();

    let table = "| Package | Lines | Branches | Functions | Statements |\n";
    table += "|---------|-------|----------|-----------|------------|\n";

    for (const line of coverageLines) {
        const match = line.match(/^(.*?)All files\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/);
        if (match) {
            const pkg = match[1].trim();
            const [ , , lines, branches, functions, statements ] = match;
            table += `| ${pkg} | ${lines} | ${branches} | ${functions} | ${statements} |\n`;
        }
    }

    const body = `### ✅ CI Report

    **Coverage (per package)**
    ${table}

    **Dependencies**
    \`\`\`
    ${updates}
    \`\`\``;

    const { data: comments } = await github.rest.issues.listComments({
        issue_number,
        owner,
        repo,
    });

    const botComment = comments.find(c =>
        c.user.login === 'github-actions[bot]' &&
        c.body.startsWith('### ✅ CI Report')
    );

    if (botComment) {
    await github.rest.issues.updateComment({
        comment_id: botComment.id,
        owner,
        repo,
        body
    });
    } else {
    await github.rest.issues.createComment({
        issue_number,
        owner,
        repo,
        body
    });
    }
};
const execute = async () => {
    const github = new Octokit({ auth: process.env.GITHUB_TOKEN });
    await runReport({ github });
}
execute()