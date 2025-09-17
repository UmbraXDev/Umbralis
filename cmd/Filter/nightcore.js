module.exports = {
  name: 'nightcore',
  description: "Enable Nightcore Filter",
  execute: async (client, message) => {
    const player = client.riffy.players.get(message.guild.id); 
    if (!player) return message.reply('❌ No music is playing.');

    const filterData = {
      timescale: {
        speed: 1.2,  
        pitch: 1.2,   
        rate: 1.1    
      }
    };

    await player.node.rest.updatePlayer({
      guildId: message.guild.id,
      data: { filters: filterData },
    });

    message.reply('Applied `Nightcore` filter!');
  }
};
