const {
  SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle
} = require('discord.js');
const { getGuild, updateGuild } = require('../utils/config');

const commandChoices = [{ name: 'nachricht', value: 'nachricht' }];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup').setDescription('Konfiguriert Willkommen, Verify und Command-Berechtigungen.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub.setName('welcome').setDescription('Willkommenssystem einstellen')
      .addChannelOption(o => o.setName('channel').setDescription('Willkommenskanal').addChannelTypes(ChannelType.GuildText).setRequired(true))
      .addStringOption(o => o.setName('text').setDescription('Text; {user}, {username}, {server} sind Platzhalter').setMaxLength(2000).setRequired(true))
      .addBooleanOption(o => o.setName('ping').setDescription('Spieler im Text erwähnen').setRequired(true)))
    .addSubcommand(sub => sub.setName('verify').setDescription('Verify-System einstellen')
      .addChannelOption(o => o.setName('channel').setDescription('Verify-Kanal').addChannelTypes(ChannelType.GuildText).setRequired(true))
      .addRoleOption(o => o.setName('rolle').setDescription('Rolle nach erfolgreicher Verifizierung').setRequired(true))
      .addStringOption(o => o.setName('text').setDescription('Text über dem Verify-Button').setMaxLength(4000).setRequired(true)))
    .addSubcommand(sub => sub.setName('permission').setDescription('Legt fest, welche Rolle einen Command benutzen darf')
      .addStringOption(o => o.setName('command').setDescription('Command').setRequired(true).addChoices(...commandChoices))
      .addRoleOption(o => o.setName('rolle').setDescription('Rolle').setRequired(true))
      .addBooleanOption(o => o.setName('erlaubt').setDescription('Erlaubnis an/aus').setRequired(true)))
    .addSubcommand(sub => sub.setName('status').setDescription('Zeigt die aktuelle Konfiguration')),

  async execute(interaction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: '❌ Nur Administratoren dürfen /setup benutzen.', ephemeral: true });
    const sub = interaction.options.getSubcommand();

    if (sub === 'welcome') {
      const channel = interaction.options.getChannel('channel');
      const text = interaction.options.getString('text');
      const ping = interaction.options.getBoolean('ping');
      updateGuild(interaction.guildId, g => { g.welcome = { enabled: true, channelId: channel.id, text, ping }; });
      return interaction.reply({ content: `✅ Willkommen aktiviert in ${channel}.\n**Ping:** ${ping ? 'Ja' : 'Nein'}\n**Platzhalter:** \`{user}\`, \`{username}\`, \`{server}\``, ephemeral: true });
    }

    if (sub === 'verify') {
      const channel = interaction.options.getChannel('channel');
      const role = interaction.options.getRole('rolle');
      const text = interaction.options.getString('text');
      const old = getGuild(interaction.guildId).verify;
      if (old?.messageId) {
        const oldChannel = await interaction.guild.channels.fetch(old.channelId).catch(() => null);
        const oldMessage = oldChannel?.isTextBased() ? await oldChannel.messages.fetch(old.messageId).catch(() => null) : null;
        if (oldMessage) await oldMessage.delete().catch(() => {});
      }
      const embed = new EmbedBuilder().setTitle('Verifizierung').setDescription(text).setColor(0x57f287);
      const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('verify_member').setLabel('Verifizieren').setStyle(ButtonStyle.Success));
      const message = await channel.send({ embeds: [embed], components: [row] });
      updateGuild(interaction.guildId, g => { g.verify = { enabled: true, channelId: channel.id, text, roleId: role.id, messageId: message.id }; });
      return interaction.reply({ content: `✅ Verify-System eingerichtet/aktualisiert in ${channel}. Rolle: ${role}`, ephemeral: true });
    }

    if (sub === 'permission') {
      const command = interaction.options.getString('command');
      const role = interaction.options.getRole('rolle');
      const allowed = interaction.options.getBoolean('erlaubt');
      updateGuild(interaction.guildId, g => {
        g.permissions ??= {};
        g.permissions[command] ??= [];
        if (allowed && !g.permissions[command].includes(role.id)) g.permissions[command].push(role.id);
        if (!allowed) g.permissions[command] = g.permissions[command].filter(id => id !== role.id);
      });
      return interaction.reply({ content: `${allowed ? '✅' : '❌'} Rolle ${role} für **/${command}** ${allowed ? 'freigeschaltet' : 'gesperrt'}.`, ephemeral: true });
    }

    if (sub === 'status') {
      const g = getGuild(interaction.guildId);
      const perms = Object.entries(g.permissions || {}).map(([cmd, roles]) => `**/${cmd}:** ${roles.length ? roles.map(id => `<@&${id}>`).join(', ') : 'keine Rollen'}`).join('\n') || 'Keine eigenen Rollen gesetzt.';
      const embed = new EmbedBuilder().setTitle('Bot Setup').setColor(0x5865f2)
        .addFields(
          { name: 'Willkommen', value: g.welcome.enabled ? `Kanal: <#${g.welcome.channelId}>\nPing: ${g.welcome.ping}\nText: ${g.welcome.text}` : 'Deaktiviert' },
          { name: 'Verify', value: g.verify.enabled ? `Kanal: <#${g.verify.channelId}>\nRolle: <@&${g.verify.roleId}>\nText: ${g.verify.text}` : 'Deaktiviert' },
          { name: 'Command-Rechte', value: perms }
        );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
