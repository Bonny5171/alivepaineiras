import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, StyleSheet, Modal, Dimensions, ScrollView } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { fetchTelaoData } from '@/api/notion/notionService';
import DynamicListHome, { ListItem } from '../DynamicListHome';
import { useNavigation } from '@react-navigation/native';

type NextCardProps = {
  onIconPress?: (item: ListItem) => void;
};

export default function NextCard({ onIconPress }: NextCardProps) {
  const [listData, setListData] = useState<ListItem[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);
  const activeBackground = useThemeColor({}, 'activeBackground');
  const modalBackground = useThemeColor({}, 'activeBackground');
  const navigation = useNavigation();
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const tertiaryTextColor = useThemeColor({}, 'tertiaryText');
  const lightPinkButton = useThemeColor({}, 'lightPinkButton');
  const dividerColor = useThemeColor({}, 'divider');
  const overlayBackground = useThemeColor({}, 'overlayBackground');
  const buttonBrand = useThemeColor({}, 'buttonBrand');

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
      const descricao = item.properties?.Descrição?.rich_text?.[0]?.plain_text || '';
      const tipo = item.properties?.Tipo?.select?.name || '';
      let subtitle = descricao;
      if (!subtitle) {
        subtitle = tipo;
      }
      subtitle = subtitle.length > 50 ? `${subtitle.substring(0, 47)}...` : subtitle;
      const dateStr = item.properties?.Data?.date?.start || '';
      const endDateStr = item.properties?.Data?.date?.end || '';

      return {
        id: item.id,
        key: item.id,
        title: `${title}`,
        subtitle: subtitle,
        time: extractTime(dateStr),
        date: formatDate(dateStr),
        rawDate: dateStr,
        endDate: endDateStr,
        icon: 'bell',
        iconLibrary: 'fontawesome',
        category: 'Programação do telão',
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
            category: 'Programação do telão',
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
      }
    };
    fetchListData();
  }, []);

  const styles = StyleSheet.create({
    sectionContainer: {
      borderRadius: 20,
      backgroundColor: activeBackground,
      overflow: 'hidden',
      padding: 0,
      marginVertical: 12,
    },
    divider: {
      borderTopWidth: 1,
      borderTopColor: dividerColor,
    },
    verTodasButton: {
      backgroundColor: lightPinkButton,
      paddingVertical: 13,
      paddingHorizontal: 20,
      borderRadius: 20,
      marginHorizontal: 6,
      marginVertical: 6,
    },
    verTodasText: {
      textAlign: 'center',
      fontSize: 17,
      lineHeight: 22,
      fontWeight: '600',
      color: buttonBrand,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: overlayBackground,
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
      color: textColor,
    },
    modalText: {
      fontSize: 15,
      fontWeight: '400',
      color: tertiaryTextColor,
      marginBottom: 50,
    },
    closeButton: {
      marginTop: 20,
      alignSelf: 'center',
    },
    dragHandle: {
      width: 40,
      height: 5,
      backgroundColor: borderColor,
      borderRadius: 2.5,
      alignSelf: 'center',
      marginBottom: 10,
    },
  });

  return (
    <>
      {listData.length > 0 ? (
        <View style={styles.sectionContainer}>
          <DynamicListHome
            data={listData.slice(0, 2)}
            onClickPrimaryButton={(item) => item.onPress?.()}
            removeBottomBorder
            onIconPress={onIconPress}
          />
          <View style={styles.divider} />
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('screenSchedule');
            }}
            style={styles.verTodasButton}
          >
            <ThemedText style={styles.verTodasText}>Ver programação do mês</ThemedText>
          </TouchableOpacity>
        </View>
      ) : null}

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
    </>
  );
}