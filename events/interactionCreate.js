const { PermissionFlagsBits } = require('discord.js');
const { getGuild } = require('../utils/config');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isButton() && interaction.customId === 'verify_member') {
      const config = getGuild(interaction.guildId);
      const role = interaction.guild.roles.cache.get(config.verify?.roleId);
      if (!config.verify?.enabled || !role) return interaction.reply({ content: '❌ Das Verify-System ist nicht korrekt eingerichtet.', ephemeral: true });
      if (interaction.member.roles.cache.has(role.id)) return interaction.reply({ content: 'ℹ️ Du bist bereits verifiziert.', ephemeral: true });
      if (!role.editable) return interaction.reply({ content: '❌ Die Verify-Rolle kann vom Bot nicht vergeben werden. Ziehe die Bot-Rolle über die Verify-Rolle.', ephemeral: true });
      await interaction.member.roles.add(role);
      return interaction.reply({ content: `✅ Du wurdest erfolgreich verifiziert und hast die Rolle ${role} erhalten.`, ephemeral: true });
    }

    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      if (interaction.commandName !== 'setup') {
        const config = getGuild(interaction.guildId);
        const roles = config.permissions?.[interaction.commandName];
        if (roles?.length && !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
          const allowed = roles.some(id => interaction.member.roles.cache.has(id));
          if (!allowed) return interaction.reply({ content: '❌ Du darfst diesen Command nicht benutzen.', ephemeral: true });
        }
      }
      await command.execute(interaction, client);
    } catch (error) {
      console.error(error);
      const reply = { content: '❌ Beim Ausführen des Commands ist ein Fehler aufgetreten.', ephemeral: true };
      if (interaction.replied || interaction.deferred) await interaction.followUp(reply);
      else await interaction.reply(reply);
    }
  }
};
