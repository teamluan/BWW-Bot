const { EmbedBuilder } = require('discord.js');

function welcomeEmbed(member) {
  return new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle('👋 Willkommen!')
    .setDescription(`Herzlich willkommen ${member} auf **${member.guild.name}**!`)
    .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 256 }))
    .setTimestamp();
}

module.exports = { welcomeEmbed };
