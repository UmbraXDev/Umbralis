module.exports = {
  name: 'lofi',
  description: "Enable Lofi Filter",
  execute: async (client, message) => {
    const player = client.riffy.players.get(message.guild.id);
    if (!player) return message.reply('No music is playing.');

    const filterData = {
      timescale: {
        speed: 0.9,  
        pitch: 0.8,    
        rate: 0.9,    
      }
    };

    await player.node.rest.updatePlayer({
      guildId: message.guild.id,
      data: { filters: filterData },
    });

    message.reply('Applied `Lofi` filter!');
  }
};
