const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "uptime",
    description: "Shows how long the bot has been online.",

    async execute(client, message) {
        function formatUptime(ms) {
            const seconds = Math.floor((ms / 1000) % 60);
            const minutes = Math.floor((ms / (1000 * 60)) % 60);
            const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
            const days = Math.floor(ms / (1000 * 60 * 60 * 24));
            return `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }

        const uptime = formatUptime(client.uptime);

        const embed = new EmbedBuilder()
            .setDescription(`<:upt:1411686973139058739> Bot Uptime: **\`${uptime}\`**`)

        message.channel.send({ embeds: [embed] });
    }
};