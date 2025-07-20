import { Filter } from "@/api/app/appTypes";
import AssociatesList from "@/components/AssociatesList";
import Header from "@/components/Header";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAuth } from "@/providers";
import { useError } from "@/providers/ErrorProvider";
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
import MandatoryRegistrations from "@/components/Schedules/MandatoryRegistrations";
import FreeClasses from "@/components/Schedules/FreeClasses";
import SchedulingTurmas from "./schedulingTurmas";

const SchedulesScreen = ({ route }: any) => {
  const { setError } = useError();
  const AuthContext = useAuth();

  const background = useThemeColor({}, "background");
  const background2 = useThemeColor({}, "background2");
  const textColor = useThemeColor({}, "text");
  const text2Color = useThemeColor({}, "text2");

  // Recebe o associado completo dos params
  const { selectedAssociate, dependentesAssociates = [], ...params } = route.params;
  const {
    IDENTIFICADOR,
    IDAREA,
    ICONE,
    DESCRICAO,
    DESCRICAO_CATEGORIA,
    USER_TITULO,
    NOME,
    USER_NAME,
    IDLOCAL,
    LOCALIZACAO,
    ORIENTACAO,
    OBSERVACAO,
    IDGRUPO, // Adiciona IDGRUPO dos params
  } = params;

  const [isLoadingAssociated, setIsLoadingAssociated] = useState(false);
  const [associated, setAssociated] = useState<Filter[]>(dependentesAssociates);
  // Usa o associado completo recebido
  const [selectedAssociated, setSelectedAssociated] = useState<Filter>(selectedAssociate);
  const [bottomButton, setBottomButton] = useState({
    show: false,
    text: "",
    onPress: () => { },
  });

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
                name={ICONE}
                size={40}
                library="fontawesome"
                color={"#505979"}
              />
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: text2Color }]}>{DESCRICAO}</Text>
            <Text style={styles.subtitle}>{DESCRICAO_CATEGORIA}</Text>
          </View>
        </View>

        {DESCRICAO_CATEGORIA !== "Agendamento" && (
          <>
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
                onSelectAssociate={(associado) => {
                  console.log('Assiciado selecionado', associado);
                  setSelectedAssociated(associado)
                }}
              />
            )}
          </>
        )}

        {DESCRICAO_CATEGORIA == "Livre" && (
          // Atividades Livres
          <FreeClasses
            selectedAssociated={selectedAssociated}
            IDENTIFICADOR={IDENTIFICADOR}
          />
        )}

        {(DESCRICAO_CATEGORIA == "Matricula Obrigatória" || DESCRICAO_CATEGORIA == "Cultural") && (
          // Matricula Obrigatória
          <MandatoryRegistrations
            selectedAssociated={selectedAssociated}
            IDAREA={IDAREA}
            IDENTIFICADOR={IDENTIFICADOR}
            DESCRICAO_CATEGORIA={DESCRICAO_CATEGORIA}
            ICONE={ICONE}
          />
        )}

        {DESCRICAO_CATEGORIA == "Agendamento" && IDGRUPO && (
          // Novo: Horários de Turmas
          <SchedulingTurmas IDGRUPO={IDGRUPO} />
        )}

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
