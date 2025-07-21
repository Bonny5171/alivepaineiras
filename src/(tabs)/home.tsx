import { unicodeToChar } from '@/api/app/appTransformer';
import { listarDependentes } from '@/api/app/atividades';
import { exibirPerfil } from '@/api/app/auth';
import { fetchBannersData, fetchTelaoData } from '@/api/notion/notionService';
import Banner from '@/components/Banner';
import CapacityCard from '@/components/CapacityCard';
import DynamicList from '@/components/DynamicList';
import IconButton from '@/components/HeaderButtons';
import NextCard from '@/components/NextCard';
import NextCardCine from '@/components/NextCardCine';
import PillButton from '@/components/PillButton';
import ShortcutsButton from '@/components/ShortcutsButton';
import { ThemedScrollView } from '@/components/ThemedScrollView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/providers';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, RefreshControl, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar, Animated, Alert, Pressable } from 'react-native';
import { listarServicos } from "@/api/app/appointments";
import FooterTabBar from '@/components/FooterTabBar';
import { Loading } from '@/components/Loading';
import { useNavigation } from '@react-navigation/native';
import FeedbackScreen from '@/components/FeedbackScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { ServiceNotification } from '@/services/NotificationService';
// import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-firebase-messaging';
// import * as Clipboard from 'expo-clipboard';
import Clipboard from '@react-native-clipboard/clipboard';


const MINUTES_AGO = 30;

// Componentes mockados - substitua por implementações reais
const getFirstName = (name?: string | null): string => {
  if (typeof name !== 'string' || !name.trim()) {
    return '';
  }
  const parts = name.trim().split(/\s+/);
  return parts[0] || '';
};

const live = { AOVIVO: 1, TITULO: 'Live de React Native', DESCRICAO: 'Aprenda React Native do zero!', LINK: '#' };

const primaryActions = [
  { title: 'Reserva', icon: 'U+2705', onPress: () => console.log('Novo Curso pressionado') },
  { title: 'Ingresso', icon: 'U+1F3AB', onPress: () => console.log('Agendar pressionado') },
];

const secondaryActions = [
  { title: 'Serviço', icon: 'U+1F551', onPress: () => console.log('Ajuda pressionado') },
  { title: 'Classificado', icon: 'U+1F4F0', onPress: () => console.log('Feedback pressionado') },
];

