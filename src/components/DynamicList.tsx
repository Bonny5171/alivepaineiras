import React, { useState, useEffect } from 'react';
import { View, ScrollView, FlatList, TouchableOpacity, StyleSheet, ListRenderItem, Image } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from './ui/IconSymbol';
import { Filter } from '@/api/app/appTypes';
import { unicodeToChar } from '@/api/app/appTransformer';
import { InputComponent } from './Input';

type Tab = string; // Agora as abas podem ser dinâmicas

export type ListItem = {
    title: string;
    subtitle?: string;
    subtitleIcon?: string; // Novo: ícone pequeno antes do subtitle
    icon?: string;
    iconLibrary?: 'material' | 'fontawesome';
    category: string;
    id: string;
    key?: string;
    tags?: [{ title: string, color: string }];
    onPress?: () => void; // Adicionando onPress como opcional
    altText?: string; // Novo: texto alternativo para avatar
    showName?: boolean; // Novo: se deve mostrar o altText
    rightImage?: string; // Novo: url de imagem para exibir à direita do item
    disableChevronAndAction?: boolean; // Se true, não mostra o chevron e não chama ação ao clicar
};

type DynamicListProps = {
    filters?: Filter[]; // Filtros opcionais
    tabs?: Tab[]; // Abas opcionais
    data?: ListItem[]; // Dados opcionais
    selectedFilter?: Filter | null; // Filtro selecionado externamente
    onChangeTab?: (tab: number) => void; // Callback quando uma aba é selecionada
    searchable?: boolean;
    onSelectFilter?: (filter: Filter) => void; // Callback quando um filtro é selecionado
    onClickPrimaryButton?: (item: ListItem) => void; // Callback quando um item é clicado
    removeBottomBorder?: boolean;
    selectedTabProp?: Tab | null; // Aba selecionada externamente
    raw?: boolean; // Novo: modo cru, sem bordas e fundo
    emptyText?: string; // Novo: texto customizável para lista vazia
    rightImageEnable?: boolean; // Novo: controla se mostra as iniciais na direita para todos os itens
};

