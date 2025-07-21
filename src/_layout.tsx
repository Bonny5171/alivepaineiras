import { createNavigationContainerRef, DarkTheme, DefaultTheme, NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
// import { useFonts } from 'expo-font';
// import * as SplashScreen from 'expo-splash-screen';
// import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
// import { useColorScheme } from '@/hooks/useColorScheme';
import { useColorScheme } from 'react-native';
import { AuthProvider } from './providers';
import { ErrorProvider } from '@/providers/ErrorProvider';
import ErrorOverlay from '@/components/ErrorOverlay';
import { ConfirmationProvider } from './providers/ConfirmProvider';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
// import AnimatedSplashScreen from './splashScrean'
// import { ServiceNotification } from '@/services/NotificationService';
// import * as Notifications from 'expo-notifications';
// import crashlytics from '@react-native-firebase/crashlytics';
import { setJSExceptionHandler } from 'react-native-exception-handler';
import { LogBox } from 'react-native';
import Config from 'react-native-config';

const isDebug = Config.EXPO_PUBLIC_DEBUG === 'true';
if (isDebug) {
  LogBox.ignoreAllLogs(true);
  LogBox.ignoreLogs([
    'Warning: ...',
    'ViewPropTypes will be removed from React Native',
  ]);
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

setJSExceptionHandler((error, isFatal) => {
//   crashlytics().recordError(error);
    console.log('<<< DEBUG >>>', error);
}, true);

const Stack = createNativeStackNavigator();
export const navigationRef = createNavigationContainerRef();

export default function RootLayout() {
  const colorScheme = useColorScheme();
//   const [loaded] = useFonts({
//     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//   });

  // Checa se há chave/user salvos para definir a rota inicial
  const [initialRoute, setInitialRoute] = React.useState('login');

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedChave = await AsyncStorage.getItem('chave');
        const savedUser = await AsyncStorage.getItem('user');
        if (savedChave && savedUser) {
          setInitialRoute('(tabs)');
        }
      } catch (e) {
        // fallback para login
        setInitialRoute('login');
      }
    };
    checkAuth();
  }, []);

  // React.useEffect(() => {
  //   const setupNotifications = async () => {
  //     try {
  //       const token = await ServiceNotification.registerForPushNotificationsAsync();
  //       console.log('Expo Push Token:', token);

  //       ServiceNotification.setNotificationListeners({
  //         onReceive: (notification) => {
  //           console.log('🔔 Notificação recebida:', notification);
  //         },
  //         onRespond: (response) => {
  //           console.log('📲 Interação com notificação:', response);

  //           const data = response.notification.request.content.data;
  //           if (data?.screen) {
  //             navigationRef.navigate(data.screen); // ou outro comportamento
  //           }
  //         }
  //       });
  //     } catch (err) {
  //       console.warn('Erro ao configurar notificações:', err);
  //     }
  //   };

  //   if (initialRoute) {
  //     setupNotifications();
  //   }
  // }, [initialRoute]);

