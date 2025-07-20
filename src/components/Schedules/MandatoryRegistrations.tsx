import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useError } from "@/providers/ErrorProvider";
import { useThemeColor } from "@/hooks/useThemeColor";
import { listarAtividadesAgendaHorarios } from "@/api/app/atividades";
import { IconSymbol } from "@/components/ui/IconSymbol";
import styles from "./schedulesStyles";

const MandatoryRegistrations = (props: {
  selectedAssociated: any;
  IDENTIFICADOR: string;
  IDAREA: string;
  DESCRICAO_CATEGORIA?: string;
  ICONE?: string;
}) => {
  const { setError } = useError();
  const { IDENTIFICADOR, IDAREA, DESCRICAO_CATEGORIA, selectedAssociated, ICONE } = props;
  const navigation = useNavigation();

  const background1 = useThemeColor({}, 'background1');
  const background2 = useThemeColor({}, 'background2');
  const textColor = useThemeColor({}, 'text');
  const text2Color = useThemeColor({}, 'text2');

  const [filter, setFilter] = useState<"RECREATIVO" | "FORMATIVO">(
    "RECREATIVO"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  const filteredData = data.filter((item) => {
    if (filter === "RECREATIVO" && item.IDTIPOSERVICO == 1) {
      return item;
    }
    if (filter === "FORMATIVO" && item.IDTIPOSERVICO == 2) {
      return item;
    }
  });

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const response = await listarAtividadesAgendaHorarios({
        IDENTIFICADOR: Number(IDENTIFICADOR),
        IDAREA: Number(IDAREA),
        VERIFICAR_VAGA: false,
        TITULO: selectedAssociated?.TITULO,
      });
      const listaOrdenada = response.sort((a, b) => b.VAGAS - a.VAGAS);
      setData(response);
    } catch (err) {
      setError(
        "Não foi possível obter os horários desta atividade",
        "error",
        3000
      );
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (selectedAssociated?.TITULO) {
      fetchSchedules();
    }
  }, [selectedAssociated?.TITULO]);

  return (
    <View>
      {DESCRICAO_CATEGORIA === "DESATIVADO" && (
        <View style={styles.filterMandatoryRegistrationsContainer}>
          <TouchableOpacity
            style={[
              styles.filterMandatoryRegistrationsButton,
              filter === "RECREATIVO" && { backgroundColor: "#0f1c47" },
            ]}
            onPress={() => setFilter("RECREATIVO")}
          >
            <Text
              style={[
                { textAlign: "center", fontSize: 12, fontWeight: "500" },
                filter === "RECREATIVO" && { color: "white" },
              ]}
            >
              Recreativo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterMandatoryRegistrationsButton,
              filter === "FORMATIVO" && { backgroundColor: "#0f1c47" },
            ]}
            onPress={() => setFilter("FORMATIVO")}
          >
            <Text
              style={[
                { textAlign: "center", fontSize: 12, fontWeight: "500" },
                filter === "FORMATIVO" && { color: "white" },
              ]}
            >
              Formativo
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={[styles.sectionTitle, { color: textColor }]}>HORÁRIOS</Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DA1984" />
        </View>
      ) : (
        <View style={[styles.scheduleContainer, { backgroundColor: background2 }]}> 
          {filteredData.map((item, index) => {
            const unavailable = item.VAGAS === 0;
            const disabled = !item.HABILITAR;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.card,
                  { opacity: disabled ? 0.4 : 1 },
                  { borderBottomColor: background1 }
                ]}
                onPress={() => {
                  if (disabled) {
                    return setError("Turma não disponível", "error", 5000,
                      "Este associado não se enquadra nas características necessárias dessa turma.");
                  }
                  navigation.navigate(
                    "(tabs)/(sports)/mandatoryRegistrationsDetails",
                    {
                      ...item,
                      IDAREA,
                      INSCREVER: String(item.INSCREVER),
                      MATRICULAR: String(item.MATRICULAR),
                      USERAVATAR: selectedAssociated?.AVATAR,
                      USERTITULO: selectedAssociated?.TITULO,
                      IDATIVIDADE: IDENTIFICADOR,
                      DESCRICAO_CATEGORIA: DESCRICAO_CATEGORIA,
                      ICONE: ICONE,
                    }
                  );
                }}
              >
                <View style={styles.iconContainer}>
                  <View
                    style={[
                      styles.iconCircle,
                      unavailable ? { backgroundColor: "#fbeace" } : {},
                    ]}
                  >
                    <Text
                      style={[
                        styles.numberText,
                        unavailable ? { color: "#c0820e" } : {},
                      ]}
                    >
                      {item.VAGAS}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.vagasText,
                      unavailable
                        ? { fontSize: 10, width: 60, textAlign: "center" }
                        : {},
                    ]}
                  >
                    {unavailable ? "Lista de espera" : "Vagas"}
                  </Text>
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={[styles.classTitle, { color: text2Color }]}>Turma {item.TURMA}</Text>
                  <View style={styles.localContainer}>
                    <View
                      style={{
                        width: 20,
                        display: "flex",
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
                    <Text style={[styles.local]}>
                      {item.NIVEL} - {item.FAIXA_ETARIA}
                    </Text>
                  </View>
                  <View style={styles.professorContainer}>
                    <View
                      style={{
                        width: 20,
                        display: "flex",
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
                    <Text style={styles.professor}>Prof: {item.PROFESSOR}</Text>
                  </View>
                  <View style={styles.timeContainer}>
                    <View
                      style={{
                        width: 20,
                        display: "flex",
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
                      {item.DIAS} - {item.HRINICIO} até {item.HRTERMINO}
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
          })}
          {filteredData.length === 0 && (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                Nenhuma atividade encontrada
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default MandatoryRegistrations;
