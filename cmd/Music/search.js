const { EmbedBuilder } = require('discord.js');
const ytSearch = require('yt-search');

module.exports = {
  name: 'search',
  description: 'Search for a song on YouTube',
  usage: 'search <song name>',

  async execute(client, message, args) {
    const query = args.join(' ');
    if (!query) {
      const usageEmbed = new EmbedBuilder()
        .setTitle('Missing Song Name')
        .setDescription('You must provide a song name to search.\n\n**Usage:**\nsearch <song name>');
      return message.channel.send({ embeds: [usageEmbed] });
    }

    const searchingEmbed = new EmbedBuilder()
      .setTitle('<:umbralis:1411680433099243550> Searching')
      .setDescription(`Searching YouTube for: **${query}**`);
    await message.channel.send({ embeds: [searchingEmbed] });

    try {
      const results = await ytSearch(query);
      const videos = results.videos.slice(0, 5);

      if (videos.length === 0) {
        const noResultEmbed = new EmbedBuilder()
          .setTitle('No Results')
          .setDescription(`<:cc:1411682128692908123> No videos found for: **${query}**`);
        return message.channel.send({ embeds: [noResultEmbed] });
      }

      const resultEmbed = new EmbedBuilder()
        .setTitle(`Top Results for "${query}"`);

      videos.forEach((video, index) => {
        resultEmbed.addFields({
          name: `${index + 1}. ${video.title}`,
          value: `Link: ${video.url}\nDuration: ${video.timestamp}\nChannel: ${video.author.name}`
        });
      });

      message.channel.send({ embeds: [resultEmbed] });

    } catch (err) {
      console.error(err);
      const errorEmbed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('<:cc:1411682128692908123> An unexpected error occurred while searching.');
      message.channel.send({ embeds: [errorEmbed] });
    }
  }
};
