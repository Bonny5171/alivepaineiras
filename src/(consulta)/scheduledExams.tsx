import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { listarExames } from '@/api/app/appointments';
import DynamicList, { ListItem } from '@/components/DynamicList';
import { examesToItems } from '@/api/app/appTransformer';
import { Wrapper } from '@/components/Wrapper';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/Header';
import { AssociadosList } from '@/components/AssociadosList';
import { getAuthContext } from '@/providers/AuthProvider';
import { useError } from '@/providers/ErrorProvider';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ScheduledExams() {
    const [exames, setExames] = useState<ListItem[]>([]);
    const [historico, setHistorico] = useState<ListItem[]>([]);
    const [exameRaw, setExameRaw] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [tab, setTab] = useState<'ativos' | 'historico'>('ativos');
    const [selectedTitulo, setSelectedTitulo] = useState<string>('');
    const [emptyMessage, setEmptyMessage] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const { setError } = useError();
    const navigation = useNavigation();
    const tabText = useThemeColor({}, 'tabText');

    // Atualizar selectedTitulo ao selecionar associado
    const handleSelectAssociado = (titulo: string) => {
        console.log('Associado selecionado:', titulo);
        setIsLoading(true);
        setSelectedTitulo(titulo);
        setSearch('');
    };

    // Buscar exames ao iniciar e ao trocar associado
    useEffect(() => {
        const fetchExames = async () => {
            setIsLoading(true);
            try {
                const context = getAuthContext();
                let titulo = selectedTitulo || '0';
                if (titulo === 'todos') titulo = '0';
                const examesRaw = await listarExames(titulo);
                setExameRaw(examesRaw);
                if (examesRaw.length > 0 && examesRaw[0].ERRO) {
                    const msg = examesRaw[0].MSG_ERRO || 'Nenhum exame encontrado.';
                    setExames([]);
                    setHistorico([]);
                    setEmptyMessage(msg);
                } else {
                    // Separar exames válidos e históricos usando tags[0].title
                    const items = examesToItems(examesRaw);
                    const ativos = items.filter(item => item.tags && item.tags[0]?.title === 'Válido');
                    const historicoItems = items.filter(item => !item.tags || item.tags[0]?.title !== 'Válido');
                    setExames(ativos);
                    setHistorico(historicoItems);
                    setEmptyMessage('Nenhum exame encontrado.');
                }
            } catch (error) {
                setExames([]);
                setHistorico([]);
                setEmptyMessage('Erro ao buscar exames');
                console.error('Erro ao buscar exames:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchExames();
    }, [selectedTitulo]);

    // Filtrar exames ou histórico com base no search e na aba ativa
    const filteredData = (tab === 'ativos' ? exames : historico).filter(item =>
        (item.title?.toLowerCase()?.includes(search.toLowerCase()) || '') ||
        (item.subtitle?.toLowerCase()?.includes(search.toLowerCase()) || '')
    );

    // Função para alternar abas com log para debug
    const handleTabPress = (newTab: 'ativos' | 'historico') => {
        setTab(newTab);
    };

    return (
        <>
            <Header title='Exames' />
            <Wrapper style={{ padding: 16 }}>
                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <Pressable
                        style={[styles.tab, tab === 'ativos' && styles.tabActive]}
                        onPress={() => handleTabPress('ativos')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, { color: tabText }, tab === 'ativos' && styles.tabTextActive]}>
                            Ativos
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.tab, tab === 'historico' && styles.tabActive]}
                        onPress={() => handleTabPress('historico')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, { color: tabText }, tab === 'historico' && styles.tabTextActive]}>
                            Histórico
                        </Text>
                    </Pressable>
                </View>
                {/* Associados */}
                <AssociadosList
                    onSelect={handleSelectAssociado}
                    selectedAssociado={selectedTitulo || 'todos'}
                />
                <View style={isLoading ? { flex: 1 } : {}}>
                    {isLoading ? (
                        <ActivityIndicator size="large" />
                    ) : tab === 'ativos' ? (
                        exames.length === 0 ? (
                            <Text style={{ textAlign: 'center', marginTop: 32, color: '#888' }}>{emptyMessage}</Text>
                        ) : (
                            <DynamicList
                                searchable
                                rightImageEnable
                                data={exames}
                                onClickPrimaryButton={(id) => {
                                    //@ts-ignore
                                    const it = exameRaw.find(item => item.ID == id.id)
                                    console.log('Exame selecionado:', it);
                                    //@ts-ignore
                                    navigation.navigate('(consulta)/examsHistory', { TITULO: it?.TITULO });
                                }}
                            />
                        )
                    ) : historico.length === 0 ? (
                        <Text style={{ textAlign: 'center', marginTop: 32, color: '#888' }}>{emptyMessage}</Text>
                    ) : (
                        <DynamicList
                            searchable
                            rightImageEnable
                            data={historico}
                            onClickPrimaryButton={(id) => {
                                const it = exameRaw.find(item => item.ID == id.id);
                                console.log('Exame selecionado:', it);
                                navigation.navigate('(consulta)/examsHistory', { TITULO: it?.TITULO });
                            }}
                        />
                    )}
                </View>
            </Wrapper>
        </>
    );
}

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: '#0F1C471A',
        overflow: 'hidden',
    },
    tab: {
        flex: 1,
        paddingVertical: 11,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    tabActive: {
        backgroundColor: '#0F1C47',
    },
    tabText: {
        color: '#4A5568',
        fontWeight: 'bold',
        fontSize: 15,
    },
    tabTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
});