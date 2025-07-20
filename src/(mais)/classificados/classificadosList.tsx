import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Wrapper } from '@/components/Wrapper'
import DynamicList, { ListItem } from '@/components/DynamicList'
import { IconSymbol } from '@/components/ui/IconSymbol';
import Header from '@/components/Header';
import { useNavigation } from '@react-navigation/native';
import { fetchAllClassificadosData } from '@/api/notion/notionService';
import { classificadosToItems } from '@/api/app/appTransformer';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function classificadoList() {
    const navigation = useNavigation();
    const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [classificadosData, setClassificadosData] = useState<ListItem[]>([]);
    const [originalData, setOriginalData] = useState<ListItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    // THEME COLORS
    const background = useThemeColor({}, 'background');
    const cardBackground = useThemeColor({}, 'background2');
    const textColor = useThemeColor({}, 'text');
    const text2Color = useThemeColor({}, 'text2');
    const accent = useThemeColor({}, 'brand');
    const iconBg = useThemeColor({}, 'lightPink');
    const tabSelected = useThemeColor({}, 'brand');
    const tabUnselected = useThemeColor({}, 'text2');
    const tabBorder = useThemeColor({}, 'brand');

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const data = await fetchAllClassificadosData();
                setOriginalData(data); // originalData SEM filtro
                // Filtra apenas status 'Público' para exibir na lista principal
                const publicData = data.filter((item: any) => {
                    // Suporta diferentes formatos de status (string ou objeto)
                    const status = item.properties?.Status?.status?.name || item.status || item.Status;
                    return status === 'Público';
                });
                const items = classificadosToItems(publicData);
                setClassificadosData(items);
                setError(null);
            } catch (err) {
                console.error('Erro ao buscar dados classificados:', err);
                setError('Falha ao carregar os classificados');
                setClassificadosData([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Extrai categorias únicas do mockData
    const categories = ['TODOS', ...Array.from(new Set(classificadosData.map(item => item.category))).filter(category => category !== 'TODOS').sort((a, b) => a.localeCompare(b))];

    // Filtra os dados conforme a categoria selecionada
    const filteredData = selectedCategory === 'TODOS'
        ? classificadosData
        : classificadosData.filter(item => item.category === selectedCategory);

    const renderTabs = () => (
        <View style={{ marginBottom: 16 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 8 }}>
            {categories.map(category => {
                const isSelected = selectedCategory === category;
                return (
                <TouchableOpacity
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={{
                    borderWidth: 1,
                    borderColor: isSelected ? tabBorder : tabUnselected,
                    backgroundColor: isSelected ? tabBorder + '22' : 'transparent',
                    borderRadius: 10,
                    paddingVertical: 12,
                    paddingHorizontal: 18,
                    marginRight: 4,
                    }}
                    activeOpacity={0.7}
                >
                    <Text style={{ color: isSelected ? tabSelected : text2Color, fontWeight: isSelected ? 'bold' : '600' }}>
                    {category}
                    </Text>
                </TouchableOpacity>
                );
            })}
            </ScrollView>
        </View>
    );

    const styles = StyleSheet.create({
        button: {
            backgroundColor: cardBackground,
            borderRadius: 20,
            paddingVertical: 16,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
            marginBottom: 16,
        },
        iconContainer: {
            backgroundColor: iconBg,
            borderRadius: 12,
            padding: 8,
        },
        text: {
            flex: 1,
            fontSize: 16,
            fontWeight: '600',
            color: textColor,
        },
        chevron: {
            marginLeft: 'auto',
        },
    });

    return (
        <>
            <Header title="Classificados" />
            <Wrapper style={{ padding: 16, backgroundColor: background }} isLoading={isLoading}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        navigation.navigate("(classificados)/myList", { originalData });
                    }}
                    activeOpacity={0.8}
                >
                    <View style={styles.iconContainer}>
                        <IconSymbol name="plus" library='fontawesome' size={16} color={accent} />
                    </View>
                    <Text style={styles.text}>Meus anúncios</Text>
                </TouchableOpacity>
                {renderTabs()}
                <DynamicList
                    data={filteredData}
                    searchable
                    onClickPrimaryButton={(item) => {
                        const originalItem = originalData.find(orig => orig.id === item.id);
                        if (originalItem) {
                            navigation.navigate("(classificados)/Details", { item: originalItem });
                        }
                    }}
                />
            </Wrapper>
        </>
    )
}