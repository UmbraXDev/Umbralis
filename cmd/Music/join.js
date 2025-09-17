const { joinVoiceChannel } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "join",
    aliases: ["j"],
    description: "Joins the voice channel you're in.",

    async execute(client, message, args) {
        const userChannel = message.member?.voice?.channel;
        const botChannel = message.guild.members.me.voice.channel;

        if (!userChannel) {
            const embed = new EmbedBuilder()
                .setDescription("<:cc:1411682128692908123> You need to be in a voice channel to use this command.");
            return message.reply({ embeds: [embed] });
        }

        if (botChannel) {
            const embed = new EmbedBuilder()
                .setDescription(`<:cc:1411682128692908123> I'm already in the voice channel: ${botChannel.name}`);
            return message.reply({ embeds: [embed] });
        }

        try {
            joinVoiceChannel({
                channelId: userChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
                selfDeaf: true, 
            });

            const embed = new EmbedBuilder()
                .setDescription(`<:tick:1411682221387022459> Joined **${userChannel.name}**.`);
            message.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            const embed = new EmbedBuilder()
                .setDescription("<:cc:1411682128692908123> Failed to join the voice channel.");
            message.reply({ embeds: [embed] });
        }
    }
};
