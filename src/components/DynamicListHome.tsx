import React from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ListRenderItem } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from './ui/IconSymbol';

export type ListItem = {
  title: string;
  subtitle?: string;
  time: string;
  date: string;
  rawDate?: string;
  endDate?: string;
  icon?: string;
  iconLibrary?: 'material' | 'fontawesome';
  category: string;
  id: string;
  key?: string;
  onPress?: () => void;
};

type DynamicListHomeProps = {
  data?: ListItem[];
  onClickPrimaryButton?: (item: ListItem) => void;
  removeBottomBorder?: boolean;
  onIconPress?: (item: ListItem) => void;
};

const DynamicListHome: React.FC<DynamicListHomeProps> = ({
  data = [],
  onClickPrimaryButton,
  removeBottomBorder = false,
  onIconPress,
}) => {
  const activeBackground = useThemeColor({}, 'activeBackground');
  const textColor = useThemeColor({}, 'text');
  const text2Color = useThemeColor({}, 'text2');
  const iconBackground = useThemeColor({}, 'iconBackground');
  const iconAccent = useThemeColor({}, 'iconAccent');

  const groupByCategory = (items: ListItem[]) => {
    return items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, ListItem[]>);
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

  const getNowBRT = (): Date => {
    const now = new Date();
    const localOffsetMinutes = now.getTimezoneOffset();
    const brtOffsetMinutes = 180;
    const brtDate = new Date(now.getTime() + (localOffsetMinutes - brtOffsetMinutes) * 60 * 1000);
    return brtDate;
  };

  // Função para verificar se o evento está ao vivo
  const isEventOngoing = (item: ListItem): boolean => {
    if (!item.rawDate || !item.endDate) {
      return false;
    }

    const nowBRT = getNowBRT();

    const eventStart = parseBRTDate(item.rawDate);
    const eventEnd = parseBRTDate(item.endDate);

    if (!eventStart || !eventEnd) {
      console.warn('eventStart ou eventEnd inválidos:', { rawDate: item.rawDate, endDate: item.endDate });
      return false;
    }

    return nowBRT >= eventStart && nowBRT <= eventEnd;
  };

  const styles = StyleSheet.create({
    categoryTitle: {
      fontSize: 13,
      fontWeight: '400',
      textTransform: 'uppercase',
      color: textColor,
      marginBottom: 8,
    },
    itemContainer: {
      paddingVertical: 10,
      paddingHorizontal: 0,
      backgroundColor: activeBackground,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      borderBottomLeftRadius: removeBottomBorder ? 0 : 12,
      borderBottomRightRadius: removeBottomBorder ? 0 : 12,
      paddingBottom: removeBottomBorder ? 0 : 10,
    },
    item: {
      paddingVertical: 10,
      backgroundColor: activeBackground,
    },
    firstItem: {},
    lastItem: {},
    itemDivider: {
      borderBottomWidth: 1,
      borderBottomColor: '#0F1C471A',
      marginHorizontal: 0,
    },
    itemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
    },
    timeContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      width: 72,
    },
    timeText: {
      fontSize: 15,
      fontWeight: '600',
      color: text2Color,
      marginBottom: 0,
    },
    dateText: {
      fontSize: 13,
      lineHeight: 22,
      fontWeight: '600',
    },
    dateTextHoje: {
      color: '#DA1984',
    },
    dateTextAmanha: {
      color: textColor,
    },
    textContainer: {
      flex: 3,
      flexDirection: 'column',
      justifyContent: 'center',
      marginHorizontal: 10,
    },
    titleText: {
      fontSize: 17,
      fontWeight: '400',
      color: text2Color,
      lineHeight: 18,
    },
    subtitleText: {
      fontSize: 12,
      color: textColor,
      lineHeight: 14,
    },
    iconContainer: {
      flex: 1,
      alignItems: 'flex-end',
    },
    iconWrapper: {
      backgroundColor: iconBackground,
      borderRadius: 8,
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: 'gray',
      textAlign: 'center',
      marginVertical: 20,
    },
  });

  const renderItem: ListRenderItem<ListItem> = ({ item, index }) => {
    const groupedItems = groupByCategory(data);
    const itemsInCategory = groupedItems[item.category];
    const isFirstItem = index === 0;
    const isLastItem = index === itemsInCategory?.length - 1;
    const isOngoing = isEventOngoing(item);

    return (
      <ThemedView
        style={[
          styles.item,
          isFirstItem && styles.firstItem,
          isLastItem && styles.lastItem,
          !isLastItem && styles.itemDivider,
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            console.log('Item clicked:', item);
            console.log('onPress handler:', item.onPress);
            onClickPrimaryButton?.(item);
          }}
          style={styles.itemContent}
        >
          {/* Coluna 1: Hora e Data */}
          <View style={styles.timeContainer}>
            <ThemedText style={styles.timeText}>{item.time}</ThemedText>
            <ThemedText
              style={[
                styles.dateText,
                item.date === 'HOJE' && styles.dateTextHoje,
                item.date === 'AMANHÃ' && styles.dateTextAmanha,
              ]}
            >
              {isOngoing ? 'AGORA' : item.date}
            </ThemedText>
          </View>

          {/* Coluna 2: Título e Descrição */}
          <View style={styles.textContainer}>
            <ThemedText style={styles.titleText}>{item.title}</ThemedText>
            {item.subtitle && (
              <ThemedText style={styles.subtitleText} numberOfLines={1} ellipsizeMode="tail">
                {item.subtitle}
              </ThemedText>
            )}
          </View>

          {/* Coluna 3: Ícone */}
          <View style={styles.iconContainer}>
            {isOngoing ? (
              <View style={styles.iconWrapper}>
                <IconSymbol
                  name="circle-dot"
                  color={iconAccent}
                  size={20}
                  library={item.iconLibrary || 'fontawesome'}
                />
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => onIconPress?.(item)}
                style={styles.iconWrapper}
              >
                <IconSymbol
                  name="bell"
                  color={iconAccent}
                  size={20}
                  library={item.iconLibrary || 'fontawesome'}
                  faStyle='solid'
                />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </ThemedView>
    );
  };

  const renderCategory = (item: ListItem) => (
    <ThemedView key={item.category}>
      {item.category ? (
        <ThemedText style={styles.categoryTitle}>{item.category}</ThemedText>
      ) : null}
      <ThemedView style={styles.itemContainer}>
        <FlatList
          data={groupByCategory(data)[item.category]}
          renderItem={renderItem}
          keyExtractor={(item) => item.key || item.id}
        />
      </ThemedView>
    </ThemedView>
  );

  return (
    <ThemedView>
      {data.length > 0 ? (
        <FlatList
          data={Object.values(groupByCategory(data))}
          renderItem={({ item }) => renderCategory(item[0])}
          keyExtractor={(item) => item[0].category}
        />
      ) : (
        <ThemedText style={styles.emptyText}>Nenhuma atividade disponível</ThemedText>
      )}
    </ThemedView>
  );
};

export default DynamicListHome;