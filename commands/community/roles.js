// commands/community/roles.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Displays self-assignable roles.'),
    async execute(interaction) {
        // Replace with your actual role management logic
        const roles = [
            { name: 'JavaScript', id: 'ROLE_ID_JS' },
            { name: 'Python', id: 'ROLE_ID_PYTHON' },
            { name: 'React', id: 'ROLE_ID_REACT' },
        ];

        const embed = new EmbedBuilder()
            .setTitle('Self-Assignable Roles')
            .setDescription('React to this message to get the following roles:')
            .addFields(
                roles.map(role => ({ name: role.name, value: `React to get the ${role.name} role.`, inline: true }))
            )
            .setColor('#0099ff');

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });

        // Add reactions for each role (replace with your actual emoji IDs)
        // message.react('EMOJI_ID_JS');
        // message.react('EMOJI_ID_PYTHON');
        // message.react('EMOJI_ID_REACT');

        // You'll need to handle the reaction add/remove events to assign/remove roles
    },
        cooldown: 10, // 10 second cooldown for adding websites

};