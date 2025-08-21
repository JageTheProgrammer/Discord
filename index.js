const { Client, Collection, Events, GatewayIntentBits, REST, Routes } = require('discord.js');
const { token, clientId, mongoDBUri } = require('./config.json'); // Import MongoDB URI
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose'); // Import mongoose

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.cooldowns = new Collection(); // Initialize client.cooldowns
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

const commands = []; // Array to hold command data for registration

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON()); // Add command data to the array
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args).catch(console.error));
    } else {
        client.on(event.name, (...args) => event.execute(...args).catch(console.error));
    }
}

// MongoDB Connection
mongoose.connect(mongoDBUri, { // Use the imported mongoDBUri
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB!');
        // Command Registration (moved inside .then() to ensure MongoDB is connected first)
        client.on('ready', async () => {
            console.log('Bot is ready to register commands.');

            const rest = new REST({ version: '10' }).setToken(token);

            try {
                console.log('Started refreshing application (/) commands.');

                // Register commands globally
                await rest.put(
                    Routes.applicationCommands(clientId), // Use clientId from config
                    { body: commands },
                );

                console.log('Successfully reloaded application (/) commands.');
            } catch (error) {
                console.error('Error while refreshing application (/) commands:', error);
            }
        });

        client.login(token); // Login after MongoDB connection
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
    });
