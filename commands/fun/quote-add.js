import { SlashCommandBuilder } from 'discord.js';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  data: new SlashCommandBuilder()
    .setName('quote-add')
    .setDescription('Adds an inspirational quote.')
    .addStringOption(option =>
      option.setName('quote')
        .setDescription('The quote to add.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('author')
        .setDescription('The author of the quote.')
        .setRequired(true)),
  async execute(interaction) {
    const quote = interaction.options.getString('quote');
    const author = interaction.options.getString('author');

    const quotesPath = path.join(__dirname, '../../database/quotes.json');
    let quotes = [];

    try {
      const data = readFileSync(quotesPath, 'utf8');
      quotes = JSON.parse(data || '[]');
    } catch (error) {
      console.error('Error reading quotes.json:', error);
    }

    quotes.push({ quote, author });

    try {
      writeFileSync(quotesPath, JSON.stringify(quotes, null, 2));
      await interaction.reply({ content: 'Quote added!', ephemeral: true });
    } catch (error) {
      console.error('Error writing to quotes.json:', error);
      await interaction.reply({ content: 'There was an error adding the quote.', ephemeral: true });
    }
  },
  cooldown: 10,
};