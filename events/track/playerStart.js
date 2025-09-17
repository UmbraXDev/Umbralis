const {
    EmbedBuilder,
    AttachmentBuilder
} = require("discord.js");
const { createCanvas, loadImage, registerFont } = require("@napi-rs/canvas");
const https = require("https");
const http = require("http");

module.exports = (client) => {
    client.riffy.on("trackStart", async (player, track) => {
        const channel = client.channels.cache.get(player.textChannel);
        if (!channel) return;

        if (!track.info.requester) track.info.requester = client.user;

        const duration = formatDuration(track.info.length);
        const currentTime = new Date().toLocaleTimeString();

        try {
            // Create the music card using @napi-rs/canvas
            const cardBuffer = await createMusicCard(track, duration, track.info.requester);
            const attachment = new AttachmentBuilder(cardBuffer, { name: "music-card.png" });

            // Create a simple embed to go with the card
            const embed = new EmbedBuilder()
                .setTitle(" <:music:1411680343639068864> Now Playing")
                .setURL(track.info.uri)
                .setColor("#00d9ff")
                .setDescription(`**[${track.info.title}](${track.info.uri})**`)
                .addFields(
                    {
                        name: "<:umbralis:1411680433099243550>  Artist",
                        value: `\`\`\`${track.info.author || "Unknown"}\`\`\``,
                        inline: true
                    },
                    {
                        name: "<:upt:1411686973139058739> Duration",
                        value: `\`\`\`${duration}\`\`\``,
                        inline: true
                    },
                    {
                        name: "<:upt:1411686973139058739> Started At",
                        value: `\`\`\`${currentTime}\`\`\``,
                        inline: true
                    },
                    {
                        name: "<:cpu:1411687035332329573> Source",
                        value: `\`\`\`${getSourceName(track.info.uri)}\`\`\``,
                        inline: true
                    },
                    {
                        name: "<:info:1411687117972836494> Quality",
                        value: `\`\`\`${track.info.isStream ? "Live Stream" : "Audio Track"}\`\`\``,
                        inline: true
                    },
                    {
                        name: "<:info:1411687117972836494> Status",
                        value: `\`\`\`${player.paused ? "Paused" : "Playing"}\`\`\``,
                        inline: true
                    }
                )
                .setImage("attachment://music-card.png")
                .setFooter({
                    text: `<:music:1411680343639068864> Requested by ${track.info.requester?.tag || "Unknown"} • Umbralis Music Player`,
                    iconURL: track.info.requester?.displayAvatarURL?.() || client.user.displayAvatarURL(),
                })
                .setTimestamp();

            // Send the message with the card attachment
            await channel.send({ 
                embeds: [embed], 
                files: [attachment] 
            });

        } catch (error) {
            console.error("Error creating music card:", error);
            
            // Fallback to simple embed if card generation fails
            const fallbackEmbed = new EmbedBuilder()
                .setTitle("<:music:1411680343639068864> Now Playing")
                .setURL(track.info.uri)
                .setColor("#00d9ff")
                .setThumbnail(track.info.artworkUrl || track.info.thumbnail || "https://i.imgur.com/3ZUrjUP.png")
                .setDescription(`**[${track.info.title}](${track.info.uri})**`)
                .addFields(
                    {
                        name: "<:umbralis:1411680433099243550>  Artist",
                        value: `\`\`\`${track.info.author || "Unknown"}\`\`\``,
                        inline: true
                    },
                    {
                        name: "<:umbralis:1411680433099243550>  Duration",
                        value: `\`\`\`${duration}\`\`\``,
                        inline: true
                    },
                    {
                        name: "<:umbralis:1411680433099243550>  Source",
                        value: `\`\`\`${getSourceName(track.info.uri)}\`\`\``,
                        inline: true
                    }
                )
                .setFooter({
                    text: `<:music:1411680343639068864> Requested by ${track.info.requester?.tag || "Unknown"} • Umbralis Music Player`,
                    iconURL: track.info.requester?.displayAvatarURL?.() || client.user.displayAvatarURL(),
                })
                .setTimestamp();

            await channel.send({ embeds: [fallbackEmbed] });
        }
    });
};

