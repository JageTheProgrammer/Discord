import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SlashCommandBuilder } from 'discord.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commandsDir = path.join(__dirname, '../commands'); // adjust if your commands are elsewhere

function reorderOptions(builder) {
  if (!builder.options) return;
  const required = builder.options.filter(opt => opt.required);
  const optional = builder.options.filter(opt => !opt.required);
  builder.options = [...required, ...optional];
}

async function fixCommandFile(filePath) {
  try {
    const command = await import(`file://${filePath}`);
    if (command.default?.data instanceof SlashCommandBuilder) {
      reorderOptions(command.default.data);
      console.log(`✅ Fixed options order for ${path.basename(filePath)}`);
    }
  } catch (err) {
    console.log(`⚠️ Could not process ${path.basename(filePath)}: ${err.message}`);
  }
}

async function scanCommands(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await scanCommands(fullPath);
    } else if (entry.name.endsWith('.js')) {
      await fixCommandFile(fullPath);
    }
  }
}

scanCommands(commandsDir)
  .then(() => console.log('✅ All commands processed.'))
  .catch(err => console.error(err));
