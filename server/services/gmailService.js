exports.getInbox = async (userId) => {
  return {
    messages: [],
    note: 'Google account not connected. Please connect your Gmail account in settings to access your inbox.',
    connected: false,
  };
};

exports.getMessage = async (userId, messageId) => {
  return {
    note: 'Google account not connected. Please connect your Gmail account in settings to access your emails.',
    connected: false,
  };
};
