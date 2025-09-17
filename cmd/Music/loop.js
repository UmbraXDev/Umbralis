const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "loop",
    description: "Toggle loop mode (off, track, queue)",

    execute: async (client, message, args) => {
        const mode = (args[0] || "").toLowerCase();

        const player =
            client.riffy.getQueue?.(message.guild.id) ||
            client.riffy.players?.get?.(message.guild.id);

        if (!player) {
            const noPlayerEmbed = new EmbedBuilder()
                .setTitle("<:music:1411680343639068864> No Music Playing")
                .setDescription("There is currently no music playing in this server.");
            return message.channel.send({ embeds: [noPlayerEmbed] });
        }

        if (!["off", "track", "queue"].includes(mode)) {
            const helpEmbed = new EmbedBuilder()
                .setTitle("Loop Command Usage")
                .setDescription("Usage: `loop <off|track|queue>`\n\n**off**: Disable looping\n**track**: Loop the current track\n**queue**: Loop the entire queue");
            return message.channel.send({ embeds: [helpEmbed] });
        }

        let response = "";

        switch (mode) {
            case "off":
                player.setRepeatMode?.(0) || (player.loop = "off");
                response = "<:tick:1411682221387022459> Looping is now **Off**.";
                break;
            case "track":
                player.setRepeatMode?.(1) || (player.loop = "track");
                response = "<:music:1411680343639068864> Now looping the **Current track**.";
                break;
            case "queue":
                player.setRepeatMode?.(2) || (player.loop = "queue");
                response = "<:music:1411680343639068864> Now looping the **Entire queue**.";
                break;
        }

        const embed = new EmbedBuilder()
            .setTitle("Loop Mode")
            .setDescription(response)
            .setFooter({
                text: `Requested by ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL(),
            });

        return message.channel.send({ embeds: [embed] });
    },
};
