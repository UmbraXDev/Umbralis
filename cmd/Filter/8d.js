module.exports = {
  name: '8d',
  description: "Enable 8d Filter",
  execute: async (client, message) => {
    const player = client.riffy.players.get(message.guild.id); 
    if (!player) return message.reply('No music is playing.');

    const filterData = {
      rotation: { rotationHz: 0.2 },
    };

    await player.node.rest.updatePlayer({
      guildId: message.guild.id,
      data: { filters: filterData },
    });

    message.reply('Applied `8D` filter!');
  }
};
