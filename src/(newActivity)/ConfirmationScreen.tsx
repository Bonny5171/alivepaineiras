import React, { useEffect, useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Wrapper } from '@/components/Wrapper';
import { useThemeColor } from '@/hooks/useThemeColor';
import { AtividadeFiltroResponseItem, listarDependentes, matricular } from '@/api/app/atividades';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useConfirmation } from '@/providers/ConfirmProvider';
import { useError } from '@/providers/ErrorProvider';
import { ThemedView } from '@/components/ThemedView';
import { extractFiltersFromAssociadoResponse, Schedule, unicodeToChar } from '@/api/app/appTransformer';
import { useAuth } from '@/providers';
import { Filter } from '@/api/app/appTypes';

export default function ConfirmationScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { activity, filter, schedule } = route.params;
    const selectedActivity = JSON.parse(activity as string) as AtividadeFiltroResponseItem;
    const selectedFilter = JSON.parse(filter as string);
    const selectedSchedule = JSON.parse(schedule as string) as Schedule;
    const [filters, setFilters] = useState<Filter[]>([]);

    const AuthContext = useAuth();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const activeBackground = useThemeColor({}, 'activeBackground');
    const confirm = useConfirmation();
    const { setError } = useError();

    useEffect(() => {
        const fetchFilters = async () => {
            const filtersResponse = await listarDependentes({ TITULO: AuthContext.user });
            const extractedFilters = extractFiltersFromAssociadoResponse(filtersResponse);
            setFilters(extractedFilters);
        };
        fetchFilters();
    }, []);

    const handleSubscribe = () => {
        confirm.showConfirmation("Confirmar", subscribe);
    };

    const subscribe = async () => {
        if (selectedActivity && selectedSchedule && selectedFilter) {
            setIsLoading(true);
            matricular({
                IDATIVIDADE: selectedActivity.IDENTIFICADOR,
                IDTURMA: selectedSchedule.TURMA,
                TITULO: parseInt(selectedFilter.TITULO),
            }).then(() => {
                navigation.navigate('(tabs)');
                setError('Matrícula efetuada com sucesso!', 'success');
            }).finally(() => {
                setIsLoading(false);
            });
        }
    };

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
        <Wrapper primaryButtonLabel='Confirmar Matrícula' onPrimaryPress={handleSubscribe} isLoading={isLoading}>
            <ThemedView style={styles.container}>
                <ThemedView style={styles.iconContainer}>
                    <ThemedText style={styles.iconText}>{unicodeToChar(selectedActivity?.ICONE)}</ThemedText>
                </ThemedView>
                <ThemedText style={styles.title}>{selectedSchedule?.ATIVIDADE}</ThemedText>
                <ThemedView style={styles.associatedContainer}>
                    <ThemedText style={styles.associated}>Associado selecionado: </ThemedText>
                    <Image source={{ uri: filters.find((filter) => filter.TITULO == selectedFilter?.TITULO)?.AVATAR }} style={styles.avatar} />
                </ThemedView>
                <ThemedView style={styles.infoContainer}>
                    <ThemedView style={styles.infoRow}>
                        <ThemedText style={styles.infoLabel}>Dia(s):</ThemedText>
                        <ThemedText style={styles.infoValue}>{selectedSchedule?.DIAS}</ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.infoRow}>
                        <ThemedText style={styles.infoLabel}>Horário:</ThemedText>
                        <ThemedText style={styles.infoValue}>{selectedSchedule?.HRINICIO + " - " + selectedSchedule?.HRTERMINO}</ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.infoRow}>
                        <ThemedText style={styles.infoLabel}>Local:</ThemedText>
                        <ThemedText style={styles.infoValue}>{selectedSchedule?.LOCAL}</ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.infoRow}>
                        <ThemedText style={styles.infoLabel}>Professor:</ThemedText>
                        <ThemedText style={styles.infoValue}>{selectedSchedule?.PROFESSOR}</ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.infoRow}>
                        <ThemedText style={styles.infoLabel}>Custo Mensal:</ThemedText>
                        <ThemedText style={styles.infoValue}>R$ {selectedSchedule?.VALOR_MENSAL}</ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.infoRow}>
                        <ThemedText style={styles.infoLabel}>Tipo de Cobrança:</ThemedText>
                        <ThemedText style={styles.infoValue}>{selectedSchedule?.TIPO_COBRANCA}</ThemedText>
                    </ThemedView>
                </ThemedView>
            </ThemedView>
        </Wrapper>
    );
}