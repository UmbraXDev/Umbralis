const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "support",
    aliases: ["hq"],
    description: "Get the support server link.",

    async execute(client, message) {
        const embed = new EmbedBuilder()
            .setTitle("<:umbralis:1411680433099243550>  Support Server")
            .setDescription("Need help or have questions?\nJoin our support server:\n[Join Now](https://discord.gg/hcvjdf6Jbs)")
            .setFooter({ text: "Umbralis  Support" });

        message.channel.send({ embeds: [embed] });
    }
};