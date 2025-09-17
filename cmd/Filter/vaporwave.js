module.exports = {
  name: 'vaporwave',
  description: "Enable Vaporwave Filter",
  execute: async (client, message) => {
    const player = client.riffy.players.get(message.guild.id);
    if (!player) return message.reply('No music is playing.');

    const filterData = {
      timescale: {
        speed: 0.85,
        pitch: 0.8,
        rate: 0.9
      },
      tremolo: {
        frequency: 2.0,
        depth: 0.3
      }
    };

    await player.node.rest.updatePlayer({
      guildId: message.guild.id,
      data: { filters: filterData },
    });

    message.reply('Applied `Vaporwave` filter!');
  }
};
