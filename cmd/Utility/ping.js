const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "ping",
    description: "Shows bot and API latency.",

    async execute(client, message) {
        const sent = await message.channel.send("<:bot:1411680377554210818> Pinging...");

        const apiLatency = Math.round(client.ws.ping);

        const embed = new EmbedBuilder()
            .setDescription(`**<:bot:1411680377554210818> Bot Latency:** \`${apiLatency}ms\``)


        sent.edit({ content: "", embeds: [embed] });
    }
};