module.exports = {
  name: 'karaoke',
  description: "Enable Karaoke Filter",
  execute: async (client, message) => {
    const player = client.riffy.players.get(message.guild.id);
    if (!player) return message.reply('No music is playing.');

    const filterData = {
      karaoke: {
        level: 1.0,
        monoLevel: 1.0,
        filterBand: 220.0,
        filterWidth: 100.0
      }
    };

    await player.node.rest.updatePlayer({
      guildId: message.guild.id,
      data: { filters: filterData },
    });

    message.reply('Applied `Karaoke` filter!');
  }
};
