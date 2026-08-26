const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const channelId = process.env.WELCOME_CHANNEL_ID;
    if (channelId) {
      const channel = await member.guild.channels.fetch(channelId).catch(() => null);
      if (channel?.isTextBased()) {
        const embed = new EmbedBuilder()
          .setColor(0x57f287)
          .setTitle('👋 Willkommen!')
          .setDescription(`Hey ${member}, herzlich willkommen auf **${member.guild.name}**!\n\nDu bist das **${member.guild.memberCount}. Mitglied**.`)
          .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 256 }))
          .setFooter({ text: `${member.guild.name} • Willkommen` })
          .setTimestamp();
        await channel.send({ embeds: [embed] });
      }
    }

    if (process.env.AUTO_ROLE_ID) {
      const role = await member.guild.roles.fetch(process.env.AUTO_ROLE_ID).catch(() => null);
      if (role?.editable) await member.roles.add(role).catch(console.error);
    }

    if (process.env.WELCOME_DM === 'true') {
      await member.send(`👋 Willkommen auf **${member.guild.name}**! Viel Spaß auf dem Server!`).catch(() => {});
    }
  }
};
