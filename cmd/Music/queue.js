const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "queue",
    description: "Shows the current music queue",

   async execute(client, message) {
        const player = client.riffy.players.get(message.guild.id);

        if (!player || !player.queue || !player.queue.length && !player.queue.current) {
            return message.reply("<:lockcross:1380161154684293161> No music is currently playing.");
        }

        const current = player.queue.first;

        const title = current.info?.title || current?.title || "Unknown Title";
        const uri = current?.info?.uri || current?.uri || null;
        const author = current?.info?.author || current?.author || "Unknown Artist";
        const length = current?.info?.length || current?.length || 0;

        const minutes = Math.floor(length / 60000);
        const seconds = Math.floor((length % 60000) / 1000);
        const duration = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        const embed = new EmbedBuilder()
            .setTitle("<:music:1411680343639068864> Umbralis Music Queue")
            .addFields({
                name: "Now Playing",
                value: uri
                    ? `**[${title}](${uri})**\nAuthor: ${author}\nDuration: ${duration}`
                    : `**${title}**\nAuthor: ${author}\nDuration: ${duration}`
            });

        if (player.queue.length > 0) {
            const queueList = player.queue.slice(0, 10).map((track, index) => {
                const info = track.info || track;
                const trackTitle = info.title || "Unknown";
                const trackUri = info.uri || null;
                const trackLength = info.length || 0;

                const mins = Math.floor(trackLength / 60000);
                const secs = Math.floor((trackLength % 60000) / 1000);
                const time = `${mins}:${secs.toString().padStart(2, "0")}`;

                return `\`${index + 1}.\` ${trackUri ? `[${trackTitle}](${trackUri})` : trackTitle} • ${time}`;
            }).join("\n");

            embed.addFields({
                name: "Up Next",
                value: queueList
            });
        } else {
            embed.addFields({
                name: "Up Next",
                value: "No more tracks in the queue."
            });
        }

        embed.setFooter({ text: `Requested by ${message.author.tag}` });
        message.channel.send({ embeds: [embed] });
    }
};