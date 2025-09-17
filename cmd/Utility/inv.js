const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "invite",
    aliases: ["inv"],
    description: "Get the bot's invite link.",

    async execute(client, message) {
        const admin = `https://discord.com/oauth2/authorize?client_id=1411401308237205504&permissions=8&integration_type=0&scope=bot`;
        const req = `https://discord.com/oauth2/authorize?client_id=1411401308237205504&scope=bot&permissions=276491954768`

        const embed = new EmbedBuilder()
            .setTitle("Invite Umbralis")
            .setDescription(`> <:umbralis:1411680433099243550> Invite With Admin Permissions **[Click Here](${admin})**\n>  <:umbralis:1411680433099243550> Invite With Sufficient Permissions **[Click Here](${req})**`)

        message.channel.send({ embeds: [embed] });
    }
};