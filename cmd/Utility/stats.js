const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const os = require("os");
const { stripIndent } = require("common-tags");
const checkDiskSpace = require("check-disk-space").default;
const moment = require("moment");
require("moment-duration-format");

module.exports = {
  name: "stats",
  description: "Shows bot statistics.",

  async execute(client, message, args) {
    const guilds = client.guilds.cache.size;
    const channels = client.channels.cache.size;
    const users = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
    const platform = process.platform === "win32" ? "Windows" : process.platform;
    const architecture = os.arch();
    const cores = os.cpus().length;
    const cpuUsage = `${(process.cpuUsage().user / 1024 / 1024).toFixed(2)} MB`;
    const botUsed = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;
    const totalMemory = os.totalmem();
    const botUsage = `${((process.memoryUsage().heapUsed / totalMemory) * 100).toFixed(1)}%`;
    const botAvailable = `${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`;

    const overallUsed = `${((totalMemory - os.freemem()) / 1024 / 1024 / 1024).toFixed(2)} GB`;
    const overallAvailable = `${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`;
    const overallUsage = `${Math.floor(((totalMemory - os.freemem()) / totalMemory) * 100)}%`;

    const diskStats = await getDiskStats();
    const lavalinkInfo = (await getNodeStats(client)) || "No Lavalink node info available";
    if (!diskStats) return message.reply("Failed to get disk stats.");

    const uptime = formatUptime(process.uptime());

    const embed = new EmbedBuilder()
      .setTitle("<:bot:1411680377554210818> Bot Statistics")
      .setThumbnail(client.user.displayAvatarURL())
      .setColor("#00d9ff")
      .setDescription(stripIndent`
        <:info:1411687117972836494> **General Info**
        • Servers: \`${guilds}\`
        • Users: \`${users.toLocaleString()}\`
        • Channels: \`${channels}\`
        • Ping: \`${client.ws.ping}ms\`
        • NodeJS Version: \`${process.versions.node}\`
        • DiscordJS Version: \`${require("discord.js").version}\`
      `)
      .addFields(
        {
          name: "<:cpu:1411687035332329573> CPU",
          value: stripIndent`
            • **OS:** ${platform} [${architecture}]
            • **Cores:** ${cores}
            • **Usage:** ${cpuUsage}
          `,
          inline: true,
        },
        {
          name: "<:rrrr:1411686927366623404> Bot RAM",
          value: stripIndent`
            • **Used:** ${botUsed}
            • **Available:** ${botAvailable}
            • **Usage:** ${botUsage}
          `,
          inline: true,
        },
        {
          name: "<:storage:1411687970146226286> Disk Storage",
          value: stripIndent`
            • **Used:** ${diskStats.used}
            • **Total:** ${diskStats.total}
            • **Usage:** ${diskStats.usagePercent}
          `,
          inline: true,
        },
        {
          name: "<:music:1411680343639068864>  Lavalink Node Info",
          value: lavalinkInfo,
          inline: false,
        },
        {
          name: "<:upt:1411686973139058739> Uptime",
          value: `\`\`\`${uptime}\`\`\``,
          inline: false,
        }
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Invite Bot")
        .setEmoji("<:umbralis:1411680433099243550>")
        .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`)
        .setStyle(ButtonStyle.Link),

      new ButtonBuilder()
        .setLabel("Support Server")
        .setEmoji("<:umbralis:1411680433099243550>")
        .setURL("https://discord.gg/hcvjdf6Jbs")
        .setStyle(ButtonStyle.Link)
    );

    return message.reply({ embeds: [embed], components: [buttons] });
  },
};

function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours}h ${minutes}m ${secs}s`;
}

async function getDiskStats() {
  try {
    const rootPath = process.platform === 'win32' ? 'C:/' : '/';
    const info = await checkDiskSpace(rootPath);
    const used = info.size - info.free;

    return {
      used: (used / 1024 / 1024 / 1024).toFixed(2) + ' GB',
      total: (info.size / 1024 / 1024 / 1024).toFixed(2) + ' GB',
      usagePercent: ((used / info.size) * 100).toFixed(2) + '%',
    };
  } catch (err) {
    console.error('Disk usage check error:', err);
    return null;
  }
}

function getNodeStats(client) {
  if (!client.riffy?.nodes?.size) return "• No Lavalink nodes found.";
  let nodesInfo = "";

  client.riffy.nodes.forEach((node) => {
    const lavalinkNode = client.riffy.nodeMap.get(node.name);

    if (!lavalinkNode || !lavalinkNode.stats) {
      nodesInfo += `\`\`\`yml\nNode: ${node.name}\nStats not available.\n\`\`\`\n`;
      return;
    }

    const memUsedMB = (lavalinkNode.stats.memory.used / 1024 / 1024).toFixed(2);
    const memTotalMB = (lavalinkNode.stats.memory.reservable / 1024 / 1024).toFixed(2);
    const uptimeFormatted = moment.duration(lavalinkNode.stats.uptime).format("d [Days] ・ h [Hrs] ・ m [Mins] ・ s [Secs]");

    nodesInfo += `\`\`\`yml
Node: ${node.name}
Uptime: ${uptimeFormatted}
Memory: ${memUsedMB} MB / ${memTotalMB} MB
Players: ${lavalinkNode.stats.playingPlayers} playing out of ${lavalinkNode.stats.players} total
\`\`\`\n`;
  });

  return nodesInfo || "• No Lavalink node stats available yet.";
}
