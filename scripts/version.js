const fs = require("fs");
const child_process = require("child_process");

// Read arguments
const commands = ["minor", "major", "patch"];
if (process.argv.length < 3) {
  console.log(`Usage: node version.js [${commands.join("|")}]`);
  process.exit(1);
}
const command = process.argv[2];
const commandIndex = commands.indexOf(command);
if (commandIndex === -1) {
  console.log(
    `Usage: node version.js [${commands.join("|")}] (got "${command}")`,
  );
  process.exit(1);
}

// Check if there are some changes in git stash
try {
  child_process.execSync(`git diff-index --quiet --cached HEAD --`);
} catch (e) {
  console.log(
    `It seems there are some changes currently staged, it's impossible to update version`,
  );
  process.exit(1);
}

// Read package and manifest files
const PACKAGE_FILE = "package.json";
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_FILE).toString());
const MANIFEST_FILE = "manifest.json";
const manifestJson = JSON.parse(fs.readFileSync(MANIFEST_FILE).toString());

// Generate new version
const newVersion = (packageJson.version || "0.0.0")
  .split(".")
  .map(x => parseInt(x, 10))
  .map((x, i) => (i === commandIndex ? x + 1 : x))
  .join(".");

// Update version in all files and rewrite them
console.log("Update package.json...");
packageJson.version = newVersion;
fs.writeFileSync(PACKAGE_FILE, JSON.stringify(packageJson, null, 2));
console.log("Update manifest.json...");
manifestJson.version = newVersion;
fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifestJson, null, 2));

console.log("Stage files");
child_process.execSync(`git add ${PACKAGE_FILE} ${MANIFEST_FILE}`);
console.log("Commit files");
child_process.execSync(`git commit -m "${newVersion}"`);
console.log("Add release tag");
child_process.execSync(`git tag "v${newVersion}"`);
