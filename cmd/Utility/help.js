const fs = require("fs");
const path = require("path");
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
} = require("discord.js");
const { createCanvas, loadImage } = require("@napi-rs/canvas");

const ITEMS_PER_PAGE = 5;
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 700;
const COMMANDS_ROOT = path.join(__dirname, "../", "../", "cmd");

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function clipCircle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x + r, y + r, r, 0, Math.PI * 2, false);
  ctx.clip();
}

function drawGlow(ctx, x, y, w, h, r, color, blur) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = 'transparent';
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.restore();
}

function drawPattern(ctx) {
  ctx.save();
  ctx.globalAlpha = 0.02;
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1;
  
  for (let i = 0; i < CANVAS_WIDTH; i += 40) {
    for (let j = 0; j < CANVAS_HEIGHT; j += 40) {
      ctx.beginPath();
      ctx.arc(i, j, 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

class HelpCanvas {
  constructor() {
    this.canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.ctx = this.canvas.getContext("2d");
  }

  async drawBackground() {
    const ctx = this.ctx;
    const w = CANVAS_WIDTH;
    const h = CANVAS_HEIGHT;

    ctx.clearRect(0, 0, w, h);

    // Main gradient background - darker
    const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
    gradient.addColorStop(0, "#0a0a0a");
    gradient.addColorStop(0.5, "#050505");
    gradient.addColorStop(1, "#000000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Add subtle pattern
    drawPattern(ctx);

    // Outer glow effect - darker
    drawGlow(ctx, 20, 20, w - 40, h - 40, 25, '#1a1a1a', 20);
    
    // Main container - darker
    ctx.fillStyle = "rgba(15, 15, 15, 0.6)";
    roundRect(ctx, 20, 20, w - 40, h - 40, 25);
    ctx.fill();

    // Border with darker gradient
    const borderGradient = ctx.createLinearGradient(0, 0, w, h);
    borderGradient.addColorStop(0, "rgba(60, 60, 60, 0.4)");
    borderGradient.addColorStop(0.5, "rgba(80, 80, 80, 0.3)");
    borderGradient.addColorStop(1, "rgba(70, 70, 70, 0.4)");
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 2;
    roundRect(ctx, 20, 20, w - 40, h - 40, 25);
    ctx.stroke();
  }

  async drawHeader(client, title) {
    const ctx = this.ctx;
    const x = 40;
    const y = 40;
    const width = CANVAS_WIDTH - 80;
    const height = 100;

    // Header glow - darker
    drawGlow(ctx, x, y, width, height, 20, '#2a2a2a', 15);

    // Header background with darker gradient
    const headerGradient = ctx.createLinearGradient(x, y, x, y + height);
    headerGradient.addColorStop(0, "rgba(25, 25, 25, 0.8)");
    headerGradient.addColorStop(1, "rgba(15, 15, 15, 0.9)");
    ctx.fillStyle = headerGradient;
    roundRect(ctx, x, y, width, height, 20);
    ctx.fill();

    // Header border - darker
    ctx.strokeStyle = "rgba(80, 80, 80, 0.6)";
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, width, height, 20);
    ctx.stroke();

    // Title with darker shadow
    ctx.save();
    ctx.shadowColor = '#666666';
    ctx.shadowBlur = 10;
    ctx.font = "bold 32px 'Segoe UI', Arial";
    ctx.fillStyle = "#e0e0e0";
    ctx.textAlign = "center";
    ctx.fillText(title, CANVAS_WIDTH / 2, y + 65);
    ctx.restore();

    // Avatar with darker glow
    try {
      const avatar = await loadImage(
        client.user.displayAvatarURL({ format: "png", size: 128 })
      );
      
      ctx.save();
      ctx.shadowColor = '#555555';
      ctx.shadowBlur = 20;
      clipCircle(ctx, x + 20, y + 15, 35);
      ctx.drawImage(avatar, x + 20, y + 15, 70, 70);
      ctx.restore();

      // Avatar border - darker
      ctx.strokeStyle = "#777777";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + 55, y + 50, 37, 0, Math.PI * 2);
      ctx.stroke();
    } catch (error) {
      console.error("Failed to load avatar:", error);
    }
  }

  drawCategories(categories) {
    const ctx = this.ctx;
    const startY = 170;
    const boxHeight = 70;
    const boxWidth = 750;
    const centerX = (CANVAS_WIDTH - boxWidth) / 2;

    categories.forEach((cat, i) => {
      if (cat.toLowerCase() === "dev") return;
      const y = startY + i * (boxHeight + 20);

      // Card glow - darker
      drawGlow(ctx, centerX - 5, y - 5, boxWidth + 10, boxHeight + 10, 18, '#1f1f1f', 10);

      // Card gradient background - darker
      const cardGradient = ctx.createLinearGradient(centerX, y, centerX + boxWidth, y + boxHeight);
      cardGradient.addColorStop(0, "rgba(30, 30, 30, 0.3)");
      cardGradient.addColorStop(1, "rgba(20, 20, 20, 0.4)");
      ctx.fillStyle = cardGradient;
      roundRect(ctx, centerX, y, boxWidth, boxHeight, 18);
      ctx.fill();

      // Card border with darker hover effect simulation
      const borderGradient = ctx.createLinearGradient(centerX, y, centerX + boxWidth, y);
      borderGradient.addColorStop(0, "rgba(70, 70, 70, 0.5)");
      borderGradient.addColorStop(0.5, "rgba(90, 90, 90, 0.4)");
      borderGradient.addColorStop(1, "rgba(80, 80, 80, 0.5)");
      ctx.strokeStyle = borderGradient;
      ctx.lineWidth = 2;
      roundRect(ctx, centerX, y, boxWidth, boxHeight, 18);
      ctx.stroke();

      // Category icon background - darker
      ctx.fillStyle = "rgba(50, 50, 50, 0.4)";
      ctx.beginPath();
      ctx.arc(centerX + 40, y + 35, 25, 0, Math.PI * 2);
      ctx.fill();

      // Category emoji/icon
      ctx.font = "24px Arial";
      ctx.fillStyle = "#999999";
      ctx.textAlign = "center";
      
      const categoryIcons = {
        'music': '🎵', 'moderation': '🛡️', 'utility': '🔧', 
        'fun': '🎮', 'info': 'ℹ️', 'admin': '👑'
      };
      const icon = categoryIcons[cat.toLowerCase()] || '📁';
      ctx.fillText(icon, centerX + 40, y + 42);

      // Category name with darker gradient
      const nameGradient = ctx.createLinearGradient(0, y, 0, y + boxHeight);
      nameGradient.addColorStop(0, "#d0d0d0");
      nameGradient.addColorStop(1, "#a0a0a0");
      ctx.fillStyle = nameGradient;
      ctx.font = "bold 24px 'Segoe UI', Arial";
      ctx.textAlign = "left";
      ctx.fillText(cat.charAt(0).toUpperCase() + cat.slice(1), centerX + 80, y + 42);

      // Command count - darker
      try {
        const commandsCount = fs
          .readdirSync(path.join(COMMANDS_ROOT, cat))
          .filter((f) => f.endsWith(".js")).length;

        ctx.font = "18px 'Segoe UI', Arial";
        ctx.fillStyle = "#888888";
        ctx.textAlign = "right";
        ctx.fillText(`${commandsCount} commands`, centerX + boxWidth - 30, y + 42);
      } catch (error) {
        console.error(`Failed to read category ${cat}:`, error);
        ctx.font = "18px 'Segoe UI', Arial";
        ctx.fillStyle = "#888888";
        ctx.textAlign = "right";
        ctx.fillText("0 commands", centerX + boxWidth - 30, y + 42);
      }
    });
  }

  drawCommands(commands, startY = 170) {
    const ctx = this.ctx;
    const cardWidth = 800;
    const cardHeight = 85;
    const centerX = (CANVAS_WIDTH - cardWidth) / 2;

    commands.forEach((cmd, i) => {
      if (i >= ITEMS_PER_PAGE) return;
      const y = startY + i * (cardHeight + 15);

      // Command card glow - darker
      drawGlow(ctx, centerX - 3, y - 3, cardWidth + 6, cardHeight + 6, 15, '#1a1a1a', 8);

      // Command card background - darker
      const cmdGradient = ctx.createLinearGradient(centerX, y, centerX, y + cardHeight);
      cmdGradient.addColorStop(0, "rgba(25, 25, 25, 0.4)");
      cmdGradient.addColorStop(1, "rgba(15, 15, 15, 0.5)");
      ctx.fillStyle = cmdGradient;
      roundRect(ctx, centerX, y, cardWidth, cardHeight, 15);
      ctx.fill();

      // Command card border - darker
      ctx.strokeStyle = "rgba(60, 60, 60, 0.5)";
      ctx.lineWidth = 1.5;
      roundRect(ctx, centerX, y, cardWidth, cardHeight, 15);
      ctx.stroke();



      // Command name with CYAN-WHITE GRADIENT
      ctx.save();
      ctx.shadowColor = 'rgba(100, 200, 255, 0.5)';
      ctx.shadowBlur = 5;
      ctx.font = "bold 22px 'Segoe UI', Arial";
      
      // Create gradient for command name (cyan to white)
      const nameGradient = ctx.createLinearGradient(centerX + 50, y + 20, centerX + 50, y + 45);
      nameGradient.addColorStop(0, "#00FFFF"); // Cyan
      nameGradient.addColorStop(1, "#FFFFFF"); // White
      
      ctx.fillStyle = nameGradient;
      ctx.textAlign = "left";
      ctx.fillText(cmd.name, centerX + 50, y + 35);
      ctx.restore();

      // Command description - PURE WHITE
      ctx.font = "16px 'Segoe UI', Arial";
      ctx.fillStyle = "#FFFFFF"; // Pure white instead of #999999
      const desc = cmd.description && cmd.description.length > 65 
        ? cmd.description.slice(0, 62) + "..." 
        : cmd.description || "No description";
      ctx.fillText(desc, centerX + 50, y + 60);

      // Status indicator - NEON GREEN with glow
      ctx.save();
      ctx.shadowColor = "#00FF00"; // Neon green glow
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#00FF00"; // Neon green instead of #4a8a4a
      ctx.beginPath();
      ctx.arc(centerX + cardWidth - 25, y + 25, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  drawFooter(text) {
    const ctx = this.ctx;
    
    // Footer background - darker
    const footerY = CANVAS_HEIGHT - 60;
    const footerGradient = ctx.createLinearGradient(0, footerY, 0, CANVAS_HEIGHT);
    footerGradient.addColorStop(0, "rgba(20, 20, 20, 0.5)");
    footerGradient.addColorStop(1, "rgba(10, 10, 10, 0.7)");
    ctx.fillStyle = footerGradient;
    roundRect(ctx, 40, footerY, CANVAS_WIDTH - 80, 40, 10);
    ctx.fill();

    // Footer text with darker glow
    ctx.save();
    ctx.shadowColor = '#555555';
    ctx.shadowBlur = 8;
    ctx.font = "18px 'Segoe UI', Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#aaaaaa";
    ctx.fillText(text, CANVAS_WIDTH / 2, footerY + 25);
    ctx.restore();
  }

  drawPageIndicator(current, total) {
    const ctx = this.ctx;
    
    // Page indicator background - darker
    const indicatorY = CANVAS_HEIGHT - 30;
    ctx.fillStyle = "rgba(40, 40, 40, 0.6)";
    roundRect(ctx, CANVAS_WIDTH - 120, indicatorY - 15, 100, 25, 12);
    ctx.fill();

    ctx.font = "16px 'Segoe UI', Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#cccccc";
    ctx.fillText(`${current} / ${total}`, CANVAS_WIDTH - 70, indicatorY);
  }

  getBuffer() {
    return this.canvas.toBuffer("image/png"); 
  }
}

module.exports = {
  name: "help",
  aliases: ["h"],
  description: "Shows help menu",
  async execute(client, message, args) {
    try {
      if (!fs.existsSync(COMMANDS_ROOT)) {
        return message.channel.send("Commands directory not found!");
      }

      const categories = fs
        .readdirSync(COMMANDS_ROOT)
        .filter((f) => {
          const fullPath = path.join(COMMANDS_ROOT, f);
          return !f.includes(".") && 
                 fs.statSync(fullPath).isDirectory() && 
                 f.toLowerCase() !== "dev";
        });

      let selectedCategory = args[0]?.toLowerCase() || null;
      let commands = [];

      if (selectedCategory && !categories.includes(selectedCategory)) {
        selectedCategory = null;
      }

      if (selectedCategory) {
        try {
          commands = fs
            .readdirSync(path.join(COMMANDS_ROOT, selectedCategory))
            .filter((f) => f.endsWith(".js"))
            .map((file) => {
              try {
                const filePath = path.join(COMMANDS_ROOT, selectedCategory, file);
                delete require.cache[require.resolve(filePath)];
                const cmd = require(filePath);
                return {
                  name: cmd.name || file.replace(".js", ""),
                  description: cmd.description || "No description",
                };
              } catch (error) {
                console.error(`Failed to load command ${file}:`, error);
                return {
                  name: file.replace(".js", ""),
                  description: "Failed to load command",
                };
              }
            });
        } catch (error) {
          console.error(`Failed to read category ${selectedCategory}:`, error);
          return message.channel.send("Failed to load commands from this category!");
        }
      }

      const totalPages = selectedCategory ? Math.ceil(commands.length / ITEMS_PER_PAGE) : 1;
      const canvas = new HelpCanvas();

      if (!selectedCategory) {
        await canvas.drawBackground();
        await canvas.drawHeader(client, `${client.user.username} Help Portal`);
        canvas.drawCategories(categories);
        canvas.drawFooter("✨ Crafted with passion by the Umbralis Team ✨");

        const attachment = new AttachmentBuilder(canvas.getBuffer(), { name: "help.png" });

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId("help_category_select")
          .setPlaceholder("🔍 Choose a command category")
          .addOptions([
            { label: "🏠 Home", description: "Return to main menu", value: "home", emoji: "🏠" },
            ...categories.map((cat) => {
              const categoryEmojis = {
                'music': '🎵', 'moderation': '🛡️', 'utility': '🔧', 
                'fun': '🎮', 'info': 'ℹ️', 'admin': '👑'
              };
              return {
                label: cat.charAt(0).toUpperCase() + cat.slice(1),
                description: `Explore ${cat} commands`,
                value: cat,
                emoji: categoryEmojis[cat.toLowerCase()] || "📁"
              };
            }),
          ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const sent = await message.channel.send({
          files: [attachment],
          components: [row],
        });

        const collector = sent.createMessageComponentCollector({ 
          time: 300000,
          filter: (i) => i.user.id === message.author.id
        });
        
        let currentSelectedCategory = null;
        let page = 1;

        collector.on("collect", async (i) => {
          try {
            await i.deferUpdate();

            if (i.customId === "help_category_select") {
              const val = i.values[0];
              if (val === "home") {
                currentSelectedCategory = null;
                page = 1;
                
                const newCanvas = new HelpCanvas();
                await newCanvas.drawBackground();
                await newCanvas.drawHeader(client, `${client.user.username} Help Portal`);
                newCanvas.drawCategories(categories);
                newCanvas.drawFooter("✨ Crafted with passion by the Umbralis Team ✨");
                
                const att = new AttachmentBuilder(newCanvas.getBuffer(), { name: "help.png" });
                return await i.editReply({ files: [att], components: [row] });
              } else {
                currentSelectedCategory = val;
                page = 1;
                
                try {
                  commands = fs
                    .readdirSync(path.join(COMMANDS_ROOT, val))
                    .filter((f) => f.endsWith(".js"))
                    .map((file) => {
                      try {
                        const filePath = path.join(COMMANDS_ROOT, val, file);
                        delete require.cache[require.resolve(filePath)];
                        const cmd = require(filePath);
                        return {
                          name: cmd.name || file.replace(".js", ""),
                          description: cmd.description || "No description",
                        };
                      } catch (error) {
                        console.error(`Failed to load command ${file}:`, error);
                        return {
                          name: file.replace(".js", ""),
                          description: "Failed to load command",
                        };
                      }
                    });

                  const newCanvas = new HelpCanvas();
                  await newCanvas.drawBackground();
                  await newCanvas.drawHeader(client, `${client.user.username} Helper Portal`);
                  newCanvas.drawCommands(commands.slice(0, ITEMS_PER_PAGE));
                  newCanvas.drawPageIndicator(page, Math.ceil(commands.length / ITEMS_PER_PAGE));
                  newCanvas.drawFooter(`📋 ${commands.length} commands available`);
                  
                  const att = new AttachmentBuilder(newCanvas.getBuffer(), { name: "help.png" });

                  const prevBtn = new ButtonBuilder()
                    .setCustomId("prev_page")
                    .setLabel("Previous")
                    .setEmoji("⬅️")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true);

                  const nextBtn = new ButtonBuilder()
                    .setCustomId("next_page")
                    .setLabel("Next")
                    .setEmoji("➡️")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(commands.length <= ITEMS_PER_PAGE);

                  const buttonsRow = new ActionRowBuilder().addComponents(prevBtn, nextBtn);
                  return await i.editReply({ files: [att], components: [row, buttonsRow] });
                } catch (error) {
                  console.error(`Failed to load category ${val}:`, error);
                  return await i.followUp({ 
                    content: "❌ Failed to load commands from this category!", 
                    ephemeral: true 
                  });
                }
              }
            }

            if (!currentSelectedCategory) return;

            if (i.customId === "prev_page" && page > 1) {
              page--;
            } else if (i.customId === "next_page" && page < Math.ceil(commands.length / ITEMS_PER_PAGE)) {
              page++;
            }

            const newCanvas = new HelpCanvas();
            await newCanvas.drawBackground();
            await newCanvas.drawHeader(client, `${currentSelectedCategory.charAt(0).toUpperCase() + currentSelectedCategory.slice(1)} Commands`);
            
            const pageCommands = commands.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
            newCanvas.drawCommands(pageCommands);
            newCanvas.drawPageIndicator(page, Math.ceil(commands.length / ITEMS_PER_PAGE));
            newCanvas.drawFooter(`📋 ${commands.length} commands available`);
            
            const att = new AttachmentBuilder(newCanvas.getBuffer(), { name: "help.png" });

            const prevBtn = new ButtonBuilder()
              .setCustomId("prev_page")
              .setLabel("Previous")
              .setEmoji("⬅️")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page === 1);

            const nextBtn = new ButtonBuilder()
              .setCustomId("next_page")
              .setLabel("Next")
              .setEmoji("➡️")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page === Math.ceil(commands.length / ITEMS_PER_PAGE));

            const buttonsRow = new ActionRowBuilder().addComponents(prevBtn, nextBtn);
            await i.editReply({ files: [att], components: [row, buttonsRow] });
          } catch (error) {
            console.error("Error in collector:", error);
            await i.followUp({ 
              content: "❌ An error occurred while processing your request.", 
              ephemeral: true 
            }).catch(() => {});
          }
        });

        collector.on("end", () => {
          sent.edit({ components: [] }).catch(() => {});
        });

        return;
      }

      // Direct category access
      const newCanvas = new HelpCanvas();
      await newCanvas.drawBackground();
      await newCanvas.drawHeader(client, `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Commands`);
      
      const pageCommands = commands.slice(0, ITEMS_PER_PAGE);
      newCanvas.drawCommands(pageCommands);
      newCanvas.drawPageIndicator(1, totalPages);
      newCanvas.drawFooter(`📋 ${commands.length} commands available`);
      
      const attachment = new AttachmentBuilder(newCanvas.getBuffer(), { name: "help.png" });

      await message.channel.send({ files: [attachment] });

    } catch (error) {
      console.error("Error in help command:", error);
      await message.channel.send("❌ An error occurred while generating the help menu!");
    }
  },
};