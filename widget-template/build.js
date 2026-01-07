const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const esbuild = require('esbuild');
const process = require('process');

const build = async () => {
  console.log('Starting widget build...');

  // The subfolder is the directory where this build script is located.
  const subfolderPath = __dirname;
  const subfolderName = path.basename(subfolderPath);

  const outputFileName = `${subfolderName}-deploy.html`;

  // Look for config in the widget folder first, then fall back to root.
  let configFilePath = path.join(subfolderPath, 'build.config.json');
  if (!fs.existsSync(configFilePath)) {
      console.warn(`⚠️  No build.config.json found in '${subfolderName}'. Falling back to root config.`);
      configFilePath = path.join(basePath, 'build.config.json');
  }

  console.log(`Using configuration file: ${configFilePath}`);
  let config;
  try {
    const configContent = fs.readFileSync(configFilePath, 'utf8');
    config = JSON.parse(configContent);
  } catch (error) {
    console.error(`❌ Error reading or parsing build.config.json: ${error.message}`);
    process.exit(1);
  }

  // Function to escape a string for use in a regular expression
  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  };

  // Use values from config
  const distPath = path.join(subfolderPath, 'deploy');
  const htmlFilePath = path.join(subfolderPath, config.input.html);

  try {
    // 1. Bundle JavaScript using esbuild
    const jsEntryPath = path.join(subfolderPath, config.input.js_entry);
    const buildResult = await esbuild.build({
        entryPoints: [jsEntryPath],
        bundle: true,
        write: false, // We want the output as a string
        format: 'iife', // Immediately-invoked function expression, safe for browsers
    });
    const allJsContent = buildResult.outputFiles[0].text;

    // 2. Read and concatenate CSS content
    let allCssContent = '';
    const cssFiles = Array.isArray(config.input.css) ? config.input.css : [config.input.css];
    for (const cssFile of cssFiles) {
      const currentCssFilePath = path.join(subfolderPath, cssFile);
      allCssContent += fs.readFileSync(currentCssFilePath, 'utf8') + '\n';
    }

    // 3. Read the main HTML file
    let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

    // 4. Create the inline <style> and <script> tags
    const inlineCss = `<style>\n${allCssContent}\n</style>`;
    const inlineJs = `<script>\n${allJsContent}\n</script>`;

    // 5. Replace placeholders in HTML
    let replacedFirst = false;
    for (const cssFile of cssFiles) {
      // Use path.basename to match just the filename. This is more robust and handles
      // cases where the href path in the HTML is different from the path in build.config.json
      // (e.g., 'ui-utilities.css' vs '../utilities/ui-utilities.css').
      const cssFileName = path.basename(cssFile);
      const dynamicCssRegex = new RegExp(`<link[^>]*?href="[^"]*?${escapeRegExp(cssFileName)}"[^>]*?\/?>`, 's');
      htmlContent = htmlContent.replace(dynamicCssRegex, replacedFirst ? '' : inlineCss);
      replacedFirst = true;
    }

    // The JS replacement is simpler now, we just find the entry point script tag
    const jsEntryRegex = new RegExp(`<script[^>]*?src="[^"]*?${escapeRegExp(config.input.js_entry)}"[^>]*?><\/script>`, 's'); //"
    htmlContent = htmlContent.replace(jsEntryRegex, inlineJs);

    // --- Add build information ---
    let version = 'N/A';
    try {
      const pkgJsonPath = path.join(subfolderPath, 'package.json');
      if (fs.existsSync(pkgJsonPath)) {
        const pkgJsonContent = fs.readFileSync(pkgJsonPath, 'utf8');
        const pkgJson = JSON.parse(pkgJsonContent);
        version = pkgJson.version || 'N/A';
      } else {
        console.warn(`⚠️  package.json not found in ${subfolderPath}, using version 'N/A'.`);
      }
    } catch (e) {
        console.warn(`⚠️  Could not read or parse version from package.json in ${subfolderPath}: ${e.message}`);
    }

    const buildDate = new Date().toISOString();
    // Calculate checksum of the content before adding the build info comment
    const checksum = crypto.createHash('md5').update(htmlContent).digest('hex');

    // Create and prepend the build info comment
    const buildInfoComment = `<!--\n  Build Version: ${version}\n  Build Date: ${buildDate}\n  Checksum (md5): ${checksum}\n-->`;
    htmlContent = `${buildInfoComment}\n${htmlContent}`;

    // 6. Create output directory and write the final file
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath, { recursive: true }); // Use recursive to create parent directories if needed
    }
    const outputFilePath = path.join(distPath, outputFileName);
    fs.writeFileSync(outputFilePath, htmlContent);

    console.log(`✅ Build successful! Output file: ${outputFilePath}`);
    console.log(`Using configuration file: ${configFilePath}`);
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1); // Exit with an error code
  }
};

if (require.main === module) {
  build();
}
