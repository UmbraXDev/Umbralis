const { getVoiceConnection } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "leave",
    aliases: ["dc"],
    description: "Leaves the voice channel.",

    async execute(client, message, args) {
        const connection = getVoiceConnection(message.guild.id);
        const botChannel = message.guild.members.me.voice.channel;

        if (!botChannel || !connection) {
            const embed = new EmbedBuilder()
                .setDescription("<:cc:1411682128692908123> I'm not in any voice channel.");
            return message.reply({ embeds: [embed] });
        }

        try {
            connection.destroy();
            const embed = new EmbedBuilder()
                .setDescription("<:tick:1411682221387022459> Left the voice channel.");
            message.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            const embed = new EmbedBuilder()
                .setDescription("<:cc:1411682128692908123> Failed to leave the voice channel.");
            message.reply({ embeds: [embed] });
        }
    }
};