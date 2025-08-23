import { Collection } from 'discord.js';

export default {
  name: 'interactionCreate',
  async execute(interaction) {
    const handleCooldown = (command, userId) => {
      const commandName = command?.data?.name || interaction.commandName || 'unknown';
      if (!interaction.client.cooldowns.has(commandName)) {
        interaction.client.cooldowns.set(commandName, new Collection());
      }

      const now = Date.now();
      const timestamps = interaction.client.cooldowns.get(commandName);
      const cooldownAmount = (command.cooldown || 3) * 1000;

      if (timestamps.has(userId)) {
        const expirationTime = timestamps.get(userId) + cooldownAmount;
        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return `⏳ Please wait ${timeLeft.toFixed(1)}s before using \`${commandName}\` again.`;
        }
      }

      timestamps.set(userId, now);
      setTimeout(() => timestamps.delete(userId), cooldownAmount);
      return null;
    };

    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return interaction.reply({ content: "❌ This command doesn't exist!", ephemeral: true });
    }

    try {
      const cooldownMessage = handleCooldown(command, interaction.user.id);
      if (cooldownMessage) {
        return interaction.reply({ content: cooldownMessage, ephemeral: true });
      }
      await command.execute(interaction);
    } catch (error) {
      console.error('Error executing command:', error);
      const replyMessage = '⚠️ There was an error while executing this command!';
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: replyMessage, ephemeral: true }).catch(console.error);
      } else {
        await interaction.reply({ content: replyMessage, ephemeral: true }).catch(console.error);
      }
    }
  },
};
