import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Image, Animated, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { fetchCinemaData } from '@/api/notion/notionService';
import DynamicListCine, { ListItem } from '@/components/DynamicListCine';
import { Wrapper } from '@/components/Wrapper';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/Header';
import FooterTabBar from '@/components/FooterTabBar';
import { ThemedScrollView } from '@/components/ThemedScrollView';
import { Loading } from '@/components/Loading';

export default function MovieSchedule() {
  const [listData, setListData] = useState<ListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showToast, setShowToast] = useState<boolean>(false);
  const activeBackground = useThemeColor({}, 'activeBackground');
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  // Função para obter a data/hora atual em BRT (UTC-3)
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
      const year = activityDate.getFullYear();
      return `${day}/${month}/${year}`;
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
      const descricao = item.properties?.Sinopse?.rich_text?.[0]?.plain_text || 'Sem sinopse';
      const subtitle = descricao.length > 50 ? `${descricao.substring(0, 47)}...` : descricao;
      const dateStr = item.properties?.Data?.date?.start || '';
      const endDateStr = item.properties?.Data?.date?.end || '';
      const classificacao = item.properties?.Classificação?.select?.name || 'L';
      const audio = item.properties?.Áudio?.select?.name || 'N/A';
      const posterUrl = item.properties?.Capa?.files?.[0]?.file?.url || require('@/assets/images/cinema.png');

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
        category: formatDate(dateStr),
        classificacao: classificacao,
        posterUrl: posterUrl,
        onPress: () => {
          navigation.navigate('movieScheduleDetails', {
            id: item.id,
            title: title,
            subtitle: descricao,
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchListData();
  }, []);

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

  const handleIconPress = () => {
    setShowToast(true);
  };

  const styles = StyleSheet.create({
    logoContainer: {
      alignItems: 'center',
      marginVertical: 20,
    },
    logo: {
      width: 300,
      height: 200,
      resizeMode: 'contain',
    },
    sectionContainer: {
      borderRadius: 20,
      backgroundColor: activeBackground,
      overflow: 'hidden',
      padding: 0,
      marginVertical: 10,
      marginHorizontal: 10,
    },
    divider: {
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
    },
    scrollViewStyle: {
      flex: 1,
      margin: 0,
      padding: 0,
    },
    contentContainerStyle: {
      paddingBottom: 80,
    },
    wrapperStyle: {
      flex: 1,
    },
    headerStyle: {
      margin: 0,
      paddingVertical: 50,
    },
    sectionHeader: { padding: 16, backgroundColor: '#DA1984' },
    pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
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
      <Header title="Programação do cinema" backRoute="/(tabs)/home" />
      <Wrapper style={styles.wrapperStyle}>
        {isLoading ? (
          <Loading isLoading />
        ) : (
          <ThemedScrollView
            style={styles.scrollViewStyle}
            contentContainerStyle={styles.contentContainerStyle}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/cinema.png')}
                style={styles.logo}
              />
            </View>
            {!isLoading && listData.length === 0 ? (
              <ThemedText style={{ textAlign: 'center', marginTop: 20 }}>
                Nenhum item disponível para exibir.
              </ThemedText>
            ) : !isLoading && listData.length > 0 ? (
              <View style={styles.sectionContainer}>
                <DynamicListCine
                  data={listData}
                  onClickPrimaryButton={(item) => item.onPress?.()}
                  removeBottomBorder
                  onIconPress={handleIconPress}
                />
                <View style={styles.divider} />
              </View>
            ) : null}
          </ThemedScrollView>
        )}
      </Wrapper>
      <FooterTabBar activeTab="index" />
    </>
  );
}