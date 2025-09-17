const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "autoplay",
    description: "Toggle autoplay on/off",
    aliases: ["ap"],

    async execute(client, message) {
        const player = client.riffy.players.get(message.guild.id);

        if (!player) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                
                        .setDescription('<:cc:1411682128692908123> No music is currently playing.')
                ]
            });
        }

        player.isAutoplay = !player.isAutoplay;

        const embed = new EmbedBuilder()
            
            .setDescription(
                player.isAutoplay 
                ? '<:tick:1411682221387022459> Autoplay has been **enabled**.' 
                : '<:cc:1411682128692908123>  Autoplay has been **disabled**.'
            );

        message.channel.send({ embeds: [embed] });
    },
};