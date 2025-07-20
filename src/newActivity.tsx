import { extractFiltersFromAssociadoResponse, newActivityToList, Schedule, schedulesToItems, unicodeToChar } from '@/api/app/appTransformer';
import { Filter } from '@/api/app/appTypes';
import { AtividadeFiltroResponseItem, listarAtividadesFiltro, listarDependentes, listarHorarios, matricular } from '@/api/app/atividades';
import DynamicList, { ListItem } from '@/components/DynamicList';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Wrapper } from '@/components/Wrapper';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/providers';
import { useConfirmation } from '@/providers/ConfirmProvider';
import { useError } from '@/providers/ErrorProvider';
import { useNavigation } from '@react-navigation/native';

import React, { useEffect, useState } from 'react';
import { BackHandler, Image, StyleSheet } from 'react-native';

export default function TabTwoScreen() {
    const AuthContext = useAuth();
    const [filters, setFilters] = useState<Filter[]>([]);
    const [listData, setListData] = useState<ListItem[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<Filter | null>(null);
    const [step, setStep] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [isButtonloading, setIsButtonloading] = useState<boolean>(false);
    const [tab, setTab] = useState<number>(0);
    const tabs = ['Esportes', 'Cultural'];
    const navigation = useNavigation();

    const [originalActivities, setOriginalActivities] = useState<AtividadeFiltroResponseItem[]>([]);

    // Estado para armazenar as atividades separadas por área
    const [culturalActivities, setCulturalActivities] = useState<ListItem[]>([]);
    const [esportesActivities, setEsportesActivities] = useState<ListItem[]>([]);

    //step 2 state
    const [selectedActivity, setSelectedActivity] = useState<AtividadeFiltroResponseItem | null>(null);

    //step 3 state
    const [originalSchedule, setOriginalSchedule] = useState<Schedule[]>([]);
    const [schedule, setSchedule] = useState<Schedule | null>(null);
    const confirm = useConfirmation();
    const { setError } = useError();

    const onChangeTab = (tabIndex: number) => {
        console.log('Tab selecionada:', tabs[tabIndex]);
        setTab(tabIndex);

        // Atualiza o listData com base na tab selecionada
        if (tabIndex === 0) {
            setListData(esportesActivities); // Esportes (IDAREA 1)
        } else if (tabIndex === 1) {
            setListData(culturalActivities); // Cultural (IDAREA 0)
        }
    };

    const fetchData = async (filterTitulo: string) => {
        setLoading(true);
        if (step == 0) {
            // Listar novas atividades para o usuário com o filtro selecionado
            const response = await listarAtividadesFiltro({ TITULO: filterTitulo });

            setOriginalActivities(response);

            // Separar as atividades por IDAREA
            const cultural = response.filter(activity => activity.IDAREA === 2);
            const esportes = response.filter(activity => activity.IDAREA === 1);

            // Transformar as atividades em ListItem
            const culturalList = newActivityToList(cultural);
            const esportesList = newActivityToList(esportes);

            // Salvar as listas separadas no estado
            setCulturalActivities(culturalList);
            setEsportesActivities(esportesList);

            // Definir a lista inicial com base na tab atual
            if (tab === 0) {
                setListData(esportesList); // Esportes (IDAREA 1)
            } else if (tab === 1) {
                setListData(culturalList); // Cultural (IDAREA 0)
            }
        } else if (step == 1) {
            if (!selectedFilter || !selectedActivity) {
                console.error('Filtro ou atividade não selecionados');
                return;
            }
            const response = await listarHorarios({ IDATIVIDADE: selectedActivity?.IDENTIFICADOR, TITULO: selectedFilter?.TITULO });
            setOriginalSchedule(response);
            setListData(schedulesToItems(response));
        } else if (step == 2) {
            // Outra lógica para step 2
        }
        setLoading(false);
    };

    const fetchFilters = async () => {
        setLoading(true);
        try {
            const filtersResponse = await listarDependentes({ TITULO: AuthContext.user });
            const extractedFilters = extractFiltersFromAssociadoResponse(filtersResponse);
            setFilters(extractedFilters);
            setSelectedFilter(extractedFilters.filter(filter => filter.TITULO === AuthContext.user)[0]);
        } catch (error) {
            console.error('Erro ao buscar filtros:', error);
        }
    };

    useEffect(() => {
        if (step === 0) {
            if (selectedFilter) {
                fetchData(selectedFilter.TITULO);
            }
        }
    }, [selectedFilter]);

    useEffect(() => {
        if (step === 0) {
            fetchFilters();
        }
        if (step === 1) {
            if (selectedFilter) {
                fetchData(selectedFilter.TITULO);
            }
        }
        if (step === 2) {
            if (selectedFilter) {
                fetchData(selectedFilter.TITULO);
            }
        }
    }, [step]);


    //Logica passo 2 Horarios

    const onSelectAcitivity = (activity: any) => {
        console.log('Atividade selecionada:', originalActivities.filter(item => item.IDENTIFICADOR.toString() === activity.id));
        setSelectedActivity(originalActivities.filter(item => item.IDENTIFICADOR.toString() === activity.id)[0]);
        setStep(1);
    }

    //Logica passo 3 Detalhes e matricula
    const onSelectSchedule = (schedule: any) => {
        setSchedule(originalSchedule.filter(item => item.TURMA === schedule.id)[0]);
        setStep(2);
    }

    //Matricula
    const subscribe = async () => {
        setIsButtonloading(true)
        if (selectedActivity && schedule && selectedFilter) {
            matricular({ IDATIVIDADE: selectedActivity.IDENTIFICADOR, IDTURMA: schedule.TURMA, TITULO: selectedFilter.TITULO }).then(()=>{
                navigation.goBack();
                setError('Matrícula efetuada com sucesso!', 'success');
            }).finally(()=>{
                setIsButtonloading(false)
            })
        }
    }

    const handleSubscribe = () => {
        confirm.showConfirmation("Confirmar", subscribe)
    }


    // Função para lidar com o evento de "voltar"
    const handleBackButton = () => {
        if (step > 0) {
            setStep(prevStep => prevStep - 1);
            return true; // Indica que o evento foi tratado
        }
        return false; // Permite o comportamento padrão de voltar
    };

    // Adiciona o listener para o evento de "voltar"
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleBackButton);

        // Remove o listener quando o componente é desmontado
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
        };
    }, [step]);

    const activeBackground = useThemeColor({}, 'activeBackground');

    const styles = StyleSheet.create({
        container: {
            alignItems: 'center',
            padding: 16,
        },
        avatar: {
            width: 55,
            height: 55,
            borderRadius: 30,
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 8,
        },
        associated: {
            fontSize: 18,
            marginBottom: 16,
        },
        infoContainer: {
            width: '100%',
            backgroundColor: activeBackground,
            padding: 16,
            borderRadius: 16,
        },
        infoRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
            backgroundColor: activeBackground,
        },
        infoLabel: {
            fontSize: 14,
            lineHeight: 20,
            fontWeight: 'bold',
            backgroundColor: activeBackground,
        },
        infoValue: {
            fontSize: 14,
            lineHeight: 20,
            backgroundColor: activeBackground,
        },
        iconContainer: {
            backgroundColor: activeBackground,
            width: 90,
            height: 90,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 50,
            marginBottom: 20,
        },
        iconText: {
            fontSize: 30,
            lineHeight: 50,
            textAlign: 'center',
            textAlignVertical: 'center',
        },
        associatedContainer: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            marginBottom: 16,
            gap: 8,
        },
    });

    return (
        <Wrapper
            isLoading={loading}
            primaryButtonLabel='Confirmar Matrícula'
            onPrimaryPress={(step == 2 && schedule?.MATRICULAR) ? handleSubscribe : undefined}
            isButtonLoading={isButtonloading}
        >
            {step === 0 &&
                <DynamicList
                    tabs={tabs}
                    data={listData}
                    filters={filters}
                    onSelectFilter={(filter) => setSelectedFilter(filter)}
                    onChangeTab={onChangeTab}
                    selectedFilter={selectedFilter}
                    onClickPrimaryButton={onSelectAcitivity}
                />
            }
            {step === 1 &&
                <>
                    <DynamicList
                        data={listData}
                        onClickPrimaryButton={onSelectSchedule}
                    />
                </>
            }
            {step === 2 &&
                <ThemedView style={styles.container}>
                    <ThemedView style={styles.iconContainer}>
                        <ThemedText style={styles.iconText}>{unicodeToChar(selectedActivity?.ICONE || '')}</ThemedText>
                    </ThemedView>
                    <ThemedText style={styles.title}>{schedule?.ATIVIDADE}</ThemedText>
                    <ThemedView style={styles.associatedContainer}>
                        <ThemedText style={styles.associated}>Associado selecionado: </ThemedText>
                        <Image source={{ uri: selectedFilter?.AVATAR }} style={styles.avatar} />
                    </ThemedView>
                    <ThemedView style={styles.infoContainer}>
                        <ThemedView style={styles.infoRow}>
                            <ThemedText style={styles.infoLabel}>Dia(s):</ThemedText>
                            <ThemedText style={styles.infoValue}>{schedule?.DIAS}</ThemedText>
                        </ThemedView>
                        <ThemedView style={styles.infoRow}>
                            <ThemedText style={styles.infoLabel}>Horário:</ThemedText>
                            <ThemedText style={styles.infoValue}>{schedule?.HRINICIO + " - " + schedule?.HRTERMINO}</ThemedText>
                        </ThemedView>
                        <ThemedView style={styles.infoRow}>
                            <ThemedText style={styles.infoLabel}>Local:</ThemedText>
                            <ThemedText style={styles.infoValue}>{schedule?.LOCAL}</ThemedText>
                        </ThemedView>
                        <ThemedView style={styles.infoRow}>
                            <ThemedText style={styles.infoLabel}>Professor:</ThemedText>
                            <ThemedText style={styles.infoValue}>{schedule?.PROFESSOR}</ThemedText>
                        </ThemedView>
                        <ThemedView style={styles.infoRow}>
                            <ThemedText style={styles.infoLabel}>Custo Mensal:</ThemedText>
                            <ThemedText style={styles.infoValue}>R$ {schedule?.VALOR_MENSAL}</ThemedText>
                        </ThemedView>
                        <ThemedView style={styles.infoRow}>
                            <ThemedText style={styles.infoLabel}>Tipo de Cobrança:</ThemedText>
                            <ThemedText style={styles.infoValue}>{schedule?.TIPO_COBRANCA}</ThemedText>
                        </ThemedView>
                    </ThemedView>
                </ThemedView>
            }
        </Wrapper>
    );
}