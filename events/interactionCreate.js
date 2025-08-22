import { Collection } from 'discord.js';
import User from '../models/User.js';

export default {
  name: 'interactionCreate',
  async execute(interaction) {
    async function ensureUser(discordUser) {
      try {
        let user = await User.findOne({ discordId: discordUser.id });
        if (!user) {
          user = new User({
            discordId: discordUser.id,
            username: discordUser.username // 👈 store username too
          });
          await user.save();
          console.log(`✅ New user created: ${discordUser.username} (${discordUser.id})`);
        }
        return user;
      } catch (err) {
        console.error('MongoDB error:', err);
        throw new Error('Database error occurred while ensuring user.');
      }
    }

    const handleCooldown = (command, userId) => {
      if (!interaction.client.cooldowns.has(command.name)) {
        interaction.client.cooldowns.set(command.name, new Collection());
      }

      const now = Date.now();
      const timestamps = interaction.client.cooldowns.get(command.name);
      const cooldownAmount = (command.cooldown || 3) * 1000;

      if (timestamps.has(userId)) {
        const expirationTime = timestamps.get(userId) + cooldownAmount;
        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return `⏳ Please wait ${timeLeft.toFixed(1)}s before using \`${command.name}\` again.`;
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
      return interaction.reply({ content: "❌ This command doesn't exist!", flags: 64 });
    }

    try {
      await ensureUser(interaction.user); // 👈 pass whole Discord user, not just ID
      const cooldownMessage = handleCooldown(command, interaction.user.id);
      if (cooldownMessage) {
        return interaction.reply({ content: cooldownMessage, flags: 64 }); // 👈 replaced ephemeral with flags
      }
      await command.execute(interaction);
    } catch (error) {
      console.error('Error executing command:', error);
      const replyMessage = '⚠️ There was an error while executing this command!';
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: replyMessage, flags: 64 }).catch((err) =>
          console.error('Error during followUp:', err)
        );
      } else {
        await interaction.reply({ content: replyMessage, flags: 64 }).catch((err) =>
          console.error('Error during reply:', err)
        );
      }
    }
  },
};
