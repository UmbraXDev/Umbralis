module.exports = {
  name: 'rotation',
  description: "Enable Rotation Filter",
  execute: async (client, message) => {
    const player = client.riffy.players.get(message.guild.id);
    if (!player) return message.reply('No music is playing.');

    const filterData = {
      rotation: {
        rotationHz: 0.2
      }
    };

    await player.node.rest.updatePlayer({
      guildId: message.guild.id,
      data: { filters: filterData },
    });

    message.reply('Applied `Rotation` filter!');
  }
};
