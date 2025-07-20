import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, ActivityIndicator } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Header from '@/components/Header';
import FooterTabBar from '@/components/FooterTabBar';
import AssociatesList from '@/components/AssociatesList';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  listarDependentes,
  listarAssociadosMatriculas,
  AtividadeMatriculaItem,
} from '@/api/app/atividades';
import { listarServicos, ServicoItem } from '@/api/app/appointments';
import { useAuth } from '@/providers';
import { extractFiltersFromAssociadoResponse } from '@/api/app/appTransformer';
import { Filter } from '@/api/app/appTypes';
import { SectionTitle } from '@/components/SectionTitle';
import { useError } from '@/providers/ErrorProvider';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SCREEN_WIDTH } from '@/constants/Sizes';
import AssociateAvatar from '@/components/AssociateAvatar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { listarConsultasCanceladas } from '@/api/app/appointments';

export default function Inscricoes() {
  // IDs de grupos e serviços conforme tabela fornecida
  const gruposServicos = {
    esportes: {
      grupo: 300,
      servicos: [301, 302, 303, 304, 305, 10301, 10302, 10303, 10304, 10305],
    },
    cultural: {
      grupo: 10300,
      servicos: [303, 10301, 10302, 10303, 10304, 10305],
    },
  };

  // Estados para controle de permissão de matrícula
  const [canShowNewRegistration, setCanShowNewRegistration] = useState<boolean>(false);
  // Buscar serviços permitidos para decidir se mostra o botão Nova matrícula
  useEffect(() => {
    listarServicos().then((servicos: ServicoItem[]) => {
      const grupos = new Set<number>();
      const servicosIds = new Set<number>();
      servicos.forEach(s => {
        if (s.IDGRUPO) grupos.add(Number(s.IDGRUPO));
        if (s.IDSERVICO) servicosIds.add(Number(s.IDSERVICO));
      });
      // Verifica se há pelo menos um serviço de esportes OU cultural permitido
      const hasEsportes = grupos.has(gruposServicos.esportes.grupo) && gruposServicos.esportes.servicos.some(sid => servicosIds.has(sid));
      const hasCultural = grupos.has(gruposServicos.cultural.grupo) && gruposServicos.cultural.servicos.some(sid => servicosIds.has(sid));
      setCanShowNewRegistration(hasEsportes || hasCultural);
    });
  }, []);
  const { setError } = useError();
  const AuthContext = useAuth();
  const navigate = useNavigation();
  const brand = useThemeColor({}, 'brand');
  const lightPinkColor = useThemeColor({}, 'lightPink');
  const background = useThemeColor({}, 'background');
  const background1 = useThemeColor({}, 'background1');
  const background2 = useThemeColor({}, 'background2');
  const textColor = useThemeColor({}, 'text');
  const text2Color = useThemeColor({}, 'text2');
  const colorScheme = useColorScheme();

  // Estados de loading
  const [isLoadingAssociated, setIsLoadingAssociated] = useState(true);
  const [isLoadingActivitiesEnrolled, setIsLoadingActivitiesEnrolled] = useState(false);
  const [associated, setAssociated] = useState<Filter[]>([]);
  const [selectedAssociated, setSelectedAssociated] = useState<Filter | null>({ NOME: '', TITULO: AuthContext.user});
  const [activitiesEnrolled, setActivitiesEnrolled] = useState<AtividadeMatriculaItem[]>([]);

  // Cache para armazenar todos os dados da API
  const [allActivitiesCache, setAllActivitiesCache] = useState<AtividadeMatriculaItem[]>([]);
  const [lastFetchedAssociated, setLastFetchedAssociated] = useState<Filter | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('TUDO');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Refs para controlar requisições
  const currentRequestRef = useRef<AbortController | null>(null);
  const isProcessingRef = useRef(false);

  const idAreaMap: { [key: string]: number } = {
    TUDO: 0,
    ESPORTES: 1,
    CULTURAL: 2,
    SAUDE: 3,
    AGENDAMENTO: 4,
  };

  const fetchAssociates = useCallback(async () => {
    if (isProcessingRef.current) return;

    setIsLoadingAssociated(true);
    isProcessingRef.current = true;

    try {
      const filtersResponse = await listarDependentes({ TITULO: AuthContext.user });
      const extractedFilters = extractFiltersFromAssociadoResponse(filtersResponse);

      const todosOption: Filter = { NOME: 'Todos', TITULO: '0' };

      const finalList = [
        todosOption,
        ...extractedFilters.filter(f => f.TITULO === AuthContext.user),
        ...extractedFilters.filter(f => f.TITULO !== AuthContext.user),
      ];

      setAssociated(finalList);
    } catch (error) {
      setError(
        'Falha ao carregar os associado',
        'error',
        2000
      );
    } finally {
      setIsLoadingAssociated(false);
      isProcessingRef.current = false;
    }
  }, [AuthContext.user, setError]);

  const fetchAllActivitiesEnrolled = useCallback(async () => {
    if (!selectedAssociated || isProcessingRef.current) return;

    // Cancela requisição anterior se existir
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }

    // Cria novo AbortController para esta requisição
    currentRequestRef.current = new AbortController();
    const signal = currentRequestRef.current.signal;

    setIsLoadingActivitiesEnrolled(true);
    isProcessingRef.current = true;
    try {
      // Verifica se já tem cache para este associado
      if (allActivitiesCache.length > 0 &&
          lastFetchedAssociated?.TITULO === selectedAssociated.TITULO) {
        // Usa cache existente - não faz nova requisição
        filterActivitiesByCategory();
        return;
      }

      // Faz uma única chamada para buscar TODAS as atividades (sem filtro de área)
      const [response, canceladas] = await Promise.all([
        listarAssociadosMatriculas({
          TITULO: selectedAssociated.TITULO,
          IDAREA: 0
        }),
        listarConsultasCanceladas(selectedAssociated.TITULO)
      ]);

      // Verifica se a requisição foi cancelada
      if (signal.aborted) return;

      const mapCancel = canceladas.map((item) => ({
        ...item,
        IDAREA: 3,
        STATUS: "Canceladas",
      }));

      const dataMerged = [...response, ...mapCancel];

      // Filtra por associado
      const filteredByAssociated = dataMerged?.filter(item => {
        return selectedAssociated.TITULO !== '0'
          ? item.TITULO === selectedAssociated.TITULO
          : true;
      });

      // Armazena no cache
      setAllActivitiesCache(filteredByAssociated || []);
      setLastFetchedAssociated(selectedAssociated);

      // Filtra por categoria
      filterActivitiesByCategory(filteredByAssociated || []);

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }

      setError(
        'Falha ao carregar atividades matriculadas para este associado',
        'error',
        2000
      );
    } finally {
      if (!signal.aborted) {
        setIsLoadingActivitiesEnrolled(false);
        isProcessingRef.current = false;
      }
    }
  }, [selectedAssociated, allActivitiesCache, lastFetchedAssociated, setError]);

  const filterActivitiesByCategory = useCallback((activities?: AtividadeMatriculaItem[]) => {
    const dataToFilter = activities || allActivitiesCache;

    if (activeCategory === 'TUDO') {
      // Mostra todas as atividades (exceto área 0 se necessário)
      const allAreaIds = Object.values(idAreaMap).filter(id => id !== 0);
      const filtered = dataToFilter.filter(item => allAreaIds.includes(item.IDAREA));
      setActivitiesEnrolled(filtered);
    } else {
      // Filtra por categoria específica
      const idArea = idAreaMap[activeCategory];
      const filtered = dataToFilter.filter(item => idArea === 1
          ? (item.IDAREA === idArea || item.IDAREA === 4)
          : (item.IDAREA === idArea));

      setActivitiesEnrolled(filtered);
    }
  }, [allActivitiesCache, activeCategory, idAreaMap]);

  const handleSelectAssociate = useCallback(async (associate: Filter) => {
    // Previne múltiplos cliques
    if (isProcessingRef.current) return;

    // Limpa cache quando muda o associado
    if (associate.TITULO !== selectedAssociated?.TITULO) {
      setAllActivitiesCache([]);
      setLastFetchedAssociated(null);
    }

    setSelectedAssociated(associate);
  }, [selectedAssociated]);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    setActiveFilter('');
  }, []);

  const filteredActivities = useMemo(() => {
    return activitiesEnrolled?.filter((item) => {
      const searching = search
        ? (item.ATIVIDADE || '').toLowerCase().includes(search.toLowerCase()) ||
          (item.ESPECIALIDADE || '').toLowerCase().includes(search.toLowerCase())
        : true;
      const filteredByStatus = activeFilter ? item.STATUS === activeFilter : true;

      return searching && filteredByStatus;
    });
  }, [activitiesEnrolled, search, activeFilter]);

  const trackRegistrationsFilters = useMemo(() => {
    if (activeCategory === 'TUDO') {
      return [
        { label: 'Todos', value: '' },
        { label: 'Matriculados', value: 'Ativas' },
        { label: 'Lista de Espera', value: 'Em Espera' },
        { label: 'Cancelam. Agendados', value: 'Canceladas' },
        { label: 'Agendamentos', value: 'Agendamentos' },
      ];
    }

    return {
      'ESPORTES': [
        { label: 'Todos', value: '' },
        { label: 'Matriculados', value: 'Ativas' },
        { label: 'Lista de Espera', value: 'Em Espera' },
        { label: 'Cancelam. Agendados', value: 'Canceladas' },
        { label: 'Agendamentos', value: 'Agendamentos' },
      ],
      'CULTURAL': [
        { label: 'Todos', value: '' },
        { label: 'Matriculados', value: 'Ativas' },
        { label: 'Lista de Espera', value: 'Em Espera' },
        { label: 'Cancelam. Agendados', value: 'Canceladas' }
      ],
      'SAUDE': [
        { label: 'Todos', value: '' },
        { label: 'Consultas Agendadas', value: 'Agendada' },
        { label: 'Consultas Canceladas', value: 'Canceladas' },
      ],
    }[activeCategory] || [];
  }, [activeCategory]);

  const getCategoryFromIdArea = useCallback((idArea: number) => {
    const areaMap = {
      1: 'ESPORTES',
      2: 'CULTURAL',
      3: 'SAUDE'
    };
    return areaMap[idArea] || 'ESPORTES';
  }, []);

  // Effect para buscar associados (apenas na montagem)
  useEffect(() => {
    fetchAssociates();
  }, [fetchAssociates]);

  // Effect para buscar atividades quando muda o associado selecionado
  useEffect(() => {
    if (selectedAssociated && associated.length > 0) {
      fetchAllActivitiesEnrolled();
    }
  }, [selectedAssociated, associated.length]);

  // Effect para filtrar por categoria
  useEffect(() => {
    if (allActivitiesCache.length > 0) {
      filterActivitiesByCategory();
    }
  }, [activeCategory, allActivitiesCache.length]);

  // Cleanup effect para cancelar requisições pendentes
  useEffect(() => {
    return () => {
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
      }
    };
  }, []);

  console.log('COUNT : ', filteredActivities.length);

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <Header title="Menu" />
      <SectionTitle text='Inscrições' />
      <ScrollView contentContainerStyle={[styles.scrollContent, { marginTop: 16 }]}> 
        {/* Botão Nova matrícula só aparece se permitido pelos serviços */}
        {canShowNewRegistration && (
          // @ts-ignore
          <TouchableOpacity
            style={[styles.newRegistrationContainer, { backgroundColor: background2 }]}
            onPress={() => navigate.navigate('(tabs)/(registrations)/new')}
          >
            <View style={[styles.newRegistrationIcon, { backgroundColor: lightPinkColor }]}> 
              <IconSymbol name='square-plus' color={brand} size={20} />
            </View>
            <Text style={{ color: textColor, fontWeight: '500', fontSize: 17, flex: 1 }} >Nova matrícula</Text>
            <View style={styles.arrowContainer}>
              <IconSymbol name='chevron-right' size={30} color='#b7bbc8' library="material" />
            </View>
          </TouchableOpacity>
        )}

        {/* Filters */}
        <View style={[styles.filters, { marginTop: 16 }]}>
          {[
            { label: 'Tudo', value: 'TUDO' },
            { label: 'Esportes', value: 'ESPORTES' },
            { label: 'Cultural', value: 'CULTURAL' },
            { label: 'Saúde', value: 'SAUDE' },
          ].map((f, index) => (
            <TouchableOpacity
              key={String(f.value)}
              onPress={() => handleCategoryChange(f.value)}
              style={[
                styles.filterTab,
                activeCategory === f.value && styles.activeFilterTab,
              ]}
            >
              <Text style={[styles.filterTabText, activeCategory === f.value && styles.activeFilterTabText]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Associated */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>ASSOCIADOS</Text>
        {isLoadingAssociated ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#DA1984" />
          </View>
        ) : (
          <AssociatesList
            associates={associated}
            onSelectAssociate={handleSelectAssociate}
            selectedAssociate={selectedAssociated}
            selectable={true}
            customStyles={{ paddingHorizontal: 16 }}
          />
        )}

        {/* Filters */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>ACOMPANHE SUAS INSCRIÇÕES</Text>
        <View style={styles.filtersRegistrationsContainer}>
          {trackRegistrationsFilters?.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: activeFilter === item.value ? lightPinkColor : background,
                borderColor: activeFilter === item.value ? brand : background1,
                borderWidth: 2,
              }}
              onPress={() => setActiveFilter(item.value)}
            >
              <Text style={[
                { color: textColor, fontWeight: '600' },
                activeFilter === item.value && { color: brand }
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          {/* Search */}
          <View style={[styles.searchContainer, { backgroundColor: background2 }]}>
            <Text style={styles.searchText}>
              <IconSymbol name='search' size={24} color='' library="material" />
            </Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar"
              placeholderTextColor="#999"
              onChangeText={setSearch}
              value={search}
            />
          </View>

          {/* List */}
          <View style={[styles.activitiesContainer, { backgroundColor: background2 }]}>
            {isLoadingActivitiesEnrolled ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#DA1984" />
              </View>
            ) : filteredActivities && filteredActivities?.length > 0 ? (
              filteredActivities?.map((item, index) => {
                const DATA_BY_STATUS = {
                  'Ativas': {
                    category: 'ATIVA',
                    label: 'Matriculado',
                    bgColor: '#35E07C',
                  },
                  'Em Espera': {
                    category: 'ESPERA',
                    label: `${item.POSICAO}ª Posição`,
                    bgColor: '#EA9610',
                  },
                  'Canceladas': {
                    category: 'CANCELADA',
                    label: 'Cancelado',
                    bgColor: '#FF3F3F',
                  },
                  'Agendamentos': {
                    category: 'AGENDAMENTO',
                    label: 'Agendamentos',
                    bgColor: '#E7E9ED'
                  },
                  'Agendada': {
                    category: 'AGENDAMENTO',
                    label: 'Agendada',
                    bgColor: '#E7E9ED'
                  }
                }[item.STATUS]

                // Determinar a categoria para navegação
                const categoryForNavigation = activeCategory === 'TUDO' 
                  ? (item.CATEGORIA || getCategoryFromIdArea(item.IDAREA))
                  : activeCategory;

                return (
                  <TouchableOpacity
                    key={`${item.IDENTIFICADOR}-${index}`}
                    style={[styles.modalItem, { borderColor: background1 }]}
                    onPress={() => {
                      const screen = {
                        'ESPORTES': '(tabs)/(sports)/mandatoryRegistrationsDetails'
                      }[categoryForNavigation] || '(tabs)/(sports)/mandatoryRegistrationsDetails';

                      navigate.navigate(screen, {
                        ...item,
                        CATEGORY: DATA_BY_STATUS?.category,
                        DESCRICAO: item.ATIVIDADE,
                        USERAVATAR: item.AVATAR,
                        USERTITULO: item.TITULO,
                        IDATIVIDADE: item.IDENTIFICADOR,
                        STATUS_LABEL: DATA_BY_STATUS?.label || '',
                        STATUS_COLOR: DATA_BY_STATUS?.bgColor || '',
                      })
                    }}
                  >
                    <View style={styles.modalItemLeft}>
                      <View style={styles.modalIconCircle}>
                        <IconSymbol name={item.ICONE} size={20} library='fontawesome' color={'#505979'} />
                      </View>
                      <View style={styles.modalItemTextContainer}>
                        <Text style={[styles.modalItemTitle, { color: textColor }]}>
                          {item.ATIVIDADE || item.ESPECIALIDADE}
                        </Text>
                        {activeCategory === 'TUDO' && (
                          <Text style={[styles.categoryIndicator, { color: text2Color }]}>
                            {item.CATEGORIA || getCategoryFromIdArea(item.IDAREA)}
                          </Text>
                        )}
                        <View style={styles.modalItemTimeContainer}>
                         <View style={[styles.statusTag, { backgroundColor: DATA_BY_STATUS?.bgColor }]}>
                            <Text style={[styles.statusTagText, item.STATUS === 'Canceladas' && { color: 'white' }]}>
                              {DATA_BY_STATUS?.label}
                            </Text>
                          </View>
                          <Text style={{ fontSize: 14, marginRight: 6 }}>
                            <IconSymbol name='clock' size={20} color='#878da3' library="materialCommunity" />
                          </Text>
                          <Text
                            style={styles.modalItemTime}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >{`${item.DATA} - ${item.HORARIO}`}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.modalItemRight}>
                      <AssociateAvatar
                        style={styles.modalItemImage}
                        avatar={item.AVATAR}
                        name={item.NOME}
                      />
                      <IconSymbol name='chevron-right' size={30} color='#b7bbc8' library="material" />
                    </View>
                  </TouchableOpacity>
                )
              })
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>Nenhuma atividade encontrada</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      <FooterTabBar activeTab="registrations" />
    </View>
  );
}

const styles = StyleSheet.create({
  //
  newRegistrationContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 16,
    width: SCREEN_WIDTH - 32,
    marginInline: 'auto',
  },
  newRegistrationIcon: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8
  },
  filtersRegistrationsContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 16,
    gap: 6,
  },
  categoryIndicator: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  //
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
  },
  sectionContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 0,
    marginVertical: 10,
    marginHorizontal: 10,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  scrollViewStyle: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
  contentContainerStyle: {
    paddingBottom: 80,
  },
  wrapperStyle: {
    flex: 1,
  },
  headerStyle: {
    margin: 0,
    padding: 0,
  },
  container: { flex: 1, backgroundColor: '#E2E7F8' },
  scrollContent: { paddingBottom: 80, width: '100%' },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  sectionTitle: { fontSize: 14, fontWeight: '400', marginVertical: 4, paddingHorizontal: 32, color: '#39456a' },
  associatesRow: { flexDirection: 'row', marginBottom: 16 },
  associateItem: { alignItems: 'center', marginRight: 12 },
  avatarImage: { width: 56, height: 56, borderRadius: 28 },
  initialsAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  defaultAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', borderColor: '#D53F8C', borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  defaultIcon: { fontSize: 24 },
  associateName: { fontSize: 12, marginTop: 4, color: '#333' },
  statusCards: { flexDirection: 'row', marginTop: 5, marginBottom: 10, gap: 10 },
  statusCard: { width: 110, backgroundColor: '#D034811A', paddingHorizontal: 8, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  statusIcon: { fontSize: 24 },
  statusTitle: { fontWeight: '600', marginTop: 10, fontSize: 14, color: '#0F1C47', textAlign: 'center', flexGrow: 1 },
  statusCount: { marginTop: 10, fontSize: 13, color: '#0F1C4799' },
  filterButton: { paddingVertical: 6, paddingHorizontal: 12, color: '#666' },
  activeFilter: { color: '#D53F8C', fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 10, marginBottom: 16, paddingLeft: 12, paddingRight: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  searchText: { marginRight: 5, fontSize: 16, color: '#9399ad' },
  searchInput: { flex: 1, borderWidth: 0, paddingVertical: 10, fontSize: 17, color: '#0F1C47', backgroundColor: 'transparent' },
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1 },
  iconCircle: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  activityTextContainer: { flex: 1 },
  activityTitle: { fontSize: 17, fontWeight: '500', color: '#0F1C47' },
  activitySubtitle: { fontSize: 13, color: '#0F1C47', marginTop: 2 },
  arrowContainer: {},
  arrowText: { fontSize: 30, color: '#b7bbcb', fontWeight: '600' },
  activitiesContainer: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff', marginBottom: 16 },
  filters: {
    flexDirection: 'row',
    backgroundColor: '#0F1C471A',
    borderRadius: 10,
    padding: 4,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    width: SCREEN_WIDTH - 32,
    marginInline: 'auto'
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#0F1C47',
  },
  filterTabText: {
    color: '#4A5568',
    fontSize: 13,
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: '100%',
    height: 'auto'
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F1C47',
    marginBottom: 16,
    marginLeft: 4,
  },
  modalItemsContainer: {
    marginBottom: 20,
    maxHeight: 400,
  },
  modalItemsWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
  },
  modalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#e7e9ed',
  },
  modalItemTextContainer: {
    flex: 1,
  },
  modalItemTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusTagContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  statusTag: {
    backgroundColor: '#e9f8e5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8
  },
  statusTagText: {
    fontSize: 12,
    color: '#000',
  },
  modalItemTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  modalItemTime: {
    fontSize: 13,
    flex: 1,
    color: '#878da3',
  },
  modalItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalItemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    borderColor: '#b7bbc8',
    borderWidth: 1
  },
  closeButton: {
    backgroundColor: '#da1b84',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 4,
    width: '100%',
    height: 'auto'
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 150,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#FED7D7',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  errorText: {
    color: '#C53030',
    fontSize: 14,
  },
});