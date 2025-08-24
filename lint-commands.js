import { readdirSync, statSync } from 'node:fs';
import path, { join } from 'node:path';
import { pathToFileURL } from 'node:url';

function getCommandFiles(dir) {
  let files = [];
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) {
      files = files.concat(getCommandFiles(full));
    } else if (f.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

async function lintCommands() {
  const commandsPath = path.join(process.cwd(), 'commands');
  const allFiles = getCommandFiles(commandsPath);
  let problems = 0;

  for (const filePath of allFiles) {
    const moduleUrl = pathToFileURL(filePath).href;
    let imported;
    try {
      imported = await import(moduleUrl);
    } catch (err) {
      console.error(`⚠️ Failed to import ${filePath}: ${err.message}`);
      continue;
    }

    const command = imported.default ?? imported;
    if (!command?.data) continue;

    // SlashCommandBuilder -> JSON
    const json = command.data.toJSON();
    if (!json.options) continue;

    let seenOptional = false;
    json.options.forEach((opt, idx) => {
      if (opt.required === false) {
        seenOptional = true;
      }
      if (opt.required === true && seenOptional) {
        console.error(
          `❌ [${json.name}] Invalid option order in ${filePath} (option #${idx + 1}: "${opt.name}" is required but comes after an optional)`
        );
        problems++;
      }
    });
  }

  if (problems === 0) {
    console.log('✅ All commands have valid option ordering!');
  } else {
    console.log(`❌ Found ${problems} problem(s). Fix these commands before deploying.`);
  }
}

lintCommands();
