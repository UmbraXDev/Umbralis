const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "stop",
    aliases: ["st"],
    description: "Stop playback and leave voice channel.",
    async execute(client, message) {
        const player = client.riffy.players.get(message.guild.id);

        if (!player) {
            const noMusicEmbed = new EmbedBuilder()
                .setTitle("No Music Playing")
                .setDescription("<:cc:1411682128692908123> No music is currently playing.");
            return message.channel.send({ embeds: [noMusicEmbed] });
        }

        player.destroy();

        const stoppedEmbed = new EmbedBuilder()
            .setDescription("<:tick:1411682221387022459> Stopped the music and left the voice channel.");
        message.channel.send({ embeds: [stoppedEmbed] });
    }
};
