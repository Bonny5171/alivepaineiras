import { Atividade, convertToListItem, extractFiltersFromAssociadoResponse } from '@/api/app/appTransformer';
import { Filter } from '@/api/app/appTypes';
import { listarAssociados, listarEspera, listarProgramacao, listarDependentes } from '@/api/app/atividades';
import DynamicList, { ListItem } from '@/components/DynamicList';
import { Wrapper } from '@/components/Wrapper';
import { useAuth } from '@/providers';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';

export default function TabTwoScreen() {
  const AuthContext = useAuth();
  const [filters, setFilters] = useState<Filter[]>([]);
  const [listData, setListData] = useState<ListItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<Filter | null>(null);
  const [originalData, setOriginalData] = useState<Atividade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'Ativas' | 'Em espera' | 'Canceladas'>('Ativas');
  const navigation = useNavigation();

  const fetchFilters = async () => {
    setIsLoading(true);
    try {
      const filtersResponse = await listarDependentes({ TITULO: AuthContext.user });
      const extractedFilters = extractFiltersFromAssociadoResponse(filtersResponse);
      setFilters(extractedFilters);

      // Definir o filtro padrão como o de AuthContext.user
      const defaultFilter = extractedFilters.find(filter => filter.TITULO === AuthContext.user) || null;
      setSelectedFilter(defaultFilter);
    } catch (error) {
      console.error('Erro ao buscar filtros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async (tab: 'Ativas' | 'Em espera' | 'Canceladas') => {
    setIsLoading(true);
    try {
      let response;
      switch (tab) {
        case 'Ativas':
          response = await listarAssociados({ TITULO: parseInt(selectedFilter?.TITULO || "0") });
          break;
        case 'Em espera':
          response = await listarEspera({ TITULO: parseInt(selectedFilter?.TITULO || "0") });
          break;
        case 'Canceladas':
          response = await listarProgramacao({ TITULO: parseInt(selectedFilter?.TITULO || "0") });
          break;
        default:
          response = await listarAssociados({ TITULO: 0 });
      }

      const atividades: Atividade[] = response.map((item: any) => ({
        ...item,
        DATA: item.DATA || '',
        DEPARTAMENTO: item.DEPARTAMENTO || '',
        DIAS: item.DIAS || '',
        HORARIO: item.HORARIO || '',
      }));

      if (atividades[0].ERRO) {
        console.log('Nenhum dado encontrado', atividades);
        setListData([]);
        return;
      }

      setOriginalData(atividades);
      const convertedListData = convertToListItem(atividades);
      setListData(convertedListData);

      // Aplicar o filtro selecionado após buscar os dados
      if (selectedFilter) {
        const filteredData = atividades.filter((item) => item.TITULO === selectedFilter.TITULO);
        const convertedFilteredData = convertToListItem(filteredData);
        setListData(convertedFilteredData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []); // Executa apenas uma vez, na montagem do componente

  useEffect(() => {
    fetchData(selectedTab);
  }, [selectedTab, selectedFilter]); // Executa quando selectedTab ou selectedFilter mudam

  const filterByTitle = (filter: Filter | null) => {
    if (!filter) {
      setListData(convertToListItem(originalData));
      return;
    }

    const filteredData = originalData.filter((item) => item.TITULO === filter.TITULO);
    const convertedFilteredData = convertToListItem(filteredData);
    setListData(convertedFilteredData);
  };

  const handleSelectFilter = (filter: Filter) => {
    setSelectedFilter(filter);
    filterByTitle(filter);
    console.log('Filtro selecionado:', filter);
  };

  const handleRefresh = () => {
    fetchData(selectedTab);
  };

  const handlePress = (item: ListItem) => {
    navigation.navigate('ActivityDetails', {
      atividade: JSON.stringify(originalData.find(atividade => atividade.IDATIVIDADE === parseInt(item.id)))
    });
  };

  const handleNewActivity = () => {
    navigation.navigate('ActivitySelectionScreen');
    // Or if it's in a nested group:
    // navigation.navigate('(newActivity)/ActivitySelectionScreen');
  };

  const handleChangeTab = (tab: 'Ativas' | 'Em espera' | 'Canceladas') => {
    setSelectedTab(tab);
    console.log('Tab selecionada:', tab);
  };

  return (
    <Wrapper
      primaryButtonLabel='Nova Atividade'
      onPrimaryPress={handleNewActivity}
      isLoading={isLoading}
      onRefresh={handleRefresh}
    >
      <DynamicList
        filters={filters}
        tabs={['Ativas', 'Em espera', 'Canceladas']}
        data={listData}
        selectedTabProp={selectedTab}
        onChangeTab={(tabIndex: number) => handleChangeTab(['Ativas', 'Em espera', 'Canceladas'][tabIndex] as 'Ativas' | 'Em espera' | 'Canceladas')}
        onSelectFilter={handleSelectFilter}
        onClickPrimaryButton={handlePress}
        selectedFilter={selectedFilter}
      />
    </Wrapper>
  );
}