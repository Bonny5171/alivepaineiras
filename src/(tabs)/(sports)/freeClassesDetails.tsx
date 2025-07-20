import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Platform, ActivityIndicator, Alert } from 'react-native';
import Header from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
// import { ServiceNotification } from '@/services/NotificationService';

const MINUTES_AGO = 30;

export default function FreeClassDetailsScreen({ route }: any) {
  const { PROFESSOR, ATIVIDADE, HRINICIO, OBJETIVO, VAGAS } = route.params;
  const [isLoadingReminder, setIsLoadingReminder] = useState(false)
  const lightPinkColor = useThemeColor({}, 'lightPink');
  const background = useThemeColor({}, 'background');
  const background2 = useThemeColor({}, 'background2');
  const textColor = useThemeColor({}, 'text');
  const [showToast, setShowToast] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  const handleReminder = async () => {
    setIsLoadingReminder(true)

    await handleScheduleReminder();

    setShowToast(true);

    setIsLoadingReminder(false)
  };

  function extrairHoraEminuto(horarioStr: string): { aulaHora: number; aulaMinuto: number } {
    const match = horarioStr.match(/das\s+([0-9]{1,2}(?::[0-9]{2})?|[0-9]{1,2}h?)/i);

    if (!match || !match[1]) {
      throw new Error('Formato inválido de horário');
    }

    let inicio = match[1]
      .replace('h', ':00')              // "10h" -> "10:00"
      .replace(/^(\d{1,2})$/, '$1:00'); // "7"    -> "7:00"

    if (!inicio.includes(':')) {
      inicio += ':00';
    }

    const [horaStr, minutoStr] = inicio.split(':');
    const aulaHora = parseInt(horaStr, 10);
    const aulaMinuto = parseInt(minutoStr, 10);

    return { aulaHora, aulaMinuto };
  }

  const handleScheduleReminder = async () => {
    try {
      const now = new Date();
      const { aulaHora, aulaMinuto } = extrairHoraEminuto(HRINICIO); // ex: 11:00 -> {11, 0}

      const dataAula = new Date();
      dataAula.setHours(aulaHora, aulaMinuto, 0, 0);                  // define hora da aula

      const lembrete = new Date(dataAula.getTime() - MINUTES_AGO * 60 * 1000);
      if (lembrete <= now) {
        lembrete.setDate(lembrete.getDate() + 1);
      }

      // const notificationId = await ServiceNotification.scheduleOneTimeNotification(
      //   {
      //     title: `Aula: ${ATIVIDADE}`,
      //     body: `Lembrete para sua aula com ${PROFESSOR} às ${HRINICIO}`,
      //     sound: 'default',
      //   },
      //   lembrete
      // );

      // console.log('📅 Notificação agendada para:', lembrete.toString(), notificationId);
    } catch (error) {
      console.error('Erro ao agendar lembrete:', error);
      Alert.alert('Erro', 'Não foi possível agendar o lembrete.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: background }}>

      {showToast && (
        <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
          <Text style={styles.toastTitle}>✅ Tudo certo!</Text>
          <Text style={styles.toastMessage}>Lembrete definido com sucesso!</Text>
        </Animated.View>
      )}
      
      <Header title="Horários" backRoute='/(tabs)/(sports)/home' />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <View style={[styles.card, { backgroundColor: background2 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Text style={styles.numberText}>{VAGAS}</Text>
              </View>
              <Text style={styles.vagasText}>Vagas</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.titulo, { color: textColor }]}>
                {ATIVIDADE}
              </Text>
              <View style={styles.professorContainer}>
                <View style={{ width: 20, display: 'flex', alignItems: 'center', marginRight: 6 }}>
                  <IconSymbol name='person' size={20} color='#6f7791' library="material" />
                </View>
                <Text style={styles.professor}>
                  {PROFESSOR}
                </Text>
              </View>
              <View style={styles.timeContainer}>
                <View style={{ width: 20, display: 'flex', alignItems: 'center', marginRight: 6 }}>
                  <IconSymbol name='watch-later' size={20} color='#6f7791' library="material" />
                </View>
                <Text style={styles.horario}>
                  {HRINICIO}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: textColor}]}>SOBRE A ATIVIDADE</Text>
        <Text style={styles.descricao}>
          {OBJETIVO}
        </Text>

      </ScrollView>

      <View style={[styles.footer, { backgroundColor: background2  }]}>
        <TouchableOpacity style={[styles.botao, { backgroundColor: lightPinkColor }]} onPress={handleReminder}>
          {isLoadingReminder ? (
            <ActivityIndicator size={'small'} color='#fff' />
          ) : (
            <Text style={styles.textoBotao}>Definir Lembrete</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  iconContainer: { flexDirection: 'column', alignItems: 'center', marginRight: 16, alignSelf: 'flex-start' },
  iconCircle: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#d6f9e6' },
  numberText: { fontSize: 22, fontWeight: 'bold', color: '#3eab7e' },
  vagasText: { fontSize: 12, color: '#636d8e', marginTop: 4 },
  sectionContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 0,
    marginVertical: 10,
    marginHorizontal: 10,
  },
  titulo: { fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 4 },
  professorContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  timeContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  professor: { fontSize: 14, color: '#878da3' },
  horario: { fontSize: 14, color: '#878da3' },
  sectionTitle: { fontSize: 14, fontWeight: '400', marginBottom: 8, paddingHorizontal: 16, color: '#39456a' },
  descricao: { fontSize: 13, color: '#878da3', paddingHorizontal: 16, lineHeight: 23 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingBottom: Platform.select({
      ios: 30,
      android: 16,
    }),
    elevation: 5,
  },
  botao: {
    backgroundColor: '#F9D9EB',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  textoBotao: {
    color: '#D53F8C',
    fontWeight: 'bold',
    fontSize: 16,
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
  loadingContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
});