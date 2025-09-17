const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "play",
    description: 'Play <song>',
    aliases: ["p"],
    async execute(client, message, args) {
        const query = args.join(" ");

        if (!query) {
            const noQueryEmbed = new EmbedBuilder()
                .setTitle("No Search Query")
                .setDescription("Please provide a search query to play a track.");
            return message.channel.send({ embeds: [noQueryEmbed] });
        }

        if (!message.member.voice.channel) {
            const noVCEmbed = new EmbedBuilder()
                .setDescription("You must be in a voice channel to use this command.");
            return message.channel.send({ embeds: [noVCEmbed] });
        }

        try {
            const player = client.riffy.createConnection({
                guildId: message.guild.id,
                voiceChannel: message.member.voice.channel.id,
                textChannel: message.channel.id,
                deaf: true,
            });

            const resolve = await client.riffy.resolve({
                query,
                requester: message.author,
            });

            const { loadType, tracks } = resolve;

            if (loadType === "search" || loadType === "track") {
                const track = tracks.shift();
                track.info.requester = message.author;
                const position = player.queue.length + 1;
                player.queue.add(track);

                const trackEmbed = new EmbedBuilder()
                    .setTitle("Track Added")
                    .setDescription(`**${track.info.title}** has been added to the queue at position **${position}**.`)
                    .setURL(track.info.uri);

                await message.channel.send({ embeds: [trackEmbed] });

                if (!player.playing && !player.paused) player.play();
            } else {
                const noResultsEmbed = new EmbedBuilder()
                    .setTitle("No Results Found")
                    .setDescription("No tracks were found for that query. Try something else.");
                return message.channel.send({ embeds: [noResultsEmbed] });
            }
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setTitle("Playback Error")
                .setDescription("An error occurred while trying to play the track.");
            return message.channel.send({ embeds: [errorEmbed] });
        }
    }
};
