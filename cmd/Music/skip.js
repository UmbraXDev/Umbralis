const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "skip",
    description: "Skips the current song.",

    execute: async (client, message) => {
        const player =
            client.riffy.getQueue?.(message.guild.id) ||
            client.riffy.players?.get?.(message.guild.id);

        if (!player) {
            const noMusicEmbed = new EmbedBuilder()
                .setTitle("No Music Playing")
                .setDescription("<:cc:1411682128692908123> There is currently no music playing in this server.");
            return message.channel.send({ embeds: [noMusicEmbed] });
        }

        if (player.setRepeatMode) {
            player.setRepeatMode(0); 
        } else if (player.setTrackRepeat && player.setQueueRepeat) {
            player.setTrackRepeat(false);
            player.setQueueRepeat(false); 
        } else {
            player.loop = "off";
        }

        if (typeof player.skip === "function") {
            player.skip();
        } else if (typeof player.stop === "function") {
            player.stop();
        } else {
            const unsupportedEmbed = new EmbedBuilder()
                .setTitle("Skip Not Supported")
                .setDescription("<:cc:1411682128692908123> The skip function is not available in the current music handler.");
            return message.channel.send({ embeds: [unsupportedEmbed] });
        }

        const skippedEmbed = new EmbedBuilder()
            .setTitle("Song Skipped")
            .setDescription("<:tick:1411682221387022459> The current song was skipped.")
            .setFooter({
                text: `Requested by ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL(),
            });

        return message.channel.send({ embeds: [skippedEmbed] });
    },
};
