import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, TextInput } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { ThemedText } from '@/components/ThemedText';
import { Wrapper } from '@/components/Wrapper';
import { useThemeColor } from '@/hooks/useThemeColor';
import { listarFaturas } from '@/api/app/financeiro';
import { useNavigation } from '@react-navigation/native';
import { invoicesToItems, ListarFaturasItem } from '@/api/app/appTransformer';
import Header from '@/components/Header';
import FooterTabBar from '@/components/FooterTabBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { SectionTitle } from '@/components/SectionTitle';

const formatValue = (value: string) => {
  return parseFloat(value.replace('.', '').replace(',', '.'));
};

const calcularMedia = (faturas: ListarFaturasItem[]) => {
  if (faturas.length === 0) return 0;

  const valores = faturas.map((fatura) => formatValue(fatura.VALOR));
  const soma = valores.reduce((acc, valor) => acc + valor, 0);
  return soma / faturas.length;
};

export default function FinanceiroScreen() {
  const [originalData, setOriginalData] = useState<ListarFaturasItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const activeBackground = useThemeColor({}, 'activeBackground');
  const brand = useThemeColor({}, 'brand');
  const text = useThemeColor({}, 'text');
  const background2 = useThemeColor({}, 'background2');
  const placeholderText = useThemeColor({}, 'placeholderText');
  const text2 = useThemeColor({}, 'text2');
  const divider = useThemeColor({}, 'divider');
  const iconBackground = useThemeColor({}, 'iconBackground');
  const iconAccent = useThemeColor({}, 'iconAccent');
  const neutralText = useThemeColor({}, 'neutralText');
  const chartLabel = useThemeColor({}, 'chartLabel');
  const background1 = useThemeColor({}, 'background1');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const apiData = await listarFaturas();
        setOriginalData(apiData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const ultimasSeisFaturas = originalData.slice(0, 6);
  const mediaUltimasSeisFaturas = calcularMedia(ultimasSeisFaturas);

  function getShortMonth(desc: string) {
    if (/\d{2}\/\d{4}/.test(desc)) {
      const [mes] = desc.split('/');
      return mes.length === 2 ? mes : mes.slice(0, 3).toUpperCase();
    }
    return desc.slice(0, 3).toUpperCase();
  }

  function shortValue(yLabel: string) {
    const val = parseFloat(yLabel.replace(',', '.'));
    if (val >= 1000) {
      return (val / 1000).toFixed(1).replace('.', ',');
    }
    return yLabel.replace('.', ',');
  }

  const chartData = {
    labels: ultimasSeisFaturas.map(item => getShortMonth(item.DESCRICAO)),
    datasets: [
      {
        data: ultimasSeisFaturas.map(item => formatValue(item.VALOR)),
      }
    ]
  };

  const styles = StyleSheet.create({
    summaryContainer: {
      padding: 16,
      backgroundColor: activeBackground,
      borderRadius: 16,
      marginBottom: 16,
    },
    summaryText: {
      color: neutralText,
    },
    summaryValue: {
      fontSize: 20,
      fontWeight: '600',
      color: text2,
    },
    chart: {
      marginVertical: 8,
      borderRadius: 16,
    },
    servicesTitle: {
      color: text,
      marginLeft: 15,
      marginBottom: 5,
      fontSize: 13,
      textTransform: 'uppercase',
    },
    searchContainer: {
      backgroundColor: background2,
      borderRadius: 16,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 8,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 18,
      color: text2,
    },
    menuContainer: {
      backgroundColor: background2,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    menuItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: divider,
    },
    iconContainer: {
      backgroundColor: iconBackground,
      borderRadius: 12,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    menuItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: 1,
    },
    menuItemText: {
      fontSize: 17,
      color: text2,
      fontWeight: '500',
    },
  });

  const menuItems = [
    {
      id: 'faturas',
      title: 'Faturas Paineiras',
      icon: 'receipt',
      onPress: () => navigation.navigate('(financeiro)/faturas' as never),
    },
    /*
    {
      id: 'debitos',
      title: 'Meus débitos',
      icon: 'dollar-sign',
    },
    */
    {
      id: 'ticket',
      title: 'Validação de ticket',
      icon: 'ticket',
      onPress: () =>
        navigation.reset({
          index: 1,
          routes: [
            { name: '(tabs)' as never },
            { name: '(tabs)/ticket' as never },
          ]
        }),
    },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Wrapper isLoading={isLoading}>
      <Header title="Menu" />
      <SectionTitle text='Financeiro' />
      <View style={{ padding: 14, paddingBottom: 100 }}>
        <View style={styles.summaryContainer}>
          <ThemedText style={styles.summaryText}>
            Média mensal (Últimas 6 faturas)
          </ThemedText>
          <ThemedText style={styles.summaryValue}>
            {`R$ ${mediaUltimasSeisFaturas.toFixed(2).replace('.', ',')}`}
          </ThemedText>
          <BarChart
            data={chartData}
            width={Dimensions.get('window').width - 64}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero
            withInnerLines={true}
            chartConfig={{
              backgroundColor: activeBackground,
              backgroundGradientFrom: activeBackground,
              backgroundGradientTo: activeBackground,
              decimalPlaces: 1,
              color: () => brand,
              fillShadowGradient: brand,
              fillShadowGradientOpacity: 1,
              fillShadowGradientFrom: brand,
              fillShadowGradientTo: brand,
              backgroundGradientToOpacity: 1,
              barPercentage: 1,
              labelColor: () => chartLabel,
              formatYLabel: shortValue,
              propsForBackgroundLines: {
                stroke: background1,
                strokeDasharray: '',
                strokeWidth: 1,
              },
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: brand,
              },
            }}
            style={styles.chart}
          />
        </View>
        <Text style={styles.servicesTitle}>Serviços</Text>
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifying-glass" library="fontawesome" size={20} color={placeholderText} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar"
            placeholderTextColor={placeholderText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.menuContainer}>
          {filteredItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index < filteredItems.length - 1 ? styles.menuItemBorder : null,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.iconContainer}>
                <IconSymbol name={item.icon} library="fontawesome" size={20} color={iconAccent} />
              </View>
              <View style={styles.menuItemContent}>
                <ThemedText style={styles.menuItemText}>{item.title}</ThemedText>
                <IconSymbol name="chevron-right" color={text2} size={16} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <FooterTabBar />
    </Wrapper>
  );
}