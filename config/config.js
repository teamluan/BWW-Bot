module.exports = {
  welcomeChannelId: process.env.WELCOME_CHANNEL_ID || '',
  leaveChannelId: process.env.LEAVE_CHANNEL_ID || '',
  autoRoleId: process.env.AUTO_ROLE_ID || '',
  welcomeDM: process.env.WELCOME_DM === 'true'
};
