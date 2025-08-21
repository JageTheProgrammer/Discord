const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("challenge")
    .setDescription("Get today’s coding challenge."),
  async execute(interaction) {
    await interaction.reply("💡 Today’s challenge: Build a Fibonacci function!");
  },
      cooldown: 10, // 10 second cooldown for adding websites

};
