// fix-commands.js
import fs from 'fs';
import path from 'path';

const commandsPath = path.join(process.cwd(), 'commands'); // adjust if needed
const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of files) {
  const commandPath = path.join(commandsPath, file);
  const command = await import(commandPath);
  
  if (!command.default?.options) continue; // skip if no options

  const options = command.default.options;

  // Reorder: required options first
  command.default.options = [
    ...options.filter(o => o.required),
    ...options.filter(o => !o.required),
  ];

  // Optional: log which command was fixed
  console.log(`Fixed options order for command: ${command.default.name}`);
  
  // Save changes back (if using CommonJS/JS file)
  // For ES Modules, you might just use this in memory before deploying
}

console.log('All command options reordered!');
