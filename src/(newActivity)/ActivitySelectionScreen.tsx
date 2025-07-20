import React, { useEffect, useState } from 'react';
import { useAuth } from '@/providers';
import { listarAtividadesFiltro, listarDependentes } from '@/api/app/atividades';
import { extractFiltersFromAssociadoResponse, newActivityToList } from '@/api/app/appTransformer';
import DynamicList, { ListItem } from '@/components/DynamicList';
import { Wrapper } from '@/components/Wrapper';
import { Filter } from '@/api/app/appTypes';
import { AtividadeFiltroResponseItem } from '@/api/app/atividades';
import { useNavigation } from '@react-navigation/native';

export default function ActivitySelectionScreen() {
    const navigation = useNavigation();
    const AuthContext = useAuth();
    const [filters, setFilters] = useState<Filter[]>([]);
    const [listData, setListData] = useState<ListItem[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<Filter | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [tab, setTab] = useState<number>(0);
    const tabs = ['Esportes', 'Cultural'];

    const [originalActivities, setOriginalActivities] = useState<AtividadeFiltroResponseItem[]>([]);

    const fetchData = async (filterTitulo: string) => {
        setLoading(true);
        const response = await listarAtividadesFiltro({ TITULO: filterTitulo });
        setOriginalActivities(response);
        const cultural = response.filter(activity => activity.IDAREA === 2);
        const esportes = response.filter(activity => activity.IDAREA === 1);
        const culturalList = newActivityToList(cultural);
        const esportesList = newActivityToList(esportes);
        setListData(tab === 0 ? esportesList : culturalList);
        setLoading(false);
    };

    const fetchFilters = async () => {
        setLoading(true);
        try {
            const filtersResponse = await listarDependentes({ TITULO: AuthContext.user });
            const extractedFilters = extractFiltersFromAssociadoResponse(filtersResponse);
            setFilters(extractedFilters);
            setSelectedFilter(extractedFilters.find(filter => filter.TITULO === AuthContext.user) || null);
        } catch (error) {
            console.error('Erro ao buscar filtros:', error);
        }
    };

    useEffect(() => {
        fetchFilters();
    }, []);

    useEffect(() => {
        if (selectedFilter) {
            fetchData(selectedFilter.TITULO);
        }
    }, [selectedFilter, tab]);

    const handleSelectActivity = (activity: ListItem) => {
        if (selectedFilter) {
            navigation.navigate('(newActivity)/ScheduleSelectionScreen', {
                activity: JSON.stringify(originalActivities.find((item) => item.IDENTIFICADOR.toString() == activity.id)),
                filter: JSON.stringify(selectedFilter),
            });
        }
    };

    return (
        <Wrapper isLoading={loading}>
            <DynamicList
                tabs={tabs}
                data={listData}
                filters={filters}
                onSelectFilter={setSelectedFilter}
                onChangeTab={setTab}
                selectedFilter={selectedFilter}
                onClickPrimaryButton={(item) => {
                    const selected = listData.find(activity => activity.id === item.id);
                    if (selected) {
                        handleSelectActivity(selected);
                    }
                }}
            />
        </Wrapper>
    );
}