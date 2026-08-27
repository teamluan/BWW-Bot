const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, PermissionFlagsBits } = require('discord.js');
const { getGuild } = require('../utils/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nachricht')
    .setDescription('Sendet Text und/oder ein Bild als Embed.')
    .addStringOption(o => o.setName('text').setDescription('Text der Nachricht').setMaxLength(4096))
    .addAttachmentOption(o => o.setName('bild').setDescription('Optionales Bild')),

  async execute(interaction) {
    const config = getGuild(interaction.guildId);
    const allowedRoles = config.permissions?.nachricht || [];
    const isAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
    const hasRole = allowedRoles.some(id => interaction.member.roles.cache.has(id));

    if (!isAdmin && !hasRole && allowedRoles.length > 0) {
      return interaction.reply({ content: '❌ Du darfst diesen Command nicht benutzen.', ephemeral: true });
    }
    if (!isAdmin && allowedRoles.length === 0 && !interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ Du brauchst die Berechtigung „Nachrichten verwalten“ oder musst über /setup eine Rolle freigeschaltet bekommen.', ephemeral: true });
    }

    const text = interaction.options.getString('text');
    const image = interaction.options.getAttachment('bild');
    if (!text && !image) return interaction.reply({ content: '❌ Bitte gib Text oder ein Bild an.', ephemeral: true });
    if (image && !image.contentType?.startsWith('image/')) return interaction.reply({ content: '❌ Die Datei muss ein Bild sein.', ephemeral: true });

    const embed = new EmbedBuilder().setColor(0x5865f2).setTimestamp();
    if (text) embed.setDescription(text);
    if (image) embed.setImage(image.url);

    await interaction.channel.send({ embeds: [embed] });
    await interaction.reply({ content: '✅ Nachricht wurde gesendet.', ephemeral: true });
  }
};
