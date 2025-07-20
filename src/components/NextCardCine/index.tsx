import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { fetchCinemaData } from '@/api/notion/notionService';
import DynamicListHome, { ListItem } from '../DynamicListHome';
import { useNavigation } from '@react-navigation/native';

type NextCardCineProps = {
  onIconPress?: (item: ListItem) => void;
};

export default function NextCardCine({ onIconPress }: NextCardCineProps) {
  const navigation = useNavigation();
  const [listData, setListData] = useState<ListItem[]>([]);
  const activeBackground = useThemeColor({}, 'activeBackground');
  const lightPinkButton = useThemeColor({}, 'lightPinkButton');
  const dividerColor = useThemeColor({}, 'divider');
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
    return `${hours}h${minutes}`;
  };

  const transformDataToListItems = (data: any[]): ListItem[] => {
    const filteredData = data.filter(item => {
      const title = item.properties?.Programação?.title?.[0]?.plain_text?.trim();
      return title && title.length > 0;
    });

    const currentDate = getNowBRT();
    const filteredByDate = filteredData.filter(item => {
      const dateStr = item.properties?.Data?.date?.end || '';
      const activityDate = parseBRTDate(dateStr);
      return activityDate && activityDate >= currentDate;
    });

    const transformedData = filteredByDate.map(item => {
      const title = item.properties?.Programação?.title?.[0]?.plain_text?.trim() || 'Sem Título';
      const sinopse = item.properties?.Sinopse?.rich_text?.[0]?.plain_text || 'Sem sinopse';
      const subtitle = sinopse.length > 50 ? `${sinopse.substring(0, 47)}...` : sinopse;
      const dateStr = item.properties?.Data?.date?.start || '';
      const endDateStr = item.properties?.Data?.date?.end || '';
      const classificacao = item.properties?.Classificação?.select?.name || 'L';
      const audio = item.properties?.Áudio?.select?.name || 'N/A';
      const posterUrl = item.properties?.Capa?.files?.[0]?.file?.url || '@/assets/images/cinema.png';

      return {
        id: item.id,
        key: item.id,
        title: title,
        subtitle: audio,
        time: extractTime(dateStr),
        date: formatDate(dateStr),
        rawDate: dateStr,
        endDate: endDateStr,
        icon: classificacao === 'L' ? 'circle' : 'square',
        iconLibrary: 'fontawesome',
        category: 'Programação do cinema',
        onPress: () => {
          navigation.navigate('movieScheduleDetails', {
            id: item.id,
            title: title,
            subtitle: sinopse,
            time: extractTime(dateStr),
            date: formatDate(dateStr),
            rawDate: dateStr,
            endDate: endDateStr,
            classificacao: classificacao,
            audio: audio,
            genero: item.properties?.Gênero?.select?.name || 'N/A',
            lancamento: item.properties?.Lançamento?.rich_text?.[0]?.plain_text || 'N/A',
            duracao: item.properties?.Duração?.rich_text?.[0]?.plain_text || 'N/A',
            posterUrl: posterUrl,
          });
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
        const response = await fetchCinemaData();
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
              navigation.navigate('movieSchedule');
            }}
            style={styles.verTodasButton}
          >
            <ThemedText style={styles.verTodasText}>Ver programação do mês</ThemedText>
          </TouchableOpacity>
        </View>
      ) : null}
    </>
  );
}