async function createMusicCard(track, duration, requester) {
    const canvas = createCanvas(800, 280);
    const ctx = canvas.getContext("2d");

    // Create sophisticated gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 800, 280);
    bgGradient.addColorStop(0, "#0a1929");
    bgGradient.addColorStop(0.5, "#1e3a8a");
    bgGradient.addColorStop(1, "#0f172a");
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 800, 280);

    // Add subtle wave pattern overlay
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = "#00d9ff";
    ctx.lineWidth = 2;
    for (let i = 0; i < 800; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        for (let j = 0; j < 280; j += 20) {
            ctx.lineTo(i + Math.sin(j * 0.1) * 10, j);
        }
        ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    try {
        // Load and draw album artwork - left side, perfectly centered
        const artworkUrl = track.info.artworkUrl || track.info.thumbnail || "https://i.imgur.com/3ZUrjUP.png";
        const artwork = await loadImageFromUrl(artworkUrl);
        
        const artworkSize = 200;
        const artworkX = 40;
        const artworkY = (280 - artworkSize) / 2; // Center vertically
        
        // Create artwork shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 8;
        ctx.shadowOffsetY = 8;
        
        // Create rounded corners for artwork
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(artworkX, artworkY, artworkSize, artworkSize, 15);
        ctx.clip();
        ctx.drawImage(artwork, artworkX, artworkY, artworkSize, artworkSize);
        ctx.restore();

        // Reset shadow
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Add artwork border
        ctx.strokeStyle = "#00d9ff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(artworkX, artworkY, artworkSize, artworkSize, 15);
        ctx.stroke();

    } catch (error) {
        console.error("Failed to load artwork:", error);
        
        // Draw enhanced default music icon if artwork fails
        const artworkSize = 200;
        const artworkX = 40;
        const artworkY = (280 - artworkSize) / 2;
        
        const iconGradient = ctx.createRadialGradient(
            artworkX + artworkSize/2, artworkY + artworkSize/2, 0,
            artworkX + artworkSize/2, artworkY + artworkSize/2, artworkSize/2
        );
        iconGradient.addColorStop(0, "#00d9ff");
        iconGradient.addColorStop(1, "#0066aa");
        
        ctx.fillStyle = iconGradient;
        ctx.beginPath();
        ctx.roundRect(artworkX, artworkY, artworkSize, artworkSize, 15);
        ctx.fill();
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 60px Arial";
        ctx.textAlign = "center";
        ctx.fillText("🎵", artworkX + artworkSize/2, artworkY + artworkSize/2 + 20);
    }

    // Content area - right side
    const contentX = 280;
    const contentWidth = 480;

    // Title text - top of content area
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "left";
    
    const title = truncateText(ctx, track.info.title || "Unknown Title", contentWidth - 20);
    ctx.fillText(title, contentX, 60);

    // Artist text - below title
    ctx.fillStyle = "#00d9ff";
    ctx.font = "20px Arial";
    const artist = truncateText(ctx, track.info.author || "Unknown Artist", contentWidth - 20);
    ctx.fillText(artist, contentX, 90);

    // Info section - grid layout in middle
    const infoStartY = 125;
    const infoSpacing = 35;
    
    // Left column
    drawCleanInfoItem(ctx, contentX, infoStartY, "⏱️", "Duration", duration, "#00d9ff");
    drawCleanInfoItem(ctx, contentX, infoStartY + infoSpacing, "🎧", "Source", getSourceName(track.info.uri), "#00d9ff");
    
    // Right column
    const rightColX = contentX + 240;
    const statusText = track.info.isStream ? "Live Stream" : "Audio Track";
    drawCleanInfoItem(ctx, rightColX, infoStartY, "📊", "Type", statusText, "#00d9ff");
    drawCleanInfoItem(ctx, rightColX, infoStartY + infoSpacing, "👤", "By", requester?.username || "Unknown", "#00d9ff");

    // Bottom section - Now Playing indicator
    const bottomY = 230;
    
    // Now Playing bar
    const barGradient = ctx.createLinearGradient(contentX, bottomY, contentX + contentWidth - 20, bottomY);
    barGradient.addColorStop(0, "rgba(0, 217, 255, 0.3)");
    barGradient.addColorStop(0.5, "rgba(0, 217, 255, 0.6)");
    barGradient.addColorStop(1, "rgba(0, 217, 255, 0.3)");
    
    ctx.fillStyle = barGradient;
    ctx.beginPath();
    ctx.roundRect(contentX, bottomY, contentWidth - 20, 30, 15);
    ctx.fill();
    
    ctx.strokeStyle = "#00d9ff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Now Playing text and indicator
    ctx.fillStyle = "#00ff88";
    ctx.beginPath();
    ctx.arc(contentX + 20, bottomY + 15, 6, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px Arial";
    ctx.fillText("NOW PLAYING", contentX + 35, bottomY + 19);
    
    // Umbralis branding
    ctx.font = "12px Arial";
    ctx.fillStyle = "#00d9ff";
    ctx.textAlign = "right";
    ctx.fillText("Umbralis Music Player", contentX + contentWidth - 30, bottomY + 19);

    return canvas.toBuffer("image/png");
}

function drawCleanInfoItem(ctx, x, y, icon, label, value, color) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    
    // Icon
    ctx.fillText(icon, x, y);
    
    // Label
    ctx.fillStyle = color;
    ctx.fillText(label + ":", x + 25, y);
    
    // Value
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px Arial";
    const labelWidth = ctx.measureText(label + ":").width;
    const truncatedValue = truncateText(ctx, value, 180 - labelWidth);
    ctx.fillText(truncatedValue, x + 25 + labelWidth + 5, y);
}

async function loadImageFromUrl(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https:') ? https : http;
        
        const request = client.get(url, (res) => {
            // Handle redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return loadImageFromUrl(res.headers.location).then(resolve).catch(reject);
            }
            
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
            }
            
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', async () => {
                try {
                    const buffer = Buffer.concat(chunks);
                    const image = await loadImage(buffer);
                    resolve(image);
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        request.on('error', reject);
        request.setTimeout(5000, () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

function truncateText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) {
        return text;
    }
    
    let truncated = text;
    while (ctx.measureText(truncated + "...").width > maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
    }
    return truncated + "...";
}

function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getSourceName(uri) {
    if (uri.includes('youtube.com') || uri.includes('youtu.be')) return 'YouTube';
    if (uri.includes('spotify.com')) return 'Spotify';
    if (uri.includes('soundcloud.com')) return 'SoundCloud';
    if (uri.includes('twitch.tv')) return 'Twitch';
    if (uri.includes('bandcamp.com')) return 'Bandcamp';
    if (uri.includes('apple.com')) return 'Apple Music';
    if (uri.includes('deezer.com')) return 'Deezer';
    return 'Unknown Source';
}