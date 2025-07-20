import React from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ListRenderItem } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';

export type ListItem = {
  title: string;
  subtitle?: string;
  time: string;
  category: string;
  id: string;
  key?: string;
  onPress?: () => void;
  classificacao?: string;
};

type DynamicListCineProps = {
  data?: ListItem[];
  onClickPrimaryButton?: (item: ListItem) => void;
};

const DynamicListCine: React.FC<DynamicListCineProps> = ({
  data = [],
  onClickPrimaryButton,
}) => {
  const activeBackground = useThemeColor({}, 'activeBackground');
  const textColor = useThemeColor({}, 'text');
  const text2Color = useThemeColor({}, 'text2');
  const text3Color = useThemeColor({}, 'text3');

  const groupByCategory = (items: ListItem[]) => {
    return items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, ListItem[]>);
  };

  const getClassificationColor = (classificacao: string) => {
    switch (classificacao) {
      case 'L':
        return '#35E07C';
      case '10':
        return '#6CCFF6';
      case '12':
        return '#F6D743';
      case '14':
        return '#EA9610';
      case '16':
        return '#FF3F3F';
      case '18':
        return '#000000';
      default:
        return '#D3D3D3';
    }
  };
  

  const styles = StyleSheet.create({
    categoryTitle: {
      fontSize: 13,
      fontWeight: '400',
      textTransform: 'uppercase',
      color: textColor,
      marginBottom: 4,
      marginHorizontal: 12,
    },
    itemContainer: {
      paddingVertical: 0,
      paddingHorizontal: 0,
      backgroundColor: activeBackground,
      borderRadius: 16,
      marginBottom: 0,
    },
    item: {
      paddingVertical: 10,
      backgroundColor: activeBackground,
      borderRadius: 16,
    },
    itemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    classificationContainer: {
      width: 40,
      height: 40,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    classificationText: {
      fontSize: 20,
      lineHeight: 22,
      fontWeight: '900',
      color: '#FFFFFF',
    },
    textContainer: {
      flex: 3,
      flexDirection: 'column',
      justifyContent: 'center',
    },
    titleText: {
      fontSize: 17,
      fontWeight: '500',
      color: text2Color,
      lineHeight: 18,
      margin: 0,
      padding: 0,
      paddingTop: 5,
    },
    timeText: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 13,
      fontWeight: '400',
      color: text3Color,
      margin: 0,
      marginTop: 5,
      padding: 0,
    },
    timeIcon: {
      marginRight: 5,
    },
    timeIconText: {
      marginLeft: 5,
      marginTop:5,
    },
    iconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
    },
    iconWrapper: {
      padding: 8,
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
    const isLastItem = index === itemsInCategory.length - 1;

    return (
      <ThemedView style={[styles.item, !isLastItem && { borderBottomWidth: 1, borderBottomColor: '#0F1C471A' }]}>
        <TouchableOpacity
          onPress={() => onClickPrimaryButton?.(item)}
          style={styles.itemContent}
        >
          <View style={[styles.classificationContainer, { backgroundColor: getClassificationColor(item.classificacao || 'L') }]}>
            <ThemedText style={styles.classificationText}>
              {item.classificacao || 'L'}
            </ThemedText>
          </View>
          <View style={styles.textContainer}>
            <ThemedText style={styles.titleText}>{item.title}</ThemedText>
            <ThemedText style={styles.timeText}>
              <IconSymbol name='clock' size={13} color='#0F1C4799' style={styles.timeIcon} />
              <ThemedText style={styles.timeIconText}> {item.time}</ThemedText>
            </ThemedText>
          </View>
          <View style={styles.iconContainer}>
            <View style={styles.iconWrapper}>
              <IconSymbol name='angle-right' size={30} color='#666' />
            </View>
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

export default DynamicListCine;