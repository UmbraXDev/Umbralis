const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "volume",
    aliases: ["vl"],
    description: "Set playback volume (0-100).",
    async execute(client, message, args) {
        const player = client.riffy.players.get(message.guild.id);

        if (!player) {
            const noMusicEmbed = new EmbedBuilder()
                .setTitle("No Music Playing")
                .setDescription("<:cc:1411682128692908123> There is currently no music playing in this server.");
            return message.channel.send({ embeds: [noMusicEmbed] });
        }

        const volume = parseInt(args[0]);
        if (isNaN(volume) || volume < 0 || volume > 100) {
            const invalidVolumeEmbed = new EmbedBuilder()
                .setTitle("Invalid Volume")
                .setDescription("<:cc:1411682128692908123> Please provide a valid volume between **0** and **100**.");
            return message.channel.send({ embeds: [invalidVolumeEmbed] });
        }

        player.setVolume(volume);
        const volumeSetEmbed = new EmbedBuilder()
            .setDescription(`🔊 Volume has been set to **${volume}%**.`);
        message.channel.send({ embeds: [volumeSetEmbed] });
    }
};
