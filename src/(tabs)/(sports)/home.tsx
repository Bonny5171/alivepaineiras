import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, ActivityIndicator } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Header from '@/components/Header';
import FooterTabBar from '@/components/FooterTabBar';
import AssociatesList from '@/components/AssociatesList';
import { useNavigation } from '@react-navigation/native';
import {
  listarDependentes,
  listarAtividadesFiltro,
  listarAtividadesAgendamentos,
  listarQuantidade,
  listarAssociados,
  listarEspera,
  listarProgramacao,
  listarAgendamentos,
  listarAssociadosAgendamento,
} from '@/api/app/atividades';
import { useAuth } from '@/providers';
import { extractFiltersFromAssociadoResponse } from '@/api/app/appTransformer';
import { Filter } from '@/api/app/appTypes';
import { SectionTitle } from '@/components/SectionTitle';
import { useError } from '@/providers/ErrorProvider';
import { useThemeColor } from '@/hooks/useThemeColor';
import DynamicListSkeleton from '@/components/DynamicListSkeleton';

export default function Esportes() {
  const { setError } = useError();
  const AuthContext = useAuth();

  const navigate = useNavigation();

  const lightPinkColor = useThemeColor({}, 'lightPink');
  const background = useThemeColor({}, 'background');
  const background1 = useThemeColor({}, 'background1');
  const background2 = useThemeColor({}, 'background2');
  const textColor = useThemeColor({}, 'text');
  const text2Color = useThemeColor({}, 'text2');

  const [isLoadingAssociated, setIsLoadingAssociated] = useState(true);
  const [isLoadingActivitiesEnrolled, setIsActivitiesEnrolled] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  const [associated, setAssociated] = useState<Filter[]>([]);
  const [selectedAssociated, setSelectedAssociated] = useState<Filter | null>({ NOME: '', TITULO: AuthContext.user });
  const [activities, setActivities] = useState<any[]>([]);

  const [countEnrolled, setCountEnrolled] = useState({
    actives: 0,
    waiting: 0,
    scheduled: 0,
    cancelled: 0,
  })

  const [activeFilter, setActiveFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const [modalActivitiesEnrolled, setModalActivitiesEnrolled] = useState({ isOpen: false, type: '' });

  const [dependentesAssociates, setDependentesAssociates] = useState<Filter[]>([]);

  const fetchActivities = async () => {
    setIsLoadingActivities(true);
    try {
      const [atividadesFiltro, atividadesAgendamentos] = await Promise.all([
        await listarAtividadesFiltro({ TITULO: selectedAssociated?.TITULO, IDAREA: 1 }),
        await listarAtividadesAgendamentos({ TITULO: AuthContext.user })
      ])

      const filterSports = atividadesFiltro.filter((item) => item.IDAREA === 5 || item.IDAREA === 1);

      // Se for 'Todos', só inclui agendamentos se não houver erro e se o array não for só erro
      let atividadesAgendamentosFiltradas: any[] = [];
      if (selectedAssociated?.TITULO === '0') {
        // Se todos os itens têm ERRO, não inclui nada
        const hasValidAgendamento = atividadesAgendamentos.some(item => !item.ERRO);
        if (hasValidAgendamento) {
          atividadesAgendamentosFiltradas = atividadesAgendamentos.filter(item => !item.ERRO).map(item => ({ ...item, IDAREA: 4, DESCRICAO: item.ATIVIDADE }));
        } else {
          atividadesAgendamentosFiltradas = [];
        }
      } else {
        atividadesAgendamentosFiltradas = atividadesAgendamentos.filter(item => !item.ERRO).map(item => ({ ...item, IDAREA: 4, DESCRICAO: item.ATIVIDADE }));
      }

      const response = [...filterSports, ...atividadesAgendamentosFiltradas];

      const formatterSports = response.map((item) => ({
        ...item,
        DESCRICAO: item?.DESCRICAO
      }));

      setActivities(formatterSports as any);
      setIsLoadingActivities(false);
    } catch (error) {
      setIsLoadingActivities(false);
      setError(
        'Falha ao carregar as atividades disponíveis',
        'error',
        2000
      );
    }
  };

  // Carrega ambos os tipos de associados apenas uma vez
  const fetchAllAssociates = async () => {
    setIsLoadingAssociated(true);
    try {
      // Dependentes
      const filtersResponse = await listarDependentes({ TITULO: AuthContext.user, IDAREA: 1 });
      const extractedFilters = extractFiltersFromAssociadoResponse(filtersResponse);
      const todosOption: Filter = { NOME: 'Todos', TITULO: '0' };
      const dependentesList = [
        todosOption,
        ...extractedFilters.filter(f => f.TITULO === AuthContext.user),
        ...extractedFilters.filter(f => f.TITULO !== AuthContext.user),
      ];
      setDependentesAssociates(dependentesList);
    } catch (error) {
      setError(
        'Falha ao carregar os associado',
        'error',
        2000
      )
    }
    setIsLoadingAssociated(false);
  };

  // Alterna a lista exibida conforme o filtro, sem novo request
  useEffect(() => {
    setAssociated(dependentesAssociates);
  }, [activeFilter, dependentesAssociates]);

  const fetchActivityEnrolled = async () => {
    if (!selectedAssociated) return;

    setIsActivitiesEnrolled(true);

    try {

      const [count] = await Promise.all([
        await listarQuantidade({ TITULO: selectedAssociated.TITULO, IDAREA: 1 })
      ])

      setCountEnrolled({
        actives: count[0].SERVICO.find(item => item.IDSERVICO === 1)?.QUANTIDADE || 0,
        waiting: count[0].SERVICO.find(item => item.IDSERVICO === 2)?.QUANTIDADE || 0,
        cancelled: count[0].SERVICO.find(item => item.IDSERVICO === 3)?.QUANTIDADE || 0,
        scheduled: count[0].SERVICO.find(item => item.IDSERVICO === 4)?.QUANTIDADE || 0,
      })
    } catch (error) {
      setError(
        'Falha ao carregar atividades matriculadas para este associado',
        'error',
        2000
      )
    }

    setIsActivitiesEnrolled(false);
  };

  const handleSelectAssociate = async (associate: Filter) => {
    console.log('Selected Associate:', associate);
    setSelectedAssociated(associate);
  };

  const filteredActivities = activities.filter((item) => {
    const text = search?.trim().toLowerCase() || '';
    const descricao = item.DESCRICAO?.toLowerCase() || '';
    const matchesSearch = descricao.includes(text);

    if (!activeFilter) return matchesSearch;

    const areaMap = {
      MATRICULAS: 1,
      LIVRES: 5,
      AGENDAMENTOS: 4,
    }[activeFilter];

    return item.IDAREA === areaMap && matchesSearch;
  });

  const isErroArray = Array.isArray(filteredActivities) && filteredActivities.length === 1 && filteredActivities[0]?.ERRO;

  useEffect(() => {
    fetchAllAssociates();
    fetchActivityEnrolled();
    fetchActivities();
  }, []);

  useEffect(() => {
    fetchActivityEnrolled();
    fetchActivities();
  }, [selectedAssociated])

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <Header title="Inicio" />
      <SectionTitle text='Esportes' />
      <ScrollView contentContainerStyle={[styles.scrollContent, { marginTop: 16 }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>ASSOCIADOS</Text>
        {isLoadingAssociated ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#DA1984" />
          </View>
        ) : (
          <AssociatesList
            associates={associated}
            onSelectAssociate={activeFilter === 'AGENDAMENTOS' ? undefined : handleSelectAssociate}
            selectedAssociate={activeFilter === 'AGENDAMENTOS' ? null : selectedAssociated}
            selectable={activeFilter !== 'AGENDAMENTOS'}
            customStyles={{ paddingHorizontal: 16 }}
            disabled={activeFilter === 'AGENDAMENTOS'} // Adiciona prop para acinzentar todos
          />
        )}
        <Text style={[styles.sectionTitle, { color: textColor }]}>ACOMPANHE SUAS INSCRIÇÕES</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ display: 'flex', width: 'auto', paddingHorizontal: 16 }}
        >
          <View style={styles.statusCards}>
            <TouchableOpacity style={[styles.statusCard, { backgroundColor: lightPinkColor }]} onPress={() => setModalActivitiesEnrolled({ isOpen: true, type: 'Ativas' })}>
              <Text style={styles.statusIcon}>
                <IconSymbol name='check' size={24} color='#da1984' library="fontawesome" />
              </Text>
              <Text style={[styles.statusTitle, { color: text2Color }]}>
                Matriculas {"\n"}
                Ativas
              </Text>
              <Text style={[styles.statusCount, { color: text2Color }]}>
                {isLoadingActivitiesEnrolled
                  ? <ActivityIndicator size="small" color="#FFFFFF" />
                  : `${countEnrolled.actives} registros`
                }
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statusCard, { backgroundColor: lightPinkColor }]} onPress={() => setModalActivitiesEnrolled({ isOpen: true, type: 'Em Espera' })}>
              <Text style={styles.statusIcon}>
                <IconSymbol name='clock' size={24} color='#da1984' library="fontawesome" />
              </Text>
              <Text style={[styles.statusTitle, { color: text2Color }]}>
                Lista de {"\n"}
                espera
              </Text>
              <Text style={[styles.statusCount, { color: text2Color }]}>
                {isLoadingActivitiesEnrolled
                  ? <ActivityIndicator size="small" color="#FFFFFF" />
                  : `${countEnrolled.waiting} registros`
                }
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statusCard, { backgroundColor: lightPinkColor }]} onPress={() => setModalActivitiesEnrolled({ isOpen: true, type: 'Canceladas' })}>
              <Text style={styles.statusIcon}>
                <IconSymbol name='x' size={24} color='#da1984' library="fontawesome" />
              </Text>
              <Text style={[styles.statusTitle, { color: text2Color }]}>
                Processo {"\n"}
                de Cancel.
              </Text>
              <Text style={[styles.statusCount, { color: text2Color }]}>
                {isLoadingActivitiesEnrolled
                  ? <ActivityIndicator size="small" color="#FFFFFF" />
                  : `${countEnrolled.cancelled} registros`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statusCard, { backgroundColor: lightPinkColor }]} onPress={() => setModalActivitiesEnrolled({ isOpen: true, type: 'Agendamentos' })}>
              <Text style={styles.statusIcon}>
                <IconSymbol name='calendar' size={24} color='#da1984' library="fontawesome" />
              </Text>
              <Text style={[styles.statusTitle, { color: text2Color }]}>
                Agendam.
              </Text>
              <Text style={[styles.statusCount, { color: text2Color }]}>
                {isLoadingActivitiesEnrolled
                  ? <ActivityIndicator size="small" color="#FFFFFF" />
                  : `${countEnrolled.scheduled} registros`}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <Modal
          visible={modalActivitiesEnrolled.isOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            setModalActivitiesEnrolled({ isOpen: false, type: '' })
          }}
          style={{ maxHeight: '80%' }}
        >
          <View style={styles.modalOverlay}>
            <ModalContent
              type={modalActivitiesEnrolled.type}
              selectedAssociated={selectedAssociated}
              onClose={() => {
                setModalActivitiesEnrolled({ isOpen: false, type: '' })
              }}
            />
          </View>
        </Modal>
        <Text style={[styles.sectionTitle, { color: textColor }]}>ATIVIDADES DISPONÍVEIS</Text>
        <View style={{ paddingHorizontal: 16 }}>
          <View style={styles.filters}>
            {[
              { label: 'Todos', value: '' },
              { label: 'Matric.', value: 'MATRICULAS' },
              { label: 'Livres', value: 'LIVRES' },
              { label: 'Agendam.', value: 'AGENDAMENTOS' }
            ].map((f, index) => (
              <TouchableOpacity
                key={String(f.value)}
                onPress={() => setActiveFilter(f.value)}
                style={[
                  styles.filterTab,
                  activeFilter === f.value && styles.activeFilterTab,
                ]}
              >
                <Text style={[styles.filterTabText, activeFilter === f.value && styles.activeFilterTabText]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.searchContainer, { backgroundColor: background2 }]}>
            <Text style={styles.searchText}>
              <IconSymbol name='search' size={24} color='' library="material" />
            </Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar"
              placeholderTextColor="#999"
              onChangeText={setSearch}
            />
          </View>
          <View style={[styles.activitiesContainer, { backgroundColor: background2 }]}>
            {isLoadingActivities ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#DA1984" />
              </View>
            ) : isErroArray ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>{'Nenhuma atividade encontrada'}</Text>
              </View>
            ) : filteredActivities?.length > 0 ? (
              filteredActivities.map((act) => {
                const DESCRICAO_CATEGORIA =
                  act.IDAREA === 5 && 'Livre' ||
                  act.IDAREA === 1 && 'Matricula Obrigatória' ||
                  act.IDAREA === 4 && 'Agendamento'

                return (
                  (
                    <TouchableOpacity
                      key={act.DESCRICAO}
                      style={[styles.activityItem, { borderBottomColor: background1 }]}
                      onPress={() => {
                        let associateToSend = selectedAssociated;
                        // Se "Todos" está selecionado, passa o objeto completo do usuário logado
                        if (selectedAssociated && selectedAssociated.TITULO === '0') {
                          // Busca o associado do usuário logado na lista de dependentes
                          const userAssociate = dependentesAssociates.find(a => a.TITULO === AuthContext.user);
                          if (userAssociate) {
                            associateToSend = userAssociate;
                          }
                        }
                        // Remove o item 'Todos' antes de passar para a próxima tela
                        const dependentesAssociatesToSend = dependentesAssociates.filter(a => a.TITULO !== '0');
                        const params = {
                          ...act,
                          ERRO: '',
                          EXIBIR_TURMAS: String(act.EXIBIR_TURMAS),
                          NOME: act.NOME,
                          IDENTIFICADOR: act.IDENTIFICADOR,
                          IDAREA: act.IDAREA,
                          ICONE: act.ICONE,
                          DESCRICAO: act.DESCRICAO,
                          DESCRICAO_CATEGORIA: String(DESCRICAO_CATEGORIA),
                          selectedAssociate: associateToSend, // Passa o objeto correto
                          dependentesAssociates: dependentesAssociatesToSend // Sem o item 'Todos'
                        };

                        navigate.navigate('(tabs)/(sports)/schedules', params);
                      }}
                    >
                      <View style={[styles.iconCircle, { backgroundColor: lightPinkColor }]}>
                        <IconSymbol
                          name={act.ICONE || 'list'}
                          size={20}
                          library='fontawesome'
                          color={'#da1984'}
                        />
                      </View>
                      <View style={styles.activityTextContainer}>
                        <Text style={[styles.activityTitle, { color: textColor }]}>{act.DESCRICAO}</Text>
                        <Text style={[styles.activitySubtitle, { color: '#878da3' }]}>{DESCRICAO_CATEGORIA}</Text>
                      </View>
                      <View style={styles.arrowContainer}>
                        <IconSymbol name='chevron-right' size={30} color='#b7bbc8' library="material" />
                      </View>
                    </TouchableOpacity>
                  )
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
      <FooterTabBar />
    </View>
  );
}

const ModalContent = (props: {
  type: string;
  selectedAssociated: Filter | null
  onClose: () => void
}) => {
  const navigate = useNavigation();
  const { onClose, type, selectedAssociated } = props;

  const [activitiesEnrolled, setActivitiesEnrolled] = useState<any[]>();
  const [isLoading, setIsLoading] = useState(true);

  const background1 = useThemeColor({}, 'background1');
  const background2 = useThemeColor({}, 'background2');
  const textColor = useThemeColor({}, 'text');

  const DATA_BY_STATUS = {
    'Ativas': {
      category: 'ATIVA',
      title: 'Matrículas ativas',
      bgColor: '#35E07C',
      detailsLink: '(tabs)/(sports)/mandatoryRegistrationsDetails'
    },
    'Em Espera': {
      category: 'ESPERA',
      title: 'Atividades em espera',
      bgColor: '#EA9610',
      detailsLink: '(tabs)/(sports)/mandatoryRegistrationsDetails'
    },
    'Canceladas': {
      category: 'CANCELADA',
      title: 'Processo de Cancelamento',
      bgColor: '#FF3F3F',
      detailsLink: '(tabs)/(sports)/mandatoryRegistrationsDetails'
    },
    'Agendamentos': {
      category: 'AGENDAMENTO',
      title: 'Agendamentos',
      bgColor: '#E7E9ED',
      detailsLink: '(tabs)/(sports)/schedulingDetails'
    }
  }[type]

  const formattedData = activitiesEnrolled?.filter((item) => !item.ERRO).map(item => {
    const LABEL = {
      'Ativas': 'Matriculado',
      'Canceladas': 'Cancelado',
      'Em Espera': `${item.POSICAO}ª Posição`,
      'Agendamentos': 'Agendamento'
    }[item.STATUS]

    return {
      ...item,
      LABEL
    }
  });

  const fetchEnrolledActitivites = async () => {
    setIsLoading(true);

    try {
      const request = {
        'Ativas': listarAssociados,
        'Em Espera': listarEspera,
        'Canceladas': listarProgramacao,
        'Agendamentos': listarAgendamentos,
      }[type]

      if (!request) return;

      const response = await request({ TITULO: selectedAssociated?.TITULO, IDAREA: 1 });

      // Não sobrescreve o tipo da resposta, apenas filtra para exibição
      let displayList = response;
      if (type === 'Agendamentos') {
        if (selectedAssociated?.TITULO !== '0') {
          displayList = response.filter((item: any) => item.TITULO == selectedAssociated?.TITULO);
        }
      } else {
        displayList = response.filter((item: any) => ('IDAREA' in item ? item.IDAREA === 1 : true) && (selectedAssociated?.TITULO === '0' || item.TITULO == selectedAssociated?.TITULO));
      }

      const formatted = displayList.map((item: any) => ({
        ...item,
        ATIVIDADE: item.ATIVIDADE || item.GRUPO || item.NOME || '',
        STATUS: type
      }))

      setActivitiesEnrolled(formatted);
    } catch (err) {
      // erro silencioso
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchEnrolledActitivites();
  }, [selectedAssociated])

  return (
    <View style={[styles.modalContent, { backgroundColor: background2 }]}>
      <Text style={[styles.modalTitle, { color: textColor }]}>{DATA_BY_STATUS?.title}</Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DA1984" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : (formattedData && formattedData?.length > 0) ? (
        <ScrollView style={styles.modalItemsContainer} showsVerticalScrollIndicator={true}>
          <View style={[styles.modalItemsWrapper, { borderColor: background1 }]}>
            {formattedData?.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.modalItem, { borderColor: background1 }]}
                onPress={() => {
                  onClose();
                  navigate.navigate(DATA_BY_STATUS?.detailsLink, {
                    ...item,
                    ERRO: '',
                    CATEGORY: DATA_BY_STATUS.category,
                    DESCRICAO: item.ATIVIDADE,
                    USERAVATAR: item.AVATAR,
                    USERTITULO: item.TITULO,
                    IDATIVIDADE: item.IDATIVIDADE,
                    IDAGENDAMENTO: item.IDAGENDAMENTO,
                  });
                }}
              >
                <View style={styles.modalItemLeft}>
                  <View style={styles.modalIconCircle}>
                    <IconSymbol name={item.ICONE} size={20} library='fontawesome' color={'#505979'} />
                  </View>
                  <View style={styles.modalItemTextContainer}>
                    <Text style={[styles.modalItemTitle, { color: textColor }]}>{item.ATIVIDADE}</Text>
                    <View style={styles.modalItemTimeContainer}>
                      <View style={[styles.statusTag, { backgroundColor: DATA_BY_STATUS?.bgColor }]}>
                        <Text style={[styles.statusTagText, item.LABEL === 'Cancelado' && { color: 'white' }]}>{item.LABEL}</Text>
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
                  {item.AVATAR ? (
                    <Image source={{ uri: item.AVATAR }} style={styles.modalItemImage} />
                  ) : (
                    <View style={styles.initialsAvatar}>
                      <Text style={{ color: '#0F1C47', fontWeight: 'bold', fontSize: 18 }}>
                        {(() => {
                          if (!item.NOME) return '';
                          const nameParts = item.NOME.split(' ');
                          if (nameParts.length > 1) {
                            return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
                          }
                          return nameParts[0][0].toUpperCase();
                        })()}
                      </Text>
                    </View>
                  )}
                  <IconSymbol name='chevron-right' size={30} color='#b7bbc8' library="material" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>Nenhum registro encontrado</Text>
        </View>
      )}

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Fechar</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
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
  initialsAvatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 28, 
    backgroundColor: '#eee', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 8,
  },
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
