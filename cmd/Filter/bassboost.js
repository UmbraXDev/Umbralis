module.exports = {
  name: 'bassboost',
  description: "Enable Bassboost Filter",
  execute: async (client, message) => {
    const player = client.riffy.players.get(message.guild.id); 
    if (!player) return message.reply('No music is playing.');

    const gain = 0.3;

    const equalizer = Array(15).fill(0).map((_, i) => ({
      band: i,
      gain: i < 7 ? gain : 0
    }));

    await player.node.rest.updatePlayer({
      guildId: message.guild.id,
      data: { filters: { equalizer } }
    });

    message.reply('Applied `BassBoost` filter!');
  }
};
