module.exports = {
  name: 'reset',
  description: "Reset All Filter",
  execute: async (client, message) => {
    const player = client.riffy.players.get(message.guild.id); 
    if (!player) return message.reply('No music is playing.');

    await player.node.rest.updatePlayer({
      guildId: message.guild.id,
      data: { filters: {} }, 
    });

    message.reply('All filters have been reset.');
  }
};
