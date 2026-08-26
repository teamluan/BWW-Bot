const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const channelId = process.env.LEAVE_CHANNEL_ID || process.env.WELCOME_CHANNEL_ID;
    if (!channelId) return;
    const channel = await member.guild.channels.fetch(channelId).catch(() => null);
    if (!channel?.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle('👋 Mitglied hat den Server verlassen')
      .setDescription(`**${member.user.tag}** hat **${member.guild.name}** verlassen.`)
      .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 256 }))
      .setTimestamp();
    await channel.send({ embeds: [embed] });
  }
};
