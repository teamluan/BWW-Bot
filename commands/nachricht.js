const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nachricht')
    .setDescription('Sendet Text und/oder ein Bild als Embed.')
    .addStringOption(o => o.setName('text').setDescription('Text der Nachricht').setMaxLength(4096))
    .addAttachmentOption(o => o.setName('bild').setDescription('Optionales Bild'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
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