const HomeScreen = () => {
  const handleRefresh = () => { };

  const refreshing = false;
  const brand = useThemeColor({}, 'brand');
  const AuthContext = useAuth();
  const [nome, setNome] = useState('');
  const [userLoaded, setUserLoaded] = useState(false);
  const activeBackground = useThemeColor({}, 'activeBackground');

  const [isLoading, setIsLoading] = useState(true);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [capacityLoaded, setCapacityLoaded] = useState(false);
  const [shortcutsLoaded, setShortcutsLoaded] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [token, setToken] = useState('');
  const [msgToast, setMsgToast] = useState('');

  const navigation = useNavigation();

  const headerButtons = [
    { label: 'Notificações', icon: 'bell', onPress: () => { navigation.navigate('notification') } },
    { label: 'Configurações', icon: 'user', onPress: () => { navigation.navigate('profile') } },
  ];

  // Toast state and animation
  const [showToastRating, setShowToastRating] = useState<boolean>(false);
  const fadeAnimRating = useRef(new Animated.Value(1)).current;

  const [showToastMsg, setShowToastMsg] = useState<boolean>(false);
  const fadeAnimMsg = useRef(new Animated.Value(1)).current;

  // Handle toast animation
  useEffect(() => {
    if (showToastRating) {
      Animated.sequence([
        Animated.timing(fadeAnimRating, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimRating, {
          toValue: 0,
          duration: 300,
          delay: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => setShowToastRating(false));
    }
  }, [showToastRating, fadeAnimRating]);

  useEffect(() => {
    if (showToastMsg) {
      Animated.sequence([
        Animated.timing(fadeAnimMsg, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimMsg, {
          toValue: 0,
          duration: 300,
          delay: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => setShowToastMsg(false));
    }
  }, [showToastMsg, fadeAnimMsg]);

  const [showToast, setShowToast] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showToast) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowToast(false));
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showToast, fadeAnim]);

  useEffect(() => {
    console.log('bannerLoaded:', bannerLoaded, 'userLoaded:', userLoaded);
    if (bannerLoaded && userLoaded) {
      setIsLoading(false);
    }
  }, [bannerLoaded, userLoaded]);

  const fetchData = async () => {
    if (!AuthContext.user) {
      setUserLoaded(true); // Se não houver usuário, não trava loading
      return;
    }
    try {
      await exibirPerfil();
      // TITULO é obrigatório, IDAREA não existe para listarDependentes
      const dependentesResponse = await listarDependentes({ TITULO: AuthContext.user });
      setNome(dependentesResponse.find((item) => item.TITULO === AuthContext.user)?.NOME || '');
      setUserLoaded(true);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setUserLoaded(true);
    }
  };

  useEffect(() => {
    const checkFeedbackDisplay = async () => {
      const lastShown = await AsyncStorage.getItem('LAST_FEEDBACK_DATE');
      const today = new Date().toISOString().split('T')[0]; // "2025-06-24"

      if (lastShown === today) {
        setShowFeedback(false);
      } else {
        setShowFeedback(true);
      }
    };

    checkFeedbackDisplay();
    fetchData()
  }, []);

  const handleCloseFeedback = async () => {
    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem('LAST_FEEDBACK_DATE', today);
    setShowFeedback(false);
  };

  const handleToastRatingFeedback = (status: boolean | ((prevState: boolean) => boolean)) => {
    setShowToastRating(status);
  };

  const handleSetMsg = (msg: string) => {
    setMsgToast(msg)
  };

  const handleShowToastMsg = (status: boolean | ((prevState: boolean) => boolean)) => {
     setShowToastMsg(status)
  };
  
  // Função para parsear a data ISO e extrair apenas a hora local, ignorando o deslocamento
  const parseBRTDate = (dateStr: string): Date | null => {
    try {
      const cleanDateStr = dateStr.replace(/\.\d{3}([+-]\d{2}:\d{2})?$/, '');
      const [datePart, timePart] = cleanDateStr.split('T');
      if (!datePart || !timePart) {
        return null;
      }

      const [year, month, day] = datePart.split('-').map(Number);
      const [timeCore] = timePart.split(/[+-]/);
      const [hours, minutes, seconds = 0] = timeCore.split(':').map(Number);

      if (
        isNaN(year) ||
        isNaN(month) ||
        isNaN(day) ||
        isNaN(hours) ||
        isNaN(minutes) ||
        isNaN(seconds)
      ) {
        console.warn('Valores de data inválidos:', { year, month, day, hours, minutes, seconds });
        return null;
      }

      const brtDate = new Date(year, month - 1, day, hours, minutes, seconds);
      if (isNaN(brtDate.getTime())) {
        console.warn('Data resultante inválida:', dateStr);
        return null;
      }
      return brtDate;
    } catch (error) {
      console.warn('Erro ao parsear data:', dateStr, error);
      return null;
    }
  };

  const handleCreateNotificationMovie = async (item: ListItem) => {
    try {
      const dataAula = new Date(item.rawDate);
      const lembrete = new Date(dataAula.getTime() - MINUTES_AGO * 60 * 1000);
      const content = {
        title: `${item.category}: ${item.title}`,
        body: `Lembrete para sua sessão para ${item.title} às ${item.time}`,
        sound: 'default',
      }
      // const notificationId = await ServiceNotification
      //   .scheduleOneTimeNotification(content, lembrete);
      // console.log('📅 Notificação agendada para:', lembrete.toString(), notificationId);

      setShowToast(true)
    } finally {
    }
  };

  const handleCreateNotificationBitScreen = async (item: ListItem) => {
   try {
      const dataAula = new Date(item.rawDate);
      const lembrete = new Date(dataAula.getTime() - MINUTES_AGO * 60 * 1000);
      const content = {
        title: `${item.category}: ${item.title}`,
        body: `Lembrete telão ${item.title} às ${item.time}`,
        sound: 'default',
      }

      // const notificationId = await ServiceNotification
      //   .scheduleOneTimeNotification(content, lembrete);
      // console.log('📅 Notificação agendada para:', lembrete.toString(), notificationId);

      setShowToast(true);
    } catch (error) {
      console.error('Erro ao criar notificações:', error);
    } finally {
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 20,
      textAlignVertical: 'center',
      backgroundColor: brand,
      padding: 16,
    },
    title: {
      fontSize: 25,
      fontWeight: 'bold',
      textAlignVertical: 'center',
      color: '#fff',
    },
    headerButtons: {
      flexDirection: 'row',
      gap: 10,
    },
    section: {
      marginVertical: 10,
      padding: 15,
      backgroundColor: '#fff',
      borderRadius: 8,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 10,
    },
    shortcutsWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    shortcutCard: {
      padding: 15,
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
      minWidth: 100,
    },
    mediaCard: {
      padding: 15,
      backgroundColor: '#e3f2fd',
      borderRadius: 8,
    },
    chipsWrapper: {
      marginVertical: 15,
    },
    chipsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 10,
    },
    chip: {
      flex: 1,
      padding: 10,
      backgroundColor: activeBackground,
      borderRadius: 20,
      alignItems: 'center',
    },
    chipSpacing: {
      marginRight: 10,
    },
    bannerMock: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#b3e5fc',
      borderRadius: 8,
    },
    occupationBanner: {
      padding: 10,
      backgroundColor: '#c8e6c9',
      borderRadius: 8,
    },
    toast: {
      position: 'absolute',
      top: 50,
      left: 16,
      right: 16,
      backgroundColor: '#48BB78',
      padding: 16,
      borderRadius: 12,
      zIndex: 1000,
    },
    toastTitle: {
      fontWeight: 'bold',
      fontSize: 15,
      color: '#1A202C',
    },
    toastMessage: {
      fontSize: 13,
      color: '#1A202C',
      marginTop: 4,
    },
    viewContent: {
      paddingTop: 0,
      paddingRight: 16,
      paddingBottom: 60,
      paddingLeft: 16,
    },
    viewLoading: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: "#E2E7F8"
    }
  });

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  const getToken = async () => {
    const objToken = await messaging().getToken();
    console.log('TOKEN: ', objToken);
    setToken(objToken);
  }

  // useEffect(() => {
  //     requestUserPermission();
  //     getToken()
  // }, [])


  return (
    <>
      <StatusBar
        backgroundColor={brand}
        barStyle={'light-content'}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: brand, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }}>
        {/* Overlay de loading */}
        {isLoading && (
          <View style={styles.viewLoading}>
            <Loading isLoading={true} />
          </View>
        )}
        {/* Toast */}
        {showToast && (
          <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
            <Text style={styles.toastTitle}>✅ Tudo certo!</Text>
            <Text style={styles.toastMessage}>Lembrete definido com sucesso!</Text>
          </Animated.View>
        )}
        {showToastRating && (
          <Animated.View style={[styles.toast, { opacity: fadeAnimRating }]}>
            <Text style={styles.toastTitle}>✅ Obrigado por sua avaliação!</Text>
            <Text style={styles.toastMessage}>Sua opnião é importante para que continue aprimorando a sua experiência</Text>
          </Animated.View>
        )}
        {showToastMsg && (
          <Animated.View style={[styles.toast, { opacity: fadeAnimMsg }]}>
            <Text style={styles.toastTitle}>Campo requerido</Text>
            <Text style={styles.toastMessage}>{msgToast}</Text>
          </Animated.View>
        )}
        <ThemedScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
              <TouchableOpacity onLongPress={() => setShowToken(!showToken)}>
                <ThemedText style={styles.title}>
                    {showToken && (
                      <Pressable
                        onPress={() => {
                          Clipboard.setString(token);
                          Alert.alert('Token copiado!', 'O token foi copiado para a área de transferência.');
                        }}
                        style={({ pressed }) => [
                          {
                            backgroundColor: '#e6f0ff',
                            borderColor: '#3399ff',
                            borderWidth: 1,
                            borderRadius: 8,
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                          },
                          pressed && {
                            backgroundColor: '#cce0ff',
                          }
                        ]}
                      >
                        <Text>{token}</Text>
                      </Pressable>)}
                    {`Olá${nome ? `, ${getFirstName(nome)}` : '!'}`}
                </ThemedText>
              </TouchableOpacity>
            <IconButton buttons={headerButtons} />
          </View>
          <Banner onLoad={() => { console.log('Banner onLoad chamado'); setBannerLoaded(true); }} />
          <View style={styles.viewContent}>
            {/* Seção de Banner */}
            <View style={{ marginBottom: 0 }}></View>
            
            {/* Ocupação */}
            <CapacityCard />

            {/* Atalhos */}
            <ShortcutsButton />

            {/* Telão */}
            <NextCard onIconPress={handleCreateNotificationBitScreen} />

            {/* Cinema */}
            <NextCardCine onIconPress={handleCreateNotificationMovie}  />

            {showFeedback && (
              <FeedbackScreen
                onClose={handleCloseFeedback}
                onHandleToastRatingFeedback={handleToastRatingFeedback}
                setMsgToast={handleSetMsg}
                setShowToastMsg={handleShowToastMsg}
              />
            )}
          </View>
        </ThemedScrollView>
        <FooterTabBar activeTab='index' />
      </SafeAreaView>
    </>
  );
};

export default HomeScreen;