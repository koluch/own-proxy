const fs = require("fs");

if (process.argv.length < 5) {
  console.log("process.argv", process.argv)
  console.log(`Usage: node set_app_id.js [manifest.json file] [version] [id]`);
  process.exit(1);
}

const manifestFile = process.argv[2];
const version = process.argv[3];
const id = process.argv[4];

const manifestJson = JSON.parse(fs.readFileSync(manifestFile).toString());

manifestJson.version = version;
manifestJson.browser_specific_settings.gecko.id = id;

fs.writeFileSync(manifestFile, JSON.stringify(manifestJson, null, 2));
