import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import Header from '@/components/Header';
import { useThemeColor } from "@/hooks/useThemeColor";
import { listarAgendamentosDatas, listarAgendamentosTurmas } from "@/api/app/atividades";
import { IconSymbol } from "@/components/ui/IconSymbol";
import styles from "./schedulesStyles";
import { useAuth } from "@/providers";

const Scheduling = (props: {
  IDENTIFICADOR: string;
  ICONE: string;
  NOME: string;
  IDLOCAL: string;
  ORIENTACAO: string;
  LOCALIZACAO: string;
  OBSERVACAO: string;
  DESCRICAO: string;
  DESCRICAO_CATEGORIA: string;
  selectedAssociated: any;
  IDGRUPO?: string;
}) => {
  const { setError } = useError();
  const navigation = useNavigation();

  const AuthContext = useAuth();

  const background1 = useThemeColor({}, 'background1');
  const textColor = useThemeColor({}, 'text');
  const background2 = useThemeColor({}, 'background2');
  const textColor = useThemeColor({}, 'text');
  const text2Color = useThemeColor({}, 'text2');

  const [turmas, setTurmas] = useState<any[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [isLoadingTurmas, setIsLoadingTurmas] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const { selectedAssociated, IDLOCAL, IDGRUPO, ICONE, NOME, LOCALIZACAO, OBSERVACAO, ORIENTACAO, DESCRICAO, DESCRICAO_CATEGORIA } = props;

  // Buscar turmas ao montar
  useEffect(() => {
    const fetchTurmas = async () => {
      setIsLoadingTurmas(true);
      try {
        const response = await listarAgendamentosTurmas(IDGRUPO);
        if (response[0]?.ERRO) {
          setError(response[0].MSG_ERRO, 'error', 3000);
          return navigation.goBack();
        }
        setTurmas(response);
      } catch (err) {
        setError('Não foi possível listar as turmas', 'error', 2000);
        navigation.goBack();
      }
      setIsLoadingTurmas(false);
    };
    fetchTurmas();
  }, [IDLOCAL]);

  // Buscar datas quando uma turma for selecionada
  useEffect(() => {
    const fetchAvailableDates = async () => {
      if (!selectedTurma) return;
      setIsLoadingData(true);
      try {
        const response = await listarAgendamentosDatas({
          IDLOCAL: selectedTurma.IDLOCAL,
          TITULO: AuthContext.user
        });
        if (response[0]?.ERRO) {
          setError(response[0].MSG_ERRO, 'error', 3000);
          return navigation.goBack();
        }
        setData(response);
      } catch (err) {
        setError('Não foi possivel listar os dias disponíveis', 'error', 2000);
        navigation.goBack();
      }
      setIsLoadingData(false);
    };
    fetchAvailableDates();
  }, [selectedTurma, selectedAssociated]);

  return (
    <View>
      <Text style={[styles.sectionTitle, { color: textColor }]}>HORÁRIOS</Text>
      {isLoadingTurmas ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DA1984" />
        </View>
      ) : turmas.length > 0 && !selectedTurma ? (
        <View style={styles.scheduleContainer}>
          <Text style={{ color: text2Color, marginBottom: 8 }}>Selecione uma turma:</Text>
          {turmas.map((turma, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.card, { borderBottomColor: background1 }]}
              onPress={() => setSelectedTurma(turma)}
            >
              <View style={styles.cardTextContainer}>
                <Text style={[styles.classTitle, { color: text2Color }]}>{turma.ATIVIDADE}</Text>
                <Text style={styles.local}>{turma.LOCALIZACAO}</Text>
                <Text style={styles.professor}>{turma.OBSERVACAO}</Text>
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
          ))}
        </View>
      ) : isLoadingData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DA1984" />
        </View>
      ) : (
        <View style={[styles.scheduleContainer, { backgroundColor: background2 }]}> 
          {data.map((item, index) => {
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.card,
                  { borderBottomColor: background1 }
                ]}
                onPress={() => {
                  navigation.navigate(
                    "(tabs)/(sports)/schedulingCalendar",
                    {
                      ICONE_NOVO: ICONE,
                      DESCRICAO,
                      DESCRICAO_CATEGORIA,
                      NOME,
                      LOCALIZACAO,
                      OBSERVACAO,
                      ORIENTACAO,
                      // Passa o IDLOCAL da turma selecionada
                      IDLOCAL: selectedTurma.IDLOCAL,
                      SELECTED_DATE: item.DATA,
                      INSCREVER: String(item.INSCREVER),
                      MATRICULAR: String(item.MATRICULAR),
                      USERAVATAR: selectedAssociated?.AVATAR,
                      USERTITULO: selectedAssociated?.TITULO,
                    }
                  );
                }}
              >
                <View style={styles.cardTextContainer}>
                  <Text style={[styles.classTitle, { color: text2Color }]}>{item.DATA}</Text>
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
                        name="clock"
                        size={15}
                        color="#878da3"
                        library="fontawesome"
                      />
                    </View>
                    <Text style={[styles.local]}>
                      {item.HORARIOS}
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
                        name="calendar"
                        size={15}
                        color="#878da3"
                        library="fontawesome"
                      />
                    </View>
                    <Text style={styles.professor}>{item.DESCRICAO}</Text>
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
          {data.length === 0 && (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                Nenhuma atividade encontrada
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  sectionTitle: { fontSize: 14, fontWeight: '400', marginBottom: 8, paddingHorizontal: 0, color: '#39456a' },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  scheduleItemContent: { flex: 1, paddingRight: 12 },
  classTitle: { fontWeight: '600', fontSize: 17 },
  localContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  professorContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  local: { fontSize: 13, color: '#878da3', marginLeft: 6 },
  professor: { fontSize: 13, color: '#878da3', marginLeft: 6 },
  arrowContainer: {},
  emptyStateContainer: {
    flex: 1,
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
    padding: 16,
  },
});

// Arquivo movido para app/(tabs)/(sports)/scheduling.tsx
