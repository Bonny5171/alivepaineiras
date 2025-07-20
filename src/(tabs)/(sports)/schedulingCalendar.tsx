import { extractFiltersFromAssociadoResponse } from "@/api/app/appTransformer";
import { Filter } from "@/api/app/appTypes";
import {
  AtividadesAgendaHorariosItem,
  listarAgendamentosDatas,
  listarAgendamentosHorarios,
  listarAtividadesAgendaHorarios,
  listarDependentesAgendamento,
  listarHorariosAulasLivres,
  ListarHorariosAulasLivresItem,
} from "@/api/app/atividades";
import ItemList from "@/app/(financeiro)/itemList";
import AssociatesList from "@/components/AssociatesList";
import Calendar from "@/components/Calendar";
import Header from "@/components/Header";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAuth } from "@/providers";
import { useError } from "@/providers/ErrorProvider";
import { useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";


const SchedulesScreen = ({ route }: any) => {
  const { setError } = useError();
  const navigation = useNavigation();
  const AuthContext = useAuth();

  const background = useThemeColor({}, 'background');
  const background2 = useThemeColor({}, 'background2');
  const textColor = useThemeColor({}, 'text');
  const text2Color = useThemeColor({}, 'text2');

  const {
    ICONE_NOVO,
    ATIVIDADE,
    IDLOCAL,
    LOCALIZACAO,
    USERTITULO,
    DESCRICAO,
    DESCRICAO_CATEGORIA,
    ...restParams
  } = route.params;

  const [isLoadingAssociated, setIsLoadingAssociated] = useState(true);
  const [associated, setAssociated] = useState<Filter[]>([]);
  const [selectedAssociated, setSelectedAssociated] = useState<Filter | null>(null); // Inicializa como null
  const [bottomButton, setBottomButton] = useState({
    show: false,
    text: "",
    onPress: () => {},
  });

  const [dates, setDates] = useState<string[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>();
  const [hours, setHours] = useState<string[]>([]);
  const [isLoadingHours, setIsLoadingHours] = useState(false);
  const [selectedHour, setSelectedHour] = useState("");

  const fetchAvailableDates = async (titulo: string) => {
    setIsLoadingDates(true);
    try {
      const response = await listarAgendamentosDatas({
        IDLOCAL: IDLOCAL,
        TITULO: titulo,
      });

      if (response[0].ERRO) {
        setError(response[0].MSG_ERRO, 'error', 3000);
        return navigation.goBack();
      }

      const datesBr = response.map(item => item.DATA);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dates = datesBr
        .map(date => {
          const [day, month, year] = date.split('/');
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        })
        .filter(date => new Date(date) >= today);

      setDates(dates);
      if (dates.length > 0 && !selectedDate) {
        setSelectedDate(dates[0]);
      }
    } catch (err) {
      setError('Não foi possivel listar os dias disponíveis', 'error', 2000);
      navigation.goBack();
    }
    setIsLoadingDates(false);
  };

  const fetchAvailableHours = async () => {
    if (!selectedAssociated?.TITULO || !selectedDate) return;
    setIsLoadingHours(true);
    try {
      const response = await listarAgendamentosHorarios({
        IDLOCAL,
        DATA: selectedDate as string,
        TITULO: selectedAssociated.TITULO,
      });
      const filteredHours = response?.map(item => item.HORARIO).filter(item => item);
      setHours(filteredHours);
    } catch (err) {
      setError('Não foi possivel listar os horários disponíveis', 'error', 2000);
      navigation.goBack();
    }
    setIsLoadingHours(false);
  };

  const fetchAssociates = async () => {
    setIsLoadingAssociated(true);
    try {
      const initialTitulo = USERTITULO !== "0" ? USERTITULO?.replace(/-/g, '') : AuthContext.user.replace(/-/g, '');
      const filtersResponse = await listarDependentesAgendamento({ TITULO: AuthContext.user, IDLOCAL });
      const extractedFilters = extractFiltersFromAssociadoResponse(filtersResponse);

      const finalList = [
        ...extractedFilters.filter(f => f.TITULO === initialTitulo),
        ...extractedFilters.filter(f => f.TITULO !== initialTitulo),
      ];

      setAssociated(finalList);

      if (finalList.length > 0 && !selectedAssociated) {
        const firstAssociate = finalList[0];
        setSelectedAssociated({
          NOME: firstAssociate.NOME || 'Sem nome',
          TITULO: firstAssociate.TITULO,
          AVATAR: firstAssociate.AVATAR,
        });
        await fetchAvailableDates(firstAssociate.TITULO);
      }
    } catch (error) {
      console.error("Erro ao buscar associados:", error);
      setError("Falha ao carregar os associados", "error", 2000);
    }
    setIsLoadingAssociated(false);
  };

  useEffect(() => {
    if (selectedHour && selectedAssociated) {
      setBottomButton({
        show: true,
        text: "Continuar",
        onPress: () => {
          navigation.navigate("(tabs)/(sports)/schedulingDetails", {
            ...restParams,
            ICONE_NOVO,
            ATIVIDADE,
            DESCRICAO, // Garantir que o nome da atividade seja passado
            IDLOCAL,
            LOCALIZACAO,
            DIAS: selectedDate,
            HRINICIO: selectedHour,
            USERTITULO: selectedAssociated.TITULO,
            USERNAME: selectedAssociated.NOME || 'Sem nome',
          });
        },
      });
    } else {
      setBottomButton({ show: false, text: "", onPress: () => {} });
    }
  }, [selectedHour, selectedAssociated]);

  useEffect(() => {
    if (selectedDate && selectedAssociated?.TITULO) {
      fetchAvailableHours();
    }
  }, [selectedDate, selectedAssociated]);

  useEffect(() => {
    fetchAssociates();
  }, []);

  useEffect(() => {
    if (selectedAssociated?.TITULO) {
      fetchAvailableDates(selectedAssociated.TITULO);
    }
  }, [selectedAssociated]);

  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      <Header title="Horários" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: "#ced2e6",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>
              <IconSymbol
                name={ICONE_NOVO}
                size={40}
                library="fontawesome"
                color={"#505979"}
              />
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: text2Color }]}>{DESCRICAO}</Text>
            <Text style={styles.subtitle}>Agendamento</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: textColor }]}>ASSOCIADOS</Text>
        {isLoadingAssociated ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#DA1984" />
          </View>
        ) : (
          <AssociatesList
            associates={associated}
            selectedAssociate={selectedAssociated}
            selectable={true}
            onSelectAssociate={(e) => {
              setSelectedDate('');
              setSelectedHour('');
              setSelectedAssociated({ NOME: e.NOME || 'Sem nome', TITULO: e.TITULO, AVATAR: e.AVATAR });
            }}
          />
        )}

        <Text style={[styles.sectionTitle, { color: textColor }]}>ESCOLHA UMA DATA</Text>
        <View style={[styles.scheduleContainer, { backgroundColor: background2 }]}>
          {isLoadingDates ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#DA1984" />
            </View>
          ) : (
            <>
              <Calendar
                diasSelecionados={selectedDate ? [selectedDate] : []}
                diasDisponiveis={dates}
                onlyExplicitAvailable
                blocked
                multiplaSelecao={false}
                onDiaSelecionado={(date) => {
                  if (typeof date === 'string') {
                    setSelectedDate(date);
                  } else {
                    setSelectedDate(undefined);
                  }
                  setSelectedHour(""); // Limpa o horário selecionado ao trocar a data
                }}
              />

              <Text
                style={[
                  styles.sectionTitle,
                  { color: textColor },
                  { paddingHorizontal: 32, marginTop: 20 },
                ]}
              >
                ESCOLHA UM HORÁRIO
              </Text>
              <View style={styles.hoursContainer}>
                {isLoadingHours ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#DA1984" />
                  </View>
                ) : hours.map((HRINICIO, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.hourBox,
                      selectedHour === HRINICIO && styles.hourBoxSelected,
                    ]}
                    onPress={() => setSelectedHour(HRINICIO)}
                  >
                    <Text
                      style={{
                        color: selectedHour === HRINICIO ? "#5a69e2" : text2Color,
                      }}
                    >
                      {HRINICIO}
                    </Text>
                  </TouchableOpacity>
                ))}
                {(selectedDate && !isLoadingHours && !hours.length) && (
                  <View style={[styles.hourBox, { marginHorizontal: 'auto' }]}>
                    <Text style={{ fontSize: 15, color: textColor }}>
                      Nenhum horário disponível
                    </Text>
                  </View>
                )}
              </View>
              <View
                style={{ width: "100%", height: 1, backgroundColor: "#e7e8ed" }}
              />
            </>
          )}
        </View>
      </ScrollView>
      {bottomButton.show && (
        <View style={[styles.botaoContainer, { backgroundColor: background2 }]}>
          <TouchableOpacity style={styles.botao} onPress={bottomButton.onPress}>
            <Text style={styles.textoBotao}>{bottomButton.text}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 50 },
  pageTitle: { fontSize: 28, fontWeight: "bold", color: "#FFF" },
  title: { fontSize: 20, fontWeight: "bold", color: "#000", marginBottom: 6 },
  subtitle: { fontSize: 15, color: "#636d8e", marginBottom: 6 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "400",
    marginVertical: 4,
    paddingHorizontal: 16,
    color: "#39456a",
  },
  subLink: {
    color: "#D03481",
    fontSize: 15,
    textAlign: "center",
    fontWeight: "600",
  },
  loadingContainer: {
    height: 80,
    width: '100%',
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  cardTextContainer: { flex: 1, paddingRight: 12 },
  arrowContainer: {},
  arrowText: { fontSize: 30, color: "#b7bbcb", fontWeight: "600" },
  iconContainer: {
    width: 40,
    flexDirection: "column",
    alignItems: "center",
    marginRight: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d6f9e6",
  },
  numberText: { fontSize: 20, fontWeight: "bold", color: "#3eab7e" },
  vagasText: { fontSize: 12, color: "#b6bbc5", marginTop: 4 },
  classTitle: { fontWeight: "600", fontSize: 17 },
  professorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  timeContainer: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  localContainer: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  titulo: { fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 4 },
  professor: { fontSize: 13, color: "#878da3" },
  time: { fontSize: 13, color: "#878da3" },
  local: { fontSize: 13, color: "#878da3" },
  scheduleContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    marginTop: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 150,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  filterMandatoryRegistrationsContainer: {
    width: "100%",
    height: "auto",
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#cdd3e7",
    padding: 2,
    borderRadius: 8,
    marginBottom: 16,
  },
  filterMandatoryRegistrationsButton: {
    flex: 1,
    textAlign: "center",
    padding: 6,
    borderRadius: 6,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginBottom: 16,
    paddingLeft: 12,
    paddingRight: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchText: { marginRight: 5, fontSize: 16, color: "#9399ad" },
  searchInput: {
    flex: 1,
    borderWidth: 0,
    paddingVertical: 10,
    fontSize: 17,
    color: "#0F1C47",
    backgroundColor: "transparent",
  },
  calendar: {
    width: "100%",
    height: "auto",
    marginBottom: 15,
  },
  hoursContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  hourBox: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#cfd2da",
    color: "#57617f",
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  hourBoxSelected: {
    backgroundColor: "rgba(90, 105, 226, 0.1)",
    borderColor: "#5a69e2",
  },
  botaoContainer: {
    height: "auto",
    width: "100%",
    padding: 16,
    backgroundColor: "white",
  },
  botao: {
    backgroundColor: "#DA1984",
    padding: 13,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  textoBotao: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default SchedulesScreen;