const DynamicList: React.FC<DynamicListProps> = ({
    filters = [],
    tabs = [],
    data = [],
    selectedFilter: externalSelectedFilter = null, // Filtro selecionado externamente
    searchable = false,
    onChangeTab,
    onSelectFilter,
    onClickPrimaryButton,
    removeBottomBorder = false,
    selectedTabProp,
    raw = false, // Novo: valor padrão false
    emptyText = 'Nenhuma atividade disponível', // Novo: valor padrão
    rightImageEnable = false // Novo: valor padrão false
}) => {
    const [internalSelectedFilter, setInternalSelectedFilter] = useState<Filter | null>(externalSelectedFilter || null);
    const [selectedTab, setSelectedTab] = useState<Tab | null>(selectedTabProp || null);

    const buttonBackground = useThemeColor({}, 'buttonBackground');
    const activeBackground = useThemeColor({}, 'activeBackground');
    const brand = useThemeColor({}, 'brand');
    const textLabelColor = useThemeColor({}, 'text');
    const background1 = useThemeColor({}, 'background1');

    const [searchTerm, setSearchTerm] = useState('');

    data = data.filter(item => {
        // Filtra os dados com base no termo de busca
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return item.title.toLowerCase().includes(searchLower) ||
                (item.subtitle && item.subtitle.toLowerCase().includes(searchLower)) ||
                (item.altText && item.altText.toLowerCase().includes(searchLower));
        }
        return true;
    });

    // Sincroniza o estado interno com a prop externa
    useEffect(() => {
        setInternalSelectedFilter(externalSelectedFilter || null);
    }, [externalSelectedFilter]);

    // Sincroniza a aba selecionada com a prop externa
    useEffect(() => {
        setSelectedTab(selectedTabProp || null);
    }, [selectedTabProp]);

    const groupByCategory = (items: ListItem[]) => {
        return items.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {} as Record<string, ListItem[]>);
    };

    // Estilos (mantidos iguais)
    const styles = StyleSheet.create({
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 16,
        },
        filterContainer: {
            marginBottom: 16,
        },
        filterButton: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 60,
            height: 60,
            margin: 4,
            borderRadius: 40,
            backgroundColor: buttonBackground,
        },
        selectedFilterButton: {
            backgroundColor: activeBackground,
            borderWidth: 2,
            borderColor: '#3372c5',
        },
        filterText: {
            fontSize: 20,
        },
        tabContainer: {
            flexDirection: 'row',
            marginBottom: 10,
            borderRadius: 10,
            overflow: 'hidden',
            backgroundColor: buttonBackground
        },
        tabButton: {
            flex: 1,
            paddingVertical: 2,
            alignItems: 'center',
            borderBottomWidth: 2,
            borderBottomColor: 'transparent',
        },
        selectedTabButton: {
            backgroundColor: activeBackground,
            borderRadius: 10,
        },
        tabText: {
            fontSize: 16,
        },
        categoryTitle: {
            textTransform: 'uppercase',
            fontSize: 13,
            color: textLabelColor,
            fontWeight: '400',
            marginTop: 16,
            marginLeft: 16,
            backgroundColor: raw ? 'transparent' : undefined,
        },
        itemContainer: {
            paddingVertical: raw ? 0 : 10,
            paddingHorizontal: raw ? 0 : 20,
            backgroundColor: raw ? 'transparent' : activeBackground,
            borderTopLeftRadius: raw ? 0 : 12,
            borderTopRightRadius: raw ? 0 : 12,
            borderBottomLeftRadius: raw ? 0 : (removeBottomBorder ? 0 : 12),
            borderBottomRightRadius: raw ? 0 : (removeBottomBorder ? 0 : 12),
        },
        item: {
            paddingVertical: 10,
            backgroundColor: activeBackground
        },
        firstItem: {
        },
        lastItem: {
        },
        itemDivider: {
            borderBottomWidth: 1,
            borderBottomColor: background1,
        },
        avatar: {
            width: 45,
            height: 45,
            marginRight: 10,
            borderRadius: 30,
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
        },
        itemContent: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        textContainer: {
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: 'transparent',
            flex: 1,
        },
        titleText: {
            fontSize: 14,
            lineHeight: 16,
            fontWeight: '600',
            maxWidth: '100%',
        },
        subtitleText: {
            fontSize: 12,
            margin: 0,
            color: "gray",
            textAlign: 'center'
        },
        icon: {
            width: 55,
            height: 55,
            borderRadius: 10,
            marginRight: 10,
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center'
        },
        tagsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 1,
            backgroundColor: 'transparent',
        },
        tag: {
            borderRadius: 12,
            paddingHorizontal: 8,
            marginRight: 4,
            marginBottom: 4,
        },
        tagText: {
            fontSize: 11,
            color: 'white', // ou qualquer cor que contraste com o fundo da tag
        },
    });

    // Renderiza um item da lista
    const renderItem: ListRenderItem<ListItem> = ({ item, index }) => {
        const groupedItems = groupByCategory(data); // Agrupa os itens por categoria
        const itemsInCategory = groupedItems[item.category]; // Obtém os itens da categoria atual

        // Verifica se é o primeiro ou último item da categoria atual
        const isFirstItem = index === 0;
        const isLastItem = itemsInCategory?.length ? index === itemsInCategory.length - 1 : false;

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
                    onPress={item.disableChevronAndAction ? undefined : () => onClickPrimaryButton?.(item)}
                    style={styles.itemContent}
                    activeOpacity={item.disableChevronAndAction ? 1 : 0.2}
                >
                    {/* Se item.icon for uma URL de imagem, mostra a imagem circular, senão mostra o ícone padrão */}
                    {item.icon && item.icon.startsWith('http') ? (
                        <Image source={{ uri: item.icon }} style={styles.avatar} />
                    ) : item.icon ? (
                        <>
                            {!item.icon.startsWith("U+") &&
                                <View style={{ display: 'flex', justifyContent: "center", alignItems: "center", backgroundColor: "#D034811A", height: 40, width: 40, borderRadius: 10, marginRight: 10 }}>
                                    <IconSymbol color={brand} name={item.icon} size={20} library={item.iconLibrary} ></IconSymbol>
                                </View>}
                            {item.icon.startsWith("U+") &&
                                <ThemedView style={styles.icon}>
                                    <ThemedText>{unicodeToChar(item.icon)}</ThemedText>
                                </ThemedView>}
                        </>
                    ) : item.showName && item.altText ? (
                        <View style={{ width: 45, height: 45, borderRadius: 30, backgroundColor: '#bbb', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                            <ThemedText style={{ color: 'white', fontWeight: 'bold', fontSize: 18, textTransform: 'uppercase' }}>{item.altText.slice(0,2)}</ThemedText>
                        </View>
                    ) : null}
                    <ThemedView style={styles.textContainer}>
                        <ThemedText style={styles.titleText}>{item.title}</ThemedText>
                        <ThemedView style={{ flexDirection: 'row', backgroundColor: 'transparent' }}>
                            {item.tags && item.tags.length > 0 && (
                                <ThemedView style={styles.tagsContainer}>
                                    {item.tags.map((tag, index) => (
                                        <ThemedView
                                            key={index}
                                            style={[styles.tag, { backgroundColor: tag.color }]}
                                        >
                                            <ThemedText style={styles.tagText}>{tag.title}</ThemedText>
                                        </ThemedView>
                                    ))}
                                </ThemedView>
                            )}
                            {item.subtitle && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    {item.subtitleIcon && (
                                        <IconSymbol
                                            name={item.subtitleIcon}
                                            size={14}
                                            color={textLabelColor}
                                            style={{ marginRight: 4 }}
                                        />
                                    )}
                                    <ThemedText
                                        style={styles.subtitleText}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {item.subtitle}
                                    </ThemedText>
                                </View>
                            )}
                        </ThemedView>
                    </ThemedView>
                    {/* Novo: imagem à direita do item, antes do chevron */}
                    {item.rightImage ? (
                        <Image source={{ uri: item.rightImage }} style={styles.avatar} />
                    ) : rightImageEnable && item.altText ? (
                        <View style={{ width: 45, height: 45, borderRadius: 30, backgroundColor: '#bbb', justifyContent: 'center', alignItems: 'center', marginLeft: 8, marginRight: 8 }}>
                            <ThemedText style={{ color: 'white', fontWeight: 'bold', fontSize: 18, textTransform: 'uppercase' }}>{item.altText.slice(0,2)}</ThemedText>
                        </View>
                    ) : null}
                    {/* Chevron ou espaço reservado */}
                    <IconSymbol
                        name={"chevron-right"}
                        color={item.disableChevronAndAction ? activeBackground : textLabelColor}
                        size={16}
                    />
                </TouchableOpacity>
            </ThemedView>
        );
    };

    // Renderiza uma categoria com seus itens
    const renderCategory = (item: ListItem) => (
        <ThemedView key={item.category}>
            {item.category !== '' && (
                <ThemedText style={styles.categoryTitle}>{item.category}</ThemedText>
            )}
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
            {/* Filtros horizontais */}
            {filters.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter.id}
                            style={[
                                styles.filterButton,
                                internalSelectedFilter?.TITULO === filter.TITULO && styles.selectedFilterButton,
                            ]}
                            onPress={() => {
                                setInternalSelectedFilter(filter); // Atualiza o estado interno
                                onSelectFilter?.(filter); // Chama o callback
                            }}
                        >
                            {
                                filter.AVATAR ?
                                    <Image source={{ uri: filter.AVATAR }} style={styles.avatar} /> :
                                    <ThemedText style={styles.filterText}>{filter.NOME.charAt(0)}</ThemedText>
                            }
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Campo de busca */}
            {searchable && <InputComponent
                onChangeText={(text) => { 
                    // Implementar lógica de busca se necessário
                    setSearchTerm(text);
                }}
                placeholder='Buscar'
                leftComponent={<IconSymbol name='search' size={20} color={textLabelColor} library='fontawesome' />}
            />}

            {/* Abas */}
            {tabs.length > 0 && (
                <ThemedView style={styles.tabContainer}>
                    {tabs.map((tab, index) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tabButton,
                                selectedTab === tab && styles.selectedTabButton,
                            ]}
                            onPress={() => {
                                setSelectedTab(tab);
                                onChangeTab?.(index);
                            }}
                        >
                            <ThemedText style={styles.tabText}>{tab}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </ThemedView>
            )}

            {/* Lista de itens */}
            {data.length > 0 ? (
                <FlatList
                    data={Object.values(groupByCategory(data))}
                    renderItem={({ item }) => renderCategory(item[0])}
                    keyExtractor={(item) => item[0].category}
                    scrollEnabled={false} 
                />
            ) : (
                <ThemedText style={styles.subtitleText}>{emptyText}</ThemedText>
            )}
        </ThemedView>
    );
};

export default DynamicList;