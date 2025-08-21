// commands/dev/snippet-get.js
import { SlashCommandBuilder } from 'discord.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  data: new SlashCommandBuilder()
    .setName('snippet-get')
    .setDescription('Retrieves a saved code snippet.')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('The name of the snippet.')
        .setRequired(true)),
  async execute(interaction) {
    const name = interaction.options.getString('name');
    const userId = interaction.user.id;

    const snippetsPath = path.join(__dirname, '../../database/snippets.json');

    let snippets = {};
    try {
      const data = readFileSync(snippetsPath, 'utf8');
      snippets = JSON.parse(data || '{}');
    } catch (error) {
      console.error('Error reading snippets.json:', error);
      return await interaction.reply({ content: 'There was an error retrieving the snippet.', ephemeral: true });
    }

    if (!snippets[userId] || !snippets[userId][name]) {
      return await interaction.reply({ content: `Snippet \`${name}\` not found.`, ephemeral: true });
    }

    const code = snippets[userId][name];
    await interaction.reply({ content: `\`\`\`javascript\n${code}\n\`\`\``, ephemeral: true });
  },
  cooldown: 10,
};