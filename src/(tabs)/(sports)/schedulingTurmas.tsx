import {
  listarAgendamentosTurmas,
  ListarAgendamentosTurmasItem,
} from "@/api/app/atividades";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useError } from "@/providers/ErrorProvider";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { IconSymbol } from "@/components/ui/IconSymbol";

// Alterado: Recebe IDGRUPO diretamente como prop
interface SchedulingTurmasProps {
  IDGRUPO: string;
}

const SchedulingTurmas: React.FC<SchedulingTurmasProps> = ({ IDGRUPO }) => {
  const { setError } = useError();
  const navigation = useNavigation();
  const route = useRoute();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ListarAgendamentosTurmasItem[]>([]);

  const background1 = useThemeColor({}, "background1");
  const background2 = useThemeColor({}, "background2");
  const textColor = useThemeColor({}, "text");
  const text2Color = useThemeColor({}, "text2");
  const background = useThemeColor({}, "background");

  // Recebe os params anteriores para repassar na navegação
  const parentParams = route?.params || {};

  const fetchTurmas = async () => {
    setIsLoading(true);
    try {
      const response = await listarAgendamentosTurmas(IDGRUPO);
      setData(response);
    } catch (err) {
      setError(
        "Não foi possível obter as turmas desta atividade",
        "error",
        3000
      );
      // Removido: navigation.goBack();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTurmas();
  }, [IDGRUPO]); // Atualiza se IDGRUPO mudar

  // Pega o primeiro item para exibir informações gerais
  const info = data[0] || {};

  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      {/* Lista de turmas */}
      <View>
        <Text style={[styles.sectionTitle, { color: textColor }]}>HORÁRIOS</Text>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#DA1984" />
          </View>
        ) : (
          <View
            style={[
              styles.scheduleContainer,
              { backgroundColor: background2 },
            ]}
          >
            {data.length > 0
              ? data.map((item, index) => {
                  // Exemplo: Vagas e Lista de Espera
                  const vagas = item.RESTRICAO?.match(/\d+/)?.[0] || "-";
                  const isListaEspera =
                    item.MSG_ALERTA &&
                    item.MSG_ALERTA.toLowerCase().includes("lista de espera");
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.card,
                        { borderBottomColor: background1 },
                      ]}
                      onPress={() => {
                        // Navega para schedulingCalendar passando os params da turma selecionada
                        (navigation as any).navigate("(tabs)/(sports)/schedulingCalendar", {
                          ...parentParams,
                          ...item,
                        });
                      }}
                    >
                      <View style={styles.iconContainer}>
                        <View
                          style={[
                            styles.iconCircle,
                            isListaEspera
                              ? { backgroundColor: "#fbeace" }
                              : { backgroundColor: "#d6f9e6" },
                          ]}
                        >
                          <Text
                            style={[
                              styles.numberText,
                              isListaEspera
                                ? { color: "#c0820e" }
                                : { color: "#3eab7e" },
                            ]}
                          >
                            {vagas}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.vagasText,
                            isListaEspera
                              ? { fontSize: 10, width: 60, textAlign: "center" }
                              : {},
                          ]}
                        >
                          {isListaEspera ? "Lista de Espera" : "Vagas"}
                        </Text>
                      </View>
                      <View style={styles.cardTextContainer}>
                        <Text
                          style={[styles.classTitle, { color: text2Color }]}
                        >
                          {item.ATIVIDADE}
                        </Text>
                        <View style={styles.localContainer}>
                          <View
                            style={{
                              width: 20,
                              alignItems: "center",
                              marginRight: 6,
                            }}
                          >
                            <IconSymbol
                              name="layer-group"
                              size={15}
                              color="#878da3"
                              library="fontawesome"
                            />
                          </View>
                          <Text style={styles.local}>
                            {item.LOCALIZACAO}
                          </Text>
                        </View>
                        <View style={styles.professorContainer}>
                          <View
                            style={{
                              width: 20,
                              alignItems: "center",
                              marginRight: 6,
                            }}
                          >
                            <IconSymbol
                              name="person"
                              size={20}
                              color="#878da3"
                              library="material"
                            />
                          </View>
                          <Text style={styles.professor}>
                            Prof: {item?.PROFESSOR || "-"}
                          </Text>
                        </View>
                        <View style={styles.timeContainer}>
                          <View
                            style={{
                              width: 20,
                              alignItems: "center",
                              marginRight: 6,
                            }}
                          >
                            <IconSymbol
                              name="watch-later"
                              size={17}
                              color="#878da3"
                              library="material"
                            />
                          </View>
                          <Text style={styles.time}>
                            {item.RESTRICAO}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.arrowContainer}>
                        <IconSymbol
                          name="chevron-right"
                          size={30}
                          color="#b7bbc8"
                          library="material"
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })
              : (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>
                    Nenhuma turma encontrada
                  </Text>
                </View>
              )}
          </View>
        )}
      </View>
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
    width: "100%",
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

export default SchedulingTurmas;