const { Expo } = require('expo-server-sdk');
const NotificationToken = require('../data/models/notificationToken');

const sendNotification = async (metadata, message) => {
  try {
    const notif = await NotificationToken.findOne({ user: metadata.userId });
    if (!notif || !Expo.isExpoPushToken(notif.token)) {
      return false;
    }
    const expo = new Expo();
    const chunks = expo.chunkPushNotifications([{
      to: notif.token, sound: 'default', body: message,
    }]);
    return await Promise.all(
      chunks.map(
        async (chunk) => expo.sendPushNotificationsAsync(chunk),
      ),
    );
  } catch (error) {
    return console.error(error);
  }
};

module.exports = sendNotification;
