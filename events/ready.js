const { REST, Routes, ActivityType } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    client.user.setPresence({ activities: [{ name: 'Willkommen auf dem Server', type: ActivityType.Watching }], status: 'online' });

    const commands = [];
    for (const file of fs.readdirSync('./commands').filter(f => f.endsWith('.js'))) {
      commands.push(require(`../commands/${file}`).data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    if (process.env.GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), { body: commands });
      console.log('Slash-Commands registriert.');
    } else {
      await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
      console.log('Globale Slash-Commands registriert.');
    }
    console.log(`Online als ${client.user.tag}`);
  }
};
