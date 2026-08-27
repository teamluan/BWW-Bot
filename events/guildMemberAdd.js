const { EmbedBuilder } = require('discord.js');
const { getGuild } = require('../utils/config');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const config = getGuild(member.guild.id);

    if (config.welcome?.enabled && config.welcome.channelId) {
      const channel = await member.guild.channels.fetch(config.welcome.channelId).catch(() => null);
      if (channel?.isTextBased()) {
        const mention = config.welcome.ping ? `<@${member.id}>` : member.user.username;
        const text = config.welcome.text
          .replaceAll('{user}', mention)
          .replaceAll('{username}', member.user.username)
          .replaceAll('{server}', member.guild.name);
        const embed = new EmbedBuilder()
          .setColor(0x57f287)
          .setDescription(text)
          .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 256 }))
          .setFooter({ text: `${member.guild.name} • Willkommen` })
          .setTimestamp();
        await channel.send({ embeds: [embed] });
      }
    } else if (process.env.WELCOME_CHANNEL_ID) {
      const channel = await member.guild.channels.fetch(process.env.WELCOME_CHANNEL_ID).catch(() => null);
      if (channel?.isTextBased()) await channel.send({ embeds: [new EmbedBuilder().setColor(0x57f287).setTitle('👋 Willkommen!').setDescription(`Hey ${member}, herzlich willkommen auf **${member.guild.name}**!`).setTimestamp()] });
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
