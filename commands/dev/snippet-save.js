import { SlashCommandBuilder } from 'discord.js';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  data: new SlashCommandBuilder()
    .setName('snippet-save')
    .setDescription('Saves a code snippet.')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('The name of the snippet.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('code')
        .setDescription('The code snippet.')
        .setRequired(true)),
  async execute(interaction) {
    const name = interaction.options.getString('name');
    const code = interaction.options.getString('code');
    const userId = interaction.user.id;

    const snippetsPath = path.join(__dirname, '../../database/snippets.json');
    let snippets = {};

    try {
      const data = readFileSync(snippetsPath, 'utf8');
      snippets = JSON.parse(data || '{}');
    } catch (error) {
      console.error('Error reading snippets.json:', error);
    }

    if (!snippets[userId]) {
      snippets[userId] = {};
    }

    if (snippets[userId][name]) {
      return await interaction.reply({ content: `Snippet \`${name}\` already exists. Choose a different name.`, ephemeral: true });
    }

    snippets[userId][name] = code;

    try {
      writeFileSync(snippetsPath, JSON.stringify(snippets, null, 2));
      await interaction.reply({ content: `Snippet \`${name}\` saved!`, ephemeral: true });
    } catch (error) {
      console.error('Error writing to snippets.json:', error);
      await interaction.reply({ content: 'There was an error saving the snippet.', ephemeral: true });
    }
  },
  cooldown: 10,
};