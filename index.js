const fs = require("fs");
const path = require("path");
const { Client, GatewayDispatchEvents } = require("discord.js");
const { EmbedBuilder } = require('discord.js');
const { Riffy } = require("riffy");
const config = require("./config.js");
const { ActivityType } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
        "Guilds",
        "GuildMessages",
        "GuildVoiceStates",
        "MessageContent",
    ],
});

client.commands = new Map();

function loadCommands(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            loadCommands(filePath);
        } else if (file.endsWith(".js")) {
            const command = require(filePath);
            if (!command.name) continue;

            client.commands.set(command.name, command);

            if (Array.isArray(command.aliases)) {
                for (const alias of command.aliases) {
                    client.commands.set(alias, command);
                }
            }
        }
    }
}

loadCommands(path.join(__dirname, "cmd"));

function loadEvents(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            loadEvents(filePath);
        } else if (file.endsWith(".js")) {
            try {
                const eventFunc = require(filePath);
                if (typeof eventFunc === "function") {
                    eventFunc(client);
                    console.log(`✅ Loaded event: ${path.relative(__dirname, filePath)}`);
                } else {
                    console.warn(`⚠️ Skipped (Not a function): ${file}`);
                }
            } catch (err) {
                console.error(`❌ Failed to load event ${filePath}:`, err);
            }
        }
    }
}

client.riffy = new Riffy(client, config.nodes, {
    send: (payload) => {
        const guild = client.guilds.cache.get(payload.d.guild_id);
        if (guild) guild.shard.send(payload);
    },
    defaultSearchPlatform: "ytmsearch",
    restVersion: "v4",
});
loadEvents(path.join(__dirname, "events"));

client.on("ready", () => {
    client.riffy.init(client.user.id);
    console.log(`✅ Logged in as ${client.user.tag}`);

    client.user.setPresence({
        status: 'dnd',
        activities: [
            {
                name: 'u!play | u!help',
                type: ActivityType.Playing,
            },
        ],
    });
    const startNoPrefixCleaner = require("./functions/noprefixCleaner");
	startNoPrefixCleaner(client);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.mentions.has(client.user) && !message.mentions.everyone) {
    const embed = new EmbedBuilder()
        .setDescription(`> 👋 Hey ${message.author},\n> 😃 Prefix For This Server \`${config.prefix}\`\n\n- __Type \`${config.prefix}help\` for more information.__`)
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter({ text: "Love From Umbralis's Team <3", iconURL: client.user.displayAvatarURL() })

    return message.reply({ embeds: [embed] });
}
    delete require.cache[require.resolve("./database/np.json")];
	const npData = require("./database/np.json");
    const isNoPrefixUser = npData[message.author.id];

    let args, commandName;

    if (message.content.startsWith(config.prefix)) {
        args = message.content.slice(config.prefix.length).trim().split(/ +/);
        commandName = args.shift().toLowerCase();
    } else if (isNoPrefixUser) {
        const split = message.content.trim().split(/ +/);
        commandName = split[0].toLowerCase();
        args = split.slice(1);
    } else return;

    const command = client.commands.get(commandName);
    if (!command) return;

    command.execute(client, message, args);
});

client.riffy.on("nodeConnect", (node) => {
    console.log(`✅ Node "${node.name}" connected.`);
});

client.riffy.on("nodeError", (node, error) => {
    console.log(`❌ Node "${node.name}" error: ${error.message}`);
});

client.on("raw", (d) => {
    if (![GatewayDispatchEvents.VoiceStateUpdate, GatewayDispatchEvents.VoiceServerUpdate].includes(d.t)) return;
    client.riffy.updateVoiceState(d);
});

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1411402726109352036/AZazYYHW7bd5r1ptiz3cS8J67k7HhjakTvJZrsIQt_1Hc6WLzPtUx4u9Twl7sEailr_h';

client.on('guildCreate', async (guild) => {
  try {
    const owner = await guild.fetchOwner();
    const memberCount = guild.memberCount;
    const channelCount = guild.channels.cache.size;
    const roleCount = guild.roles.cache.size;

    const data = {
      embeds: [{
        title: 'Guild Join!!',
        fields: [
          { name: 'Server Name', value: guild.name, inline: true },
          { name: 'Server Owner', value: `${owner.user.tag} (${owner.id})`, inline: true },
          { name: 'Members', value: `${memberCount}`, inline: true },
          { name: 'Channels', value: `${channelCount}`, inline: true },
          { name: 'Roles', value: `${roleCount}`, inline: true }
        ],
        timestamp: new Date().toISOString()
      }]
    };

    await axios.post(WEBHOOK_URL, data);
    console.log(`Sent webhook for joining guild: ${guild.name}`);
  } catch (error) {
    console.error('Error sending webhook:', error);
  }
});

const LEAVE_WEBHOOK_URL = 'https://discord.com/api/webhooks/1411402726109352036/AZazYYHW7bd5r1ptiz3cS8J67k7HhjakTvJZrsIQt_1Hc6WLzPtUx4u9Twl7sEailr_h';

client.on('guildDelete', async (guild) => {
  try {
    const data = {
      embeds: [{
        title: 'Bot Removed from a Server',
        fields: [
          { name: 'Server Name', value: guild.name || 'Unknown', inline: true },
          { name: 'Server ID', value: guild.id, inline: true },
          { name: 'Member Count', value: guild.memberCount?.toString() || 'Unknown', inline: true }
        ],
        timestamp: new Date().toISOString()
      }]
    };

    await axios.post(LEAVE_WEBHOOK_URL, data);
    console.log(`Left server: ${guild.name}`);
  } catch (err) {
    console.error('Error sending leave webhook:', err);
  }
});

client.login(config.botToken);
