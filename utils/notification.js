const { Expo } = require('expo-server-sdk');

const sendNotification = async (token, message) => {
  if (!Expo.isExpoPushToken(token)) {
    return false;
  }
  const expo = new Expo();
  const chunks = expo.chunkPushNotifications([{
    to: token, sound: 'default', body: message,
  }]);
  try {
    await Promise.all(
      chunks.map(
        async (chunk) => expo.sendPushNotificationsAsync(chunk),
      ),
    );
  } catch (error) {
    console.error(error);
  }
};

module.exports = sendNotification;
