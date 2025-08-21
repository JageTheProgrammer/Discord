// commands/fun/trivia.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trivia')
        .setDescription('Starts a coding & computer science quiz game.'),
    async execute(interaction) {
        // Replace with your actual trivia game logic
        const questions = [
            { question: "What does HTML stand for?", answer: "HyperText Markup Language" },
            { question: "What is the purpose of CSS?", answer: "Styling web pages" },
            { question: "What is JavaScript used for?", answer: "Adding interactivity to web pages" },
        ];

        let currentQuestionIndex = 0;
        let score = 0;

        try {
            await interaction.reply({ content: `Starting trivia! Question 1: ${questions[currentQuestionIndex].question}`, ephemeral: true });

            const filter = m => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, time: 15000 }); // 15 seconds

            collector.on('collect', m => {
                if (m.content.toLowerCase() === questions[currentQuestionIndex].answer.toLowerCase()) {
                    score++;
                    m.reply('Correct!');
                } else {
                    m.reply('Incorrect!');
                }

                currentQuestionIndex++;

                if (currentQuestionIndex < questions.length) {
                    m.reply(`Question ${currentQuestionIndex + 1}: ${questions[currentQuestionIndex].question}`);
                } else {
                    collector.stop();
                }
            });

            collector.on('end', collected => {
                interaction.followUp(`Trivia ended! Your score: ${score}/${questions.length}`);
            });
        } catch (error) {
            console.error("Error starting trivia:", error);
            await interaction.reply({ content: 'There was an error starting the trivia game.', ephemeral: true });
        }
    },
    cooldown: 10, // 10 second cooldown for adding websites
};