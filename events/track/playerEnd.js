const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
    client.riffy.on("queueEnd", async (player, track) => {
    const channel = client.channels.cache.get(player.textChannel);

    if (!channel) return;

    if (player.isAutoplay) {
        player.autoplay(player);
    } else {
        const embed = new EmbedBuilder()
            .setDescription('😃 The queue has ended. Thanks for using me!');

        player.destroy();
        channel.send({ embeds: [embed] });
    }
})
    };