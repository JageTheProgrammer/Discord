const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Get a random programming meme."),
  async execute(interaction) {
    await interaction.reply("😂 Here’s your random meme (placeholder).");
  },
  cooldown: 10, // 10 second cooldown for adding websites
};
