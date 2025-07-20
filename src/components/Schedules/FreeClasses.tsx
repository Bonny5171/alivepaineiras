import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useError } from "@/providers/ErrorProvider";
import { useThemeColor } from "@/hooks/useThemeColor";
import { listarHorariosAulasLivres } from "@/api/app/atividades";
import { IconSymbol } from "@/components/ui/IconSymbol";
import styles from "./schedulesStyles";

const FreeClasses = (props: {
  IDENTIFICADOR: string;
  selectedAssociated: any;
}) => {
  const { setError } = useError();
  const { IDENTIFICADOR, selectedAssociated } = props;
  const navigation = useNavigation();

  const textColor = useThemeColor({}, 'text');
  const background2 = useThemeColor({}, 'background2')
  const background = useThemeColor({}, 'background')

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const filteredData = data.filter((item) => {
    const searchValue = search.toLocaleLowerCase();
    if (!searchValue) return item;
    if (
      item.DIAS.toLocaleLowerCase().includes(searchValue) ||
      item.HRINICIO.toLocaleLowerCase().includes(searchValue) ||
      item.HRTERMINO.toLocaleLowerCase().includes(searchValue) ||
      item.PROFESSOR.toLocaleLowerCase().includes(searchValue) ||
      item.LOCAL.toLocaleLowerCase().includes(searchValue)
    ) {
      return item;
    }
  });

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const response = await listarHorariosAulasLivres({
        IDATIVIDADE: Number(IDENTIFICADOR),
        TITULO: selectedAssociated?.TITULO,
      });
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

  const groupDatasByDay = () => {
    const daysOrder = [
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
      "Domingo",
    ];
    const group: { [key: string]: any[] } = {};
    for (const atividade of filteredData) {
      const DIAS = atividade.DIAS.replace(" ", "");
      if (!group[DIAS]) {
        group[DIAS] = [];
      }
      group[DIAS].push(atividade);
    }
    const results = daysOrder
      .filter((DAY) => group[DAY])
      .map((DAY) => ({
        DIAS: DAY,
        DATA: group[DAY],
      }));
    return results;
  };

  const formattedDatas = groupDatasByDay();

  useEffect(() => {
    fetchSchedules();
  }, [selectedAssociated]);

  return (
    <View>
      <View style={[styles.searchContainer, { backgroundColor: background2 }]}> 
        <Text style={styles.searchText}>
          <IconSymbol
            color=""
            size={16}
            name="magnifying-glass"
            library="fontawesome"
          />
        </Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar"
          value={search}
          placeholderTextColor="#999"
          onChangeText={(newText) => setSearch(newText)}
        />
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DA1984" />
        </View>
      ) : (
        <>
          {formattedDatas.map(({ DATA, DIAS }) => (
            <>
              <Text
                style={[styles.sectionTitle, { color: textColor }, { textTransform: "uppercase" }]}
              >
                {DIAS}
              </Text>
              <View style={[styles.scheduleContainer, { backgroundColor: background2 }]}> 
                {DATA.map((item, index) => {
                  const disabled = false;
                  const unavailable = item.VAGAS === 0;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.card,
                        { borderBottomColor: background },
                        { opacity: disabled ? 0.4 : 1 }
                      ]}
                      onPress={() => {
                        if (disabled) {
                          return setError(
                            "Turma não disponível",
                            "error",
                            5000
                          );
                        }
                        navigation.navigate(
                          "(tabs)/(sports)/freeClassesDetails",
                          {
                            ...item,
                            INSCREVER: String(item.INSCREVER),
                            MATRICULAR: String(item.MATRICULAR),
                            USERAVATAR: selectedAssociated?.AVATAR,
                            USERTITULO: selectedAssociated?.TITULO,
                            IDATIVIDADE: IDENTIFICADOR,
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
                        <Text style={[styles.classTitle, { color: textColor }]}>
                          {item.ATIVIDADE}
                        </Text>
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
                              color="#6f7791"
                              library="material"
                            />
                          </View>
                          <Text style={styles.professor}>
                            {item.PROFESSOR}
                          </Text>
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
                            {item.HRINICIO}
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
              </View>
            </>
          ))}
          {formattedDatas.length === 0 && (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                Nenhuma atividade encontrada
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default FreeClasses;
