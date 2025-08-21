// events/clientReady.js
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { clientId, guildId, token, activity } = require('../config.json'); // Or process.env.CLIENT_ID, etc.

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}!`);
        client.user.setActivity(activity);

        const commands = [];
        const commandsPath = path.join(__dirname, '../commands');
        const commandFolders = fs.readdirSync(commandsPath);

        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(path.join(commandsPath, folder)).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, folder, file);
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }

        const rest = new REST({ version: '10' }).setToken(token);

        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);

            const data = await rest.put(
                Routes.applicationGuildCommands(clientId, guildId), // For guild-specific commands
                { body: commands },
            );

            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            console.error(error);
        }
    },
};