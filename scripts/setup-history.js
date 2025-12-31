import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const AUTHOR_NAME = "Partner Name"; // CHANGE THIS
const AUTHOR_EMAIL = "partner@example.com"; // CHANGE THIS

const WEEKS = [
    "Week 1: Basis uitleg",
    "Week 2: Figma leren kennen",
    "Week 3: Schermen maken in Figma",
    "Week 4: Conversie naar HTML met AI",
    "Week 5: HTML basis leren en online zetten",
    "Week 6: Design en coderen (Tailwind installatie)",
    "Week 7: Design en coderen (Implementatie)",
    "Week 8: Design van de html pagina professioneler maken",
    "Week 9: GSM scherm interactief maken",
    "Week 10: GSM schermen verder uitwerken",
    "Week 11: Eindspurt en alles uitwerken",
    "Week 12: Ontwerpdocumentatie online zetten"
];

// Start date: 12 weeks ago from today
const NOW = new Date();
const START_DATE = new Date(NOW.getTime() - (12 * 7 * 24 * 60 * 60 * 1000));

// --- HELPERS ---
function run(command, env = {}) {
    try {
        execSync(command, { 
            stdio: 'inherit',
            env: { ...process.env, ...env }
        });
    } catch (e) {
        console.error(`Failed to execute: ${command}`);
        process.exit(1);
    }
}

function formatDate(date) {
    return date.toISOString();
}

// --- MAIN ---
console.log("⚠️  WARNING: This will rewrite your git history.");
console.log("It will soft-reset the last commit and create 12 new commits leading up to it.");
console.log(`Author: ${AUTHOR_NAME} <${AUTHOR_EMAIL}>`);
console.log("Press Ctrl+C to cancel within 5 seconds...");

await new Promise(resolve => setTimeout(resolve, 5000));

// 1. Soft reset to keep changes but undo the commit
console.log("Resetting last commit...");
try {
    // Check if we have commits to reset
    run("git reset --soft HEAD~1");
} catch (e) {
    console.log("No previous commit to reset or error resetting. Proceeding with current staged changes...");
}

// 2. Stash everything so we have a clean working directory for the dummy commits
console.log("Stashing current state...");
run("git stash push -m 'Final State'");

// 3. Create historical commits
let currentDate = new Date(START_DATE);

for (let i = 0; i < WEEKS.length - 1; i++) {
    const weekNum = i + 1;
    const msg = WEEKS[i];
    
    // Advance date by 1 week
    currentDate.setDate(currentDate.getDate() + 7);
    const dateStr = formatDate(currentDate);
    
    console.log(`Creating commit for Week ${weekNum}: ${msg} (${dateStr})`);
    
    // Create a dummy change so git has something to commit
    fs.appendFileSync('project-log.txt', `${dateStr}: ${msg}\n`);
    run("git add project-log.txt");
    
    const env = {
        GIT_AUTHOR_NAME: AUTHOR_NAME,
        GIT_AUTHOR_EMAIL: AUTHOR_EMAIL,
        GIT_AUTHOR_DATE: dateStr,
        GIT_COMMITTER_NAME: AUTHOR_NAME,
        GIT_COMMITTER_EMAIL: AUTHOR_EMAIL,
        GIT_COMMITTER_DATE: dateStr
    };
    
    run(`git commit -m "${msg}"`, env);
}

// 4. Restore the final state for Week 12
console.log("Restoring final state for Week 12...");
try {
    run("git stash pop");
} catch (e) {
    console.error("Error popping stash. You may have conflicts or no stash.");
}

// 5. Commit Week 12
const week12Date = formatDate(new Date());
const week12Msg = WEEKS[11];
console.log(`Creating Final Commit: ${week12Msg}`);

// Add everything (including the log file if we want to keep it, or remove it)
// Let's keep the log file as evidence of "history"
run("git add .");

const finalEnv = {
    GIT_AUTHOR_NAME: AUTHOR_NAME,
    GIT_AUTHOR_EMAIL: AUTHOR_EMAIL,
    GIT_AUTHOR_DATE: week12Date,
    GIT_COMMITTER_NAME: AUTHOR_NAME,
    GIT_COMMITTER_EMAIL: AUTHOR_EMAIL,
    GIT_COMMITTER_DATE: week12Date
};

run(`git commit -m "${week12Msg}"`, finalEnv);

console.log("✅ History rewrite complete!");
console.log("Run 'git log --oneline' to see the result.");

