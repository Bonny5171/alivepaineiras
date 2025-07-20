import React, { useEffect, useState, useRef } from 'react';
import { TouchableOpacity, View, StyleSheet, Modal, Dimensions, ScrollView, Animated, Text, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { fetchTelaoData } from '@/api/notion/notionService';
import DynamicListHome, { ListItem } from '@/components/DynamicListHome';
import { Wrapper } from '@/components/Wrapper';
import Header from '@/components/Header';
import FooterTabBar from '@/components/FooterTabBar';
import { ThemedScrollView } from '@/components/ThemedScrollView';
// import { ServiceNotification } from '@/services/NotificationService';

const MINUTES_AGO = 30;

export default function ScreenSchedule() {
  const [listData, setListData] = useState<ListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with true to show loading initially
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);
  const activeBackground = useThemeColor({}, 'activeBackground');
  const modalBackground = '#FFF';

  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  const getNowBRT = (): Date => {
    const now = new Date();
    const localOffsetMinutes = now.getTimezoneOffset();
    const brtOffsetMinutes = 180;
    const brtDate = new Date(now.getTime() + (localOffsetMinutes - brtOffsetMinutes) * 60 * 1000);
    return brtDate;
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr || typeof dateStr !== 'string') {
      return 'N/A';
    }

    const currentDate = getNowBRT();
    const activityDate = parseBRTDate(dateStr);
    if (!activityDate || isNaN(activityDate.getTime())) {
      return 'N/A';
    }

    const isToday = activityDate.toDateString() === currentDate.toDateString();
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(currentDate.getDate() + 1);
    const isTomorrow = activityDate.toDateString() === tomorrow.toDateString();

    if (isToday) {
      return 'HOJE';
    } else if (isTomorrow) {
      return 'AMANHÃ';
    } else {
      const day = activityDate.getDate().toString().padStart(2, '0');
      const month = (activityDate.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    }
  };

  const extractTime = (dateStr?: string): string => {
    if (!dateStr || typeof dateStr !== 'string') {
      return 'N/A';
    }
    const date = parseBRTDate(dateStr);
    if (!date || isNaN(date.getTime())) {
      return 'N/A';
    }
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const transformDataToListItems = (data: any[]): ListItem[] => {
    const filteredData = data.filter(item => {
      const title = item.properties?.Evento?.title?.[0]?.plain_text?.trim();
      return title && title.length > 0;
    });

    const currentDate = getNowBRT();
    const filteredByDate = filteredData.filter(item => {
      const dateStr = item.properties?.Data?.date?.end || '';
      const activityDate = parseBRTDate(dateStr);
      return activityDate && activityDate >= currentDate;
    });

    const transformedData = filteredByDate.map(item => {
      const title = item.properties?.Evento?.title?.[0]?.plain_text?.trim() || 'Sem Título';
      const tipo = item.properties?.Tipo?.select?.name || '';
      const descricao = item.properties?.Descrição?.rich_text?.[0]?.plain_text || tipo;
      let subtitle = descricao;
      const dateStr = item.properties?.Data?.date?.start || '';
      const endDateStr = item.properties?.Data?.date?.end || '';

      return {
        id: item.id,
        key: item.id,
        title: title,
        subtitle: subtitle.length > 50 ? `${subtitle.substring(0, 47)}...` : subtitle,
        time: extractTime(dateStr),
        date: formatDate(dateStr),
        rawDate: dateStr,
        endDate: endDateStr,
        icon: 'bell',
        iconLibrary: 'fontawesome',
        category: '',
        onPress: () => {
          setSelectedItem({
            id: item.id,
            key: item.id,
            title: title,
            subtitle: subtitle,
            time: extractTime(dateStr),
            date: formatDate(dateStr),
            rawDate: dateStr,
            endDate: endDateStr,
            icon: 'bell',
            iconLibrary: 'fontawesome',
            category: formatDate(dateStr),
          });
          setModalVisible(true);
        },
      };
    });

    return transformedData.sort((a, b) => {
      const dateA = a.rawDate ? parseBRTDate(a.rawDate) : new Date(0);
      const dateB = b.rawDate ? parseBRTDate(b.rawDate) : new Date(0);
      return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
    });
  };

  useEffect(() => {
    const fetchListData = async () => {
      try {
        const response = await fetchTelaoData();
        const transformedData = transformDataToListItems(response);
        setListData(transformedData);
      } catch (error) {
        console.error('Erro ao buscar e transformar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchListData();
  }, []);

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

  const handleIconPress = async (item: ListItem) => {
    try {
      setIsLoading(true);

      const now = new Date();
      const dataAula = new Date(item.rawDate);
      const horaFormatada = dataAula
        .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const lembrete = new Date(dataAula.getTime() - MINUTES_AGO * 60 * 1000);
      const content = {
       title: `Telão: ${item.title}`,
        body: `Programação do telão para ${item.title} às ${horaFormatada}`,
        sound: 'default',
      }

      // const notificationId = await ServiceNotification
      //   .scheduleOneTimeNotification(content, lembrete);
      // console.log('📅 Notificação agendada para:', lembrete.toString(), notificationId);

      setShowToast(true);
    } catch (error) {
      console.error('Erro ao criar notificações:', error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    sectionContainer: {
      borderRadius: 20,
      backgroundColor: activeBackground,
      overflow: 'hidden',
      padding: 0,
      marginVertical: 20,
    },
    divider: {
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
    },
    scrollViewStyle: {
      flex: 1,
      margin: 0,
      paddingHorizontal: 15,
    },
    contentContainerStyle: {
      paddingBottom: 60,
      marginBottom: 60,
    },
    wrapperStyle: {
      flex: 1,
      paddingBottom: 60,
      marginBottom: 60,
    },
    headerStyle: {
      margin: 0,
      padding: 0,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: modalBackground,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      width: Dimensions.get('window').width,
      maxHeight: Dimensions.get('window').height * 0.5,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: '600',
      marginBottom: 10,
      color: '#0F1C47',
    },
    modalText: {
      fontSize: 15,
      fontWeight: '400',
      color: '#0F1C4799',
      marginBottom: 50,
    },
    closeButton: {
      marginTop: 20,
      alignSelf: 'center',
    },
    closeButtonText: {
      color: '#007AFF',
      fontSize: 16,
    },
    dragHandle: {
      width: 40,
      height: 5,
      backgroundColor: '#ccc',
      borderRadius: 2.5,
      alignSelf: 'center',
      marginBottom: 10,
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
  });

  return (
    <>
      {showToast && (
        <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
          <Text style={styles.toastTitle}>✅ Tudo certo!</Text>
          <Text style={styles.toastMessage}>Lembrete definido com sucesso!</Text>
        </Animated.View>
      )}
      <Header title="Programação do telão" style={styles.headerStyle} backRoute="/(tabs)/home" />
      <Wrapper isLoading={isLoading} style={styles.wrapperStyle}>
        <ThemedScrollView
          style={styles.scrollViewStyle}
          contentContainerStyle={styles.contentContainerStyle}
        >
          {isLoading ? (
            <ThemedText>Carregando...</ThemedText>
          ) : listData.length > 0 ? (
            <View style={styles.sectionContainer}>
              <DynamicListHome
                data={listData}
                onClickPrimaryButton={(item) => item.onPress?.()}
                removeBottomBorder
                onIconPress={handleIconPress}
              />
              <View style={styles.divider} />
            </View>
          ) : (
            <ThemedText>Nenhum item disponível para exibir.</ThemedText>
          )}
        </ThemedScrollView>
      </Wrapper>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.dragHandle} />
            <ScrollView>
              {selectedItem && (
                <>
                  <ThemedText style={styles.modalTitle}>{selectedItem.title}</ThemedText>
                  <ThemedText style={styles.modalText}>{selectedItem.subtitle}</ThemedText>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <FooterTabBar activeTab="index" />
    </>
  );
}