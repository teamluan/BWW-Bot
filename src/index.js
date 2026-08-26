require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  PermissionFlagsBits,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder,
  ActivityType,
} = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID || '';
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID || '';
const LEAVE_CHANNEL_ID = process.env.LEAVE_CHANNEL_ID || WELCOME_CHANNEL_ID;
const AUTO_ROLE_ID = process.env.AUTO_ROLE_ID || '';
const WELCOME_DM = process.env.WELCOME_DM === 'true';

if (!TOKEN || !CLIENT_ID) {
  console.error('DISCORD_TOKEN und CLIENT_ID müssen in der .env gesetzt werden.');
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder()
    .setName('nachricht')
    .setDescription('Sendet eine Nachricht als Embed in diesen Channel.')
    .addStringOption(option =>
      option
        .setName('text')
        .setDescription('Der Text des Embeds')
        .setRequired(false)
        .setMaxLength(4096)
    )
    .addAttachmentOption(option =>
      option
        .setName('bild')
        .setDescription('Optional ein Bild für das Embed')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
].map(command => command.toJSON());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.GuildMember],
});

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(TOKEN);

  if (GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    console.log(`Slash-Commands für Server ${GUILD_ID} registriert.`);
  } else {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('Slash-Commands global registriert. Die globale Aktualisierung kann etwas dauern.');
  }
}

function buildWelcomeEmbed(member) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`👋 Willkommen auf dem Server!`)
    .setDescription(
      `Hey ${member}, schön dass du da bist!\n\n` +
      `Wir wünschen dir viel Spaß auf **${member.guild.name}**.\n` +
      `Du bist unser **${member.guild.memberCount}. Mitglied**!`
    )
    .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 256 }))
    .setFooter({ text: `${member.guild.name} • Willkommen` })
    .setTimestamp();
}

function buildLeaveEmbed(member) {
  return new EmbedBuilder()
    .setColor(0xed4245)
    .setTitle('👋 Mitglied verlassen')
    .setDescription(`**${member.user.tag}** hat den Server verlassen.`)
    .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 256 }))
    .setFooter({ text: member.guild.name })
    .setTimestamp();
}

client.once('ready', async () => {
  console.log(`Bot online als ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'Willkommen auf dem Server', type: ActivityType.Watching }],
    status: 'online',
  });

  try {
    await registerCommands();
  } catch (error) {
    console.error('Slash-Commands konnten nicht registriert werden:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'nachricht') {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: '❌ Du brauchst die Berechtigung **Nachrichten verwalten**, um diesen Command zu benutzen.',
        ephemeral: true,
      });
    }

    const text = interaction.options.getString('text');
    const attachment = interaction.options.getAttachment('bild');

    if (!text && !attachment) {
      return interaction.reply({
        content: '❌ Du musst mindestens **Text oder ein Bild** angeben.',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTimestamp();

    if (text) embed.setDescription(text);
    if (attachment) {
      if (!attachment.contentType?.startsWith('image/')) {
        return interaction.reply({
          content: '❌ Die Datei muss ein Bild sein.',
          ephemeral: true,
        });
      }
      embed.setImage(attachment.url);
    }

    await interaction.channel.send({ embeds: [embed] });
    return interaction.reply({
      content: '✅ Die Embed-Nachricht wurde gesendet.',
      ephemeral: true,
    });
  }
});

client.on('guildMemberAdd', async member => {
  try {
    if (WELCOME_CHANNEL_ID) {
      const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID).catch(() => null);
      if (channel?.isTextBased()) {
        await channel.send({ embeds: [buildWelcomeEmbed(member)] });
      }
    }

    if (AUTO_ROLE_ID) {
      const role = member.guild.roles.cache.get(AUTO_ROLE_ID) || await member.guild.roles.fetch(AUTO_ROLE_ID).catch(() => null);
      if (role && role.editable) {
        await member.roles.add(role).catch(error => console.error('Auto-Rolle konnte nicht vergeben werden:', error));
      }
    }

    if (WELCOME_DM) {
      await member.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x57f287)
            .setTitle(`Willkommen auf ${member.guild.name}! 🎉`)
            .setDescription('Schön, dass du unserem Server beigetreten bist. Viel Spaß!')
            .setTimestamp(),
        ],
      }).catch(() => {});
    }
  } catch (error) {
    console.error('Fehler beim Welcome-System:', error);
  }
});

client.on('guildMemberRemove', async member => {
  if (!LEAVE_CHANNEL_ID) return;

  try {
    const channel = await member.guild.channels.fetch(LEAVE_CHANNEL_ID).catch(() => null);
    if (channel?.isTextBased()) {
      await channel.send({ embeds: [buildLeaveEmbed(member)] });
    }
  } catch (error) {
    console.error('Fehler beim Leave-System:', error);
  }
});

process.on('unhandledRejection', error => console.error('Unhandled rejection:', error));
process.on('uncaughtException', error => console.error('Uncaught exception:', error));

client.login(TOKEN);
