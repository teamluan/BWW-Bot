const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'config', 'settings.json');

function load() {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return { guilds: {} }; }
}

function save(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function getGuild(guildId) {
  const data = load();
  if (!data.guilds[guildId]) {
    data.guilds[guildId] = {
      welcome: { enabled: false, channelId: null, text: 'Willkommen {user} auf unserem Server!', ping: true },
      verify: { enabled: false, channelId: null, text: 'Klicke auf den Button, um dich zu verifizieren.', roleId: null },
      permissions: {}
    };
    save(data);
  }
  return data.guilds[guildId];
}

function updateGuild(guildId, updater) {
  const data = load();
  const guild = getGuild(guildId);
  updater(guild);
  data.guilds[guildId] = guild;
  save(data);
  return guild;
}

module.exports = { load, save, getGuild, updateGuild };
