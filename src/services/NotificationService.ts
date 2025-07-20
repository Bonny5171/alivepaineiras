import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
import { Platform } from 'react-native';

export class ServiceNotification {
  private static expoPushToken: string | null = null;

  // Solicita permissão e obtém token do dispositivo (Expo + FCM/APNs)
  static async registerForPushNotificationsAsync(): Promise<string | null> {
    // if (!Device.isDevice) return null;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    this.expoPushToken = tokenData.data;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return this.expoPushToken;
  }

  // Agendar uma notificação única
  static async scheduleOneTimeNotification(content: Notifications.NotificationContentInput, triggerInDt: Date) {
    return Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerInDt
      },
    });
  }

  // Agendar notificação repetida por intervalo (ex: a cada x minutos)
  static async scheduleRepeatingNotification(content: Notifications.NotificationContentInput, intervalMs: number) {
    return Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: intervalMs / 1000,
        repeats: true,
      },
    });
  }

  // Badge: define número no ícone do app
  static async setBadgeNumber(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  static async getBadgeNumber(): Promise<number> {
    return Notifications.getBadgeCountAsync();
  }

  // Ouvintes de notificação (foreground, background e interação)
  static setNotificationListeners({
    onReceive,
    onRespond,
  }: {
    onReceive?: (notification: Notifications.Notification) => void;
    onRespond?: (response: Notifications.NotificationResponse) => void;
  }) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    if (onReceive) {
      Notifications.addNotificationReceivedListener(onReceive);
    }

    if (onRespond) {
      Notifications.addNotificationResponseReceivedListener(onRespond);
    }
  }

  // Cancelar/dismiss notificação
  static async dismissNotification(notificationId: string) {
    await Notifications.dismissNotificationAsync(notificationId);
  }

  static async dismissAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }

  // Gerenciar canais Android
  static async createChannel(id: string, name: string) {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(id, {
        name,
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
  }

  static async deleteChannel(id: string) {
    if (Platform.OS === 'android') {
      await Notifications.deleteNotificationChannelAsync(id);
    }
  }
}