//   useEffect(() => {
//     if (loaded) {
//       SplashScreen.hideAsync();
//     }
//   }, [loaded]);

  // if (!loaded || !initialRoute) {
  if (!initialRoute) {
    return null;
  }

  return (
    <AuthProvider navigation={navigationRef}>
      {/* <AnimatedSplashScreen> */}
        <ErrorProvider>
          <ConfirmationProvider>
              <NavigationIndependentTree>
                <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme} ref={navigationRef}>
                  <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>

                    <Stack.Screen name="login" getComponent={() => require('./login').default} />
                    <Stack.Screen name="(tabs)/(sports)/home" getComponent={() => require('./(tabs)/(sports)/home').default} />
                    <Stack.Screen name="(tabs)/(sports)/schedules" getComponent={() => require('./(tabs)/(sports)/schedules').default} />
                    <Stack.Screen name="(tabs)/(sports)/schedulingCalendar" getComponent={() => require('./(tabs)/(sports)/schedulingCalendar').default} />
                    <Stack.Screen name="(tabs)/(sports)/details" getComponent={() => require('./(tabs)/(sports)/details').default} />
                    <Stack.Screen name="(tabs)/(sports)/freeClassesDetails" getComponent={() => require('./(tabs)/(sports)/freeClassesDetails').default} />
                    <Stack.Screen name="(tabs)/(sports)/mandatoryRegistrationsDetails" getComponent={() => require('./(tabs)/(sports)/mandatoryRegistrationsDetails').default} />
                    <Stack.Screen name="(tabs)/(sports)/enrolledGroup" getComponent={() => require('./(tabs)/(sports)/enrolledGroup').default} />
                    <Stack.Screen name="(tabs)/(sports)/schedulingDetails" getComponent={() => require('./(tabs)/(sports)/schedulingDetails').default} />
                    <Stack.Screen name="(tabs)/(sports)/transferRegistration" getComponent={() => require('./(tabs)/(sports)/transferRegistration').default} />
                    <Stack.Screen name="(tabs)/(sports)/transferRegistrationDetails" getComponent={() => require('./(tabs)/(sports)/transferRegistrationDetails').default} />

                    <Stack.Screen name="(tabs)/(cultural)/home" getComponent={() => require('./(tabs)/(cultural)/home').default} />

                    <Stack.Screen name="(mais)" getComponent={() => require('./(mais)/_layout').default} />

                    {/*  */}
                    <Stack.Screen name="(tabs)/(registrations)/home" getComponent={() => require('./(tabs)/(registrations)/home').default} />
                    <Stack.Screen name="(tabs)/(registrations)/new" getComponent={() => require('./(tabs)/(registrations)/new').default} />

                    <Stack.Screen name="(services)" getComponent={() => require('./(mais)/services/serviceDetails').default} />
                    <Stack.Screen name="(services)/List" getComponent={() => require('./(mais)/services/servicesList').default} />

                    <Stack.Screen name="(dependents)/List" getComponent={() => require('./(mais)/dependents/dependentsList').default} />
                    <Stack.Screen name="(dependents)/dependentDetails" getComponent={() => require('./(mais)/dependents/dependentDetails').default} />

                    <Stack.Screen name="(classificados)/Details" getComponent={() => require('./(mais)/classificados/classificadoDetails').default} />
                    <Stack.Screen name="(classificados)/List" getComponent={() => require('./(mais)/classificados/classificadosList').default} />
                    <Stack.Screen name="(classificados)/myList" getComponent={() => require('./(mais)/classificados/myList').default} />
                    <Stack.Screen name="(classificados)/form" getComponent={() => require('./(mais)/classificados/classificadoForm').default} />

                    <Stack.Screen name="(locacoes)/Details" getComponent={() => require('./(mais)/locacoes/locacoesDetails').default} />
                    <Stack.Screen name="(locacoes)/List" getComponent={() => require('./(mais)/locacoes/locacoesList').default} />
                    <Stack.Screen name="(locacoes)/myList" getComponent={() => require('./(mais)/locacoes/myList').default} />
                    <Stack.Screen name="(locacoes)/myLocacaoDetails" getComponent={() => require('./(mais)/locacoes/myLocacaoDetails').default} />

                    <Stack.Screen name="(invites)/details" getComponent={() => require('./(mais)/invites/inviteDetails').default} />
                    <Stack.Screen name="(invites)/new" getComponent={() => require('./(mais)/invites/newInvite').default} />
                    <Stack.Screen name="(invites)/visitant" getComponent={() => require('./(mais)/invites/visitantDetails').default} />
                    <Stack.Screen name="(invites)/list" getComponent={() => require('./(mais)/invites/inviteList').default} />

                    <Stack.Screen name="(contact)" getComponent={() => require('./(mais)/contact/contact').default} />

                    {/* Manifest screens */}
                    <Stack.Screen name="(manifest)/audioManifestDetails" getComponent={() => require('./(mais)/contact/audioManifestDetails').default} />
                    <Stack.Screen name="(manifest)/manifest" getComponent={() => require('./(mais)/contact/manifest').default} />
                    <Stack.Screen name="(manifest)/manifestList" getComponent={() => require('./(mais)/contact/manifestList').default} />
                    <Stack.Screen name="(manifest)/newText" getComponent={() => require('./(mais)/contact/newTextManifest').default} />
                    {/* <Stack.Screen name="(manifest)/newAudioManifest" getComponent={() => require('./(mais)/contact/newAudioManifest').default} /> */}
                    <Stack.Screen name="(manifest)/textManifestDetails" getComponent={() => require('./(mais)/contact/textManifestDetails').default} />

                    {/* Tabs */}
                    <Stack.Screen name="(tabs)" getComponent={() => require('./(tabs)/home').default} />
                    <Stack.Screen name="(tabs)/activity" getComponent={() => require('./(tabs)/activity').default} />
                    <Stack.Screen name="(tabs)/calendar" getComponent={() => require('./(tabs)/calendar').default} />
                    <Stack.Screen name="(tabs)/search" getComponent={() => require('./(tabs)/search').default} />

                    <Stack.Screen name="(tabs)/ticket" getComponent={() => require('./(tabs)/ticket').default} />
                    <Stack.Screen name="ticketForm" getComponent={() => require('./(ticket)/ticketForm').default} />
                    <Stack.Screen name="ticketConfirm" getComponent={() => require('./(ticket)/ticketConfirm').default} />

                    {/* Financeiro */}
                    <Stack.Screen
                      name="(financeiro)/home"
                      getComponent={() => require('./(financeiro)/home').default}
                      options={{ title: "Financeiro" }}
                    />
                    <Stack.Screen
                      name="(financeiro)/details"
                      getComponent={() => require('./(financeiro)/details').default}
                      options={{ title: "Detalhes da Fatura" }}
                    />
                    <Stack.Screen
                      name="(financeiro)/itemDetails"
                      getComponent={() => require('./(financeiro)/itemDetails').default}
                      options={{ title: "Detalhes do Item" }}
                    />
                    <Stack.Screen
                      name="(financeiro)/itemList"
                      getComponent={() => require('./(financeiro)/itemList').default}
                      options={{ title: "Lista de Itens" }}
                    />
                    <Stack.Screen
                      name="(financeiro)/pdfView"
                      getComponent={() => require('./(financeiro)/pdfView').default}
                      options={{ title: "Visualizar PDF" }}
                    />
                    <Stack.Screen
                      name="(financeiro)/faturas"
                      getComponent={() => require('./(financeiro)/faturas').default}
                      options={{ title: "Faturas" }}
                    />

                    {/* New Activity */}
                    <Stack.Screen
                      name="(newActivity)/ActivitySelectionScreen"
                      getComponent={() => require('./(newActivity)/ActivitySelectionScreen').default}
                    />
                    <Stack.Screen
                      name="(newActivity)/ScheduleSelectionScreen"
                      getComponent={() => require('./(newActivity)/ScheduleSelectionScreen').default}
                    />
                    <Stack.Screen
                      name="(newActivity)/ConfirmationScreen"
                      getComponent={() => require('./(newActivity)/ConfirmationScreen').default}
                    />

                    <Stack.Screen
                      name="(consulta)/index"
                      getComponent={() => require('./(consulta)/index').default}
                    />
                    <Stack.Screen
                      name="(consulta)/scheduledAppointments"
                      getComponent={() => require('./(consulta)/scheduledAppointments').default}
                    />
                    <Stack.Screen
                      name="(consulta)/scheduledExams"
                      getComponent={() => require('./(consulta)/scheduledExams').default}
                    />
                    <Stack.Screen
                      name="(consulta)/examsHistory"
                      getComponent={() => require('./(consulta)/examsHistory').default}
                    />
                    <Stack.Screen
                      name="(consulta)/appointmentDetails"
                      getComponent={() => require('./(consulta)/appointmentDetails').default}
                    />

                    {/* Nova consulta */}
                    <Stack.Screen
                      name="(consulta)/newConsulta"
                      getComponent={() => require('./(consulta)/newConsulta').default}
                    />
                    <Stack.Screen
                      name="ConsultaResumo"
                      getComponent={() => require('./(consulta)/ConsultaResumo').default}
                    />

                    <Stack.Screen name="parqList" getComponent={() => require('./(parq)/parqList').default} />
                    <Stack.Screen name="parqForm" getComponent={() => require('./(parq)/parqForm').default} />
                    <Stack.Screen name="parqQuestions" getComponent={() => require('./(parq)/parqQuestions').default} />
                    <Stack.Screen name="parqConfirm" getComponent={() => require('./(parq)/parqConfirm').default} />

                    {/* FAQ */}
                    <Stack.Screen name="faqDetails" getComponent={() => require('./(faq)/faqDetails').default} />
                    <Stack.Screen name="faqList" getComponent={() => require('./(faq)/faqList').default} />

                    {/* Clube */}
                    <Stack.Screen name="clube" getComponent={() => require('./(clube)/ClubeScreen').default} />
                    <Stack.Screen name="clubeList" getComponent={() => require('./(clube)/ClubeList').default} />
                    <Stack.Screen name="clubeDetails" getComponent={() => require('./(clube)/ClubeDetails').default} />

                    {/* Clube - Grupos */}

                    {/* Telas individuais */}
                    <Stack.Screen name="calendar" getComponent={() => require('./calendar').default} />
                    <Stack.Screen name="calendarDetails" getComponent={() => require('./calendarDetails').default} />
                    <Stack.Screen name="profile" getComponent={() => require('./profile').default} />
                    <Stack.Screen name="personalData" getComponent={() => require('./personalData').default} />
                    <Stack.Screen name="notification" getComponent={() => require('./notification').default} />
                    <Stack.Screen name="notificationDetails" getComponent={() => require('./notificationDetails').default} />
                    <Stack.Screen name="notificationPreferences" getComponent={() => require('./notificationPreferences').default} />
                    <Stack.Screen name="screenSchedule" getComponent={() => require('./screenSchedule').default} />
                    <Stack.Screen name="movieSchedule" getComponent={() => require('./movieSchedule').default} />
                    <Stack.Screen name="movieScheduleDetails" getComponent={() => require('./movieScheduleDetails').default} />

                  </Stack.Navigator>
                  {/* <StatusBar style="auto" /> */}
                </NavigationContainer>
              </NavigationIndependentTree>
          </ConfirmationProvider>
          <ErrorOverlay />
        </ErrorProvider>
      {/* </AnimatedSplashScreen> */}
    </AuthProvider>
  );
}