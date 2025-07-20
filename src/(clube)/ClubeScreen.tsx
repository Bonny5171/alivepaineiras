import Header from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Wrapper } from '@/components/Wrapper';
import React, { useEffect, useState } from 'react';
import { listarGrupos, listarLocais, GrupoItem, LocalItem } from '@/api/app/clube';
import { View, Text, StyleSheet, Image, TextInput, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import DynamicList, { ListItem } from '@/components/DynamicList';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ClubeScreen({ navigation }: any) {
    const [grupos, setGrupos] = useState<GrupoItem[]>([]);
    const [capa, setCapa] = useState<string | null>(null); // Nova state para imagem de capa
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [allLocais, setAllLocais] = useState<LocalItem[]>([]);
    const [filteredLocais, setFilteredLocais] = useState<ListItem[]>([]);
    const [locaisLoaded, setLocaisLoaded] = useState(false);
    const text = useThemeColor({}, 'text');
    const text2 = useThemeColor({}, 'text2');
    const background2 = useThemeColor({}, 'background2');

    useEffect(() => {
        const fetchGrupos = async () => {
            setLoading(true);
            try {
                const res = await listarGrupos();
                if (res && res[0]?.GRUPOS) {

                    const sortedGrupos = res[0].GRUPOS.sort((a, b) => 
                        a.NOME.localeCompare(b.NOME)
                    );

                    setGrupos(sortedGrupos);
                    setCapa(res[0]?.IMAGEM || null); // Salva a imagem de capa
                }
            } catch (e) {
                // Trate o erro conforme necessário
            } finally {
                setLoading(false);
            }
        };
        fetchGrupos();
    }, []);

    // Busca todos os locais de todos os grupos apenas uma vez, após carregar grupos
    useEffect(() => {
        const fetchAllLocais = async () => {
            if (grupos.length === 0 || locaisLoaded) return;
            // Removido setLoading(true) aqui para evitar piscada
            try {
                // Busca todos os locais de uma vez só, passando 0
                const locais: LocalItem[] = await listarLocais(0);
                setAllLocais(locais);
                setLocaisLoaded(true);
            } catch (e) {
                // Trate o erro conforme necessário
            } finally {
                // Removido setLoading(false) aqui para evitar piscada
            }
        };
        fetchAllLocais();
    }, [grupos, locaisLoaded]);

    // Filtra locais conforme busca
    useEffect(() => {
        if (search.length === 0) {
            setFilteredLocais([]);
            return;
        }
        const filtered = allLocais.filter(local =>
            local.NOME.toLowerCase().includes(search.toLowerCase())
            //local.DESCRICAO.toLowerCase().includes(search.toLowerCase())
        ).map(local => ({
            id: String(local.IDLOCAL),
            title: local.NOME,
            subtitle: local.LOCALIZACAO,
            icon: local.ICONE || 'clock',
            iconLibrary: 'fontawesome', // Garante tipo correto
            category: 'local',
        }));
        setFilteredLocais(filtered as ListItem[]);
    }, [search, allLocais]);

    const handleGrupoPress = async (grupo: GrupoItem) => {
        setLoading(true);
        try {
            const locais: LocalItem[] = await listarLocais(grupo.IDGRUPO);
            // Navegue para a tela de detalhes, passando os locais e o grupo
            navigation.navigate('clubeList', { grupo, locais });
        } catch (e) {
            // Trate o erro conforme necessário
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header title='Clube' bigTitle />
            <Wrapper style={styles.container} isLoading={loading}>
                <Image
                    source={{ uri: capa  }}
                    style={styles.image}
                    resizeMode="cover"
                />
                <View style={[styles.searchContainer, { backgroundColor: background2 }]}>
                    <IconSymbol name='search' size={20} color={'#A0A0A0'} library='fontawesome' style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.search}
                        placeholder="Buscar"
                        placeholderTextColor="#A0A0A0"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                {search.length === 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { color: text }]}>ESTRUTURA DO CLUBE</Text>
                        <FlatList
                            data={grupos}
                            numColumns={3}
                            keyExtractor={item => String(item.IDGRUPO)}
                            contentContainerStyle={styles.grid}
                            scrollEnabled={false}
                            renderItem={({ item }) => {
                                const isLongText = item.NOME.length >= 13; // ajuste o número conforme necessário
                                return (
                                    <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={() => handleGrupoPress(item)}>
                                        <IconSymbol color={'#D03481'} name={item.ICONE || 'question'} size={28} library='fontawesome' />
                                        <Text style={[styles.buttonText, { color: text2 }, isLongText && { fontSize: styles.buttonText.fontSize - 3 }]}>{item.NOME}</Text>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </>
                )}
                {search.length > 0 && (
                    <DynamicList 
                        data={filteredLocais} 
                        onClickPrimaryButton={(item) => {
                            // Busca o local completo pelo id
                            const local = allLocais.find(l => String(l.IDLOCAL) === String(item.id));
                            if (local) {
                                navigation.navigate('clubeDetails', { local });
                            }
                        }} 
                    />
                )}
            </Wrapper>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    image: {
        width: '100%',
        height: 160,
        borderRadius: 20,
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 12,
    },
    search: {
        flex: 1,
        paddingHorizontal: 8,
        paddingVertical: 10,
        fontSize: 16,
        borderWidth: 0,
        backgroundColor: 'transparent',
    },
    sectionTitle: {
        color: '#0F1C47CC',
        fontWeight: '400',
        fontSize: 13,
        textTransform: 'uppercase',
        marginBottom: 12,
        marginLeft: 4,
    },
    grid: {
        paddingBottom: 32,
    },
    button: {
        backgroundColor: 'rgba(208,52,129,0.1)', // #D034811A
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        margin: 6,
        minHeight: 90,
        maxWidth: '31%',
        paddingVertical: 12,
    },
    icon: {
        fontSize: 28,
        color: '#D03481',
        marginBottom: 6,
    },
    buttonText: {
        marginTop: 15,
        fontWeight: '600',
        fontSize: 14,
        textAlign: 'center',
    },
});
