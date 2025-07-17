const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(__dirname, '../android/app/build.gradle');
let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

// Extract current version code
const versionCodeMatch = buildGradle.match(/versionCode\s+(\d+)/);
if (versionCodeMatch) {
  const currentVersionCode = parseInt(versionCodeMatch[1]);
  const newVersionCode = currentVersionCode + 1;

  // Replace version code
  buildGradle = buildGradle.replace(/versionCode\s+\d+/, `versionCode ${newVersionCode}`);

  // Optionally update version name
  const versionNameMatch = buildGradle.match(/versionName\s+"([^"]+)"/);
  if (versionNameMatch) {
    const parts = versionNameMatch[1].split('.');
    parts[parts.length - 1] = newVersionCode.toString();
    const newVersionName = parts.join('.');
    buildGradle = buildGradle.replace(/versionName\s+"[^"]+"/, `versionName "${newVersionName}"`);
  }

  fs.writeFileSync(buildGradlePath, buildGradle);
  console.log(`✅ Version bumped to ${newVersionCode}`);
} else {
  console.error('❌ Could not find versionCode in build.gradle');
}
