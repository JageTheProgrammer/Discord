import { prefix } from '../config.json';
import { Collection } from 'discord.js';
import User from '../models/User.js'; // Your Mongoose user model

export default {
    name: 'interactionCreate',
    async execute(interaction) {
        // Ensure user is in the database
        async function ensureUser (discordId) {
            try {
                let user = await User.findOne({ discordId });
                if (!user) {
                    user = new User({ discordId });
                    await user.save();
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
                    return `Please wait ${timeLeft.toFixed(1)} more seconds before using the \`${command.name}\` command.`;
                }
            }

            timestamps.set(userId, now);
            setTimeout(() => timestamps.delete(userId), cooldownAmount);
            return null; // No cooldown message
        };

        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return interaction.reply({ content: "This command doesn't exist!", ephemeral: true });
            }

            try {
                // Ensure user exists in DB
                await ensureUser (interaction.user.id);

                // Cooldown logic
                const cooldownMessage = handleCooldown(command, interaction.user.id);
                if (cooldownMessage) {
                    return interaction.reply({ content: cooldownMessage, ephemeral: true });
                }

                await command.execute(interaction);
            } catch (error) {
                console.error('Error executing command:', error);
                const replyMessage = 'There was an error while executing this command!';
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: replyMessage, ephemeral: true }).catch(err => console.error("Error during followUp:", err));
                } else {
                    await interaction.reply({ content: replyMessage, ephemeral: true }).catch(err => console.error("Error during reply:", err));
                }
            }
        } else if (interaction.isMessage()) {
            if (!interaction.content.startsWith(prefix) || interaction.author.bot) return;

            const args = interaction.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            const command = interaction.client.commands.get(commandName)
                || interaction.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command) return;

            try {
                // Ensure user exists in DB
                await ensureUser (interaction.author.id);

                // Cooldown logic for prefix commands
                const cooldownMessage = handleCooldown(command, interaction.author.id);
                if (cooldownMessage) {
                    return interaction.reply({ content: cooldownMessage, ephemeral: true });
                }

                await command.execute(interaction, args);
            } catch (error) {
                console.error('Error executing prefix command:', error);
                try {
                    await interaction.reply('There was an error executing that command.');
                } catch (replyError) {
                    console.error("Error during reply:", replyError);
                }
            }
        }
    },
};
