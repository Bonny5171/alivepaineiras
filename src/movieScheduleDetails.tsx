import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, Animated, Text, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '@/components/Header';
// import { ServiceNotification } from '@/services/NotificationService';

const MINUTES_AGO = 30;

const encodeUrl = (url) => {
  if (!url) return url;
  const [base, query] = url.split('?');
  if (!query) return url;
  const encodedQuery = query
    .split('&')
    .map((param) => {
      const [key, value] = param.split('=');
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');

  return `${base}?${encodedQuery}`;
};

export default function MovieScheduleDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const [showToast, setShowToast] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const {
    title = 'Título não disponível',
    subtitle = 'Sinopse não disponível',
    time = 'N/A',
    date = 'N/A',
    rawDate = '',
    classificacao = 'N/A',
    audio = 'N/A',
    genero = 'N/A',
    lancamento = 'N/A',
    duracao = 'N/A',
    posterUrl = require('@/assets/images/cinema.png'),
  } = route.params || {};

  const activeBackground = useThemeColor({}, 'activeBackground');
  const background = useThemeColor({}, 'background');
  const background2 = useThemeColor({}, 'background2');
  const text2 = useThemeColor({}, 'text2');
  const tertiaryText = useThemeColor({}, 'tertiaryText');
  const brand = useThemeColor({}, 'brand');
  const contrastText = useThemeColor({}, 'contrastText');
  const errorBackground = useThemeColor({}, 'errorBackground');
  const successBackground = useThemeColor({}, 'successBackground');
  const neutralText = useThemeColor({}, 'neutralText');
  const shadow = useThemeColor({}, 'shadow');

  const handleSetReminder = async () => {
    try {
      const now = new Date();
      const dataAula = new Date(rawDate);
      const horaFormatada = dataAula
        .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const lembrete = new Date(dataAula.getTime() - MINUTES_AGO * 60 * 1000);
      const content = {
        title: `Cinema: ${title}`,
        body: `Lembrete para sua sessão para ${title} às ${horaFormatada}`,
        sound: 'default',
      }

      // const notificationId = await ServiceNotification
      //   .scheduleOneTimeNotification(content, lembrete);
      // console.log('📅 Notificação agendada para:', lembrete.toString(), notificationId);

      setShowToast(true)
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
    }
  };

  // Handle toast animation
  useEffect(() => {
    if (showToast) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          delay: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => setShowToast(false));
    }
  }, [showToast, fadeAnim]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: background,
    },
    scrollViewStyle: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 10,
      backgroundColor: background,
    },
    contentContainerStyle: {
      paddingBottom: 130,
    },
    headerStyle: {
      margin: 0,
      padding: 0,
    },
    posterContainer: {
      width: '100%',
      height: 400,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 20,
      alignSelf: 'center',
    },
    poster: {
      width: '100%',
      height: 400,
      resizeMode: 'contain',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 5,
      color: text2,
      textAlign: 'center',
    },
    dateTime: {
      fontSize: 15,
      fontWeight: '400',
      color: tertiaryText,
      textAlign: 'center',
      marginBottom: 20,
    },
    infoContainer: {
      flexDirection: 'column',
      marginBottom: 20,
      backgroundColor: background2,
      padding: 15,
      borderRadius: 10,
      shadowColor: shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    infoContainerItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      marginBottom: 5,
    },
    infoLabel: {
      fontSize: 15,
      fontWeight: '400',
      color: tertiaryText,
      marginRight: 5,
    },
    infoText: {
      fontSize: 15,
      fontWeight: '400',
      color: text2,
      marginRight: 15,
    },
    classificacaoBadge: {
      backgroundColor: errorBackground,
      borderRadius: 15,
      paddingHorizontal: 16,
      paddingVertical: 0,
    },
    classificacaoText: {
      fontSize: 10,
      fontWeight: '400',
      color: contrastText,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: text2,
      marginBottom: 10,
    },
    text: {
      fontSize: 15,
      fontWeight: '400',
      color: tertiaryText,
      marginBottom: 20,
      backgroundColor: background2,
      padding: 15,
      borderRadius: 10,
      shadowColor: shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    fixedButtonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: background2,
      paddingTop: 8,
      paddingBottom: 35,
      paddingHorizontal: 16,
    },
    button: {
      backgroundColor: brand,
      padding: 12,
      borderRadius: 16,
      alignItems: 'center',
    },
    buttonText: {
      color: contrastText,
      fontSize: 16,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    toast: {
      position: 'absolute',
      top: 50,
      left: 16,
      right: 16,
      backgroundColor: successBackground,
      padding: 16,
      borderRadius: 12,
      zIndex: 1000,
    },
    toastTitle: {
      fontWeight: 'bold',
      fontSize: 15,
      color: contrastText,
    },
    toastMessage: {
      fontSize: 13,
      color: contrastText,
      marginTop: 4,
    },
    loadingContainer: {
      position: 'absolute',
      width: '100%',
      height: 300,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
    },
  });

  const encodedPosterUrl = posterUrl;

  return (
    <>
      {showToast && (
        <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
          <Text style={styles.toastTitle}>✅ Tudo certo!</Text>
          <Text style={styles.toastMessage}>Lembrete definido com sucesso!</Text>
        </Animated.View>
      )}
      <Header title="Programação do cinema" style={styles.headerStyle} backRoute="/(tabs)/home" />
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollViewStyle}
          contentContainerStyle={styles.contentContainerStyle}
        >
          {/* Pôster do filme */}
          <View style={styles.posterContainer}>
            {imageLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={neutralText} />
              </View>
            )}
            <Image
              source={{ uri: encodedPosterUrl }}
              style={styles.poster}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />
          </View>

          {/* Título e data/hora */}
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.dateTime}>{date} às {time}</ThemedText>

          {/* Informações do filme */}
          <View style={styles.infoContainer}>
            <View style={styles.infoContainerItem}>
              <ThemedText style={styles.infoLabel}>Classificação indicativa:</ThemedText>
              <View style={styles.classificacaoBadge}>
                <ThemedText style={styles.classificacaoText}>{classificacao} anos</ThemedText>
              </View>
            </View>

            <View style={styles.infoContainerItem}>
              <ThemedText style={styles.infoLabel}>Acessibilidade:</ThemedText>
              <ThemedText style={styles.infoText}>{audio}</ThemedText>
            </View>

            <View style={styles.infoContainerItem}>
              <ThemedText style={styles.infoLabel}>Gênero:</ThemedText>
              <ThemedText style={styles.infoText}>{genero}</ThemedText>
            </View>

            <View style={styles.infoContainerItem}>
              <ThemedText style={styles.infoLabel}>Lançamento:</ThemedText>
              <ThemedText style={styles.infoText}>{lancamento}</ThemedText>
            </View>

            <View style={styles.infoContainerItem}>
              <ThemedText style={styles.infoLabel}>Duração:</ThemedText>
              <ThemedText style={styles.infoText}>{duracao}</ThemedText>
            </View>
          </View>

          {/* Sinopse */}
          <ThemedText style={styles.sectionTitle}>Sinopse</ThemedText>
          <ThemedText style={styles.text}>{subtitle}</ThemedText>
        </ScrollView>

        {/* Botão fixo */}
        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSetReminder}>
            <ThemedText style={styles.buttonText}>Definir Lembrete</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}