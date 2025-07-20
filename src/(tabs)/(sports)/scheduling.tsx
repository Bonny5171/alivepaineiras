import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import Header from '@/components/Header';
import { useThemeColor } from "@/hooks/useThemeColor";
import { useError } from "@/providers/ErrorProvider";
import { listarAgendamentosDatas } from "@/api/app/atividades";
import { IconSymbol } from "@/components/ui/IconSymbol";

export default function SchedulingScreen({ route, navigation }: any) {
  const { setError } = useError();
  const background = useThemeColor({}, 'background');
  const background2 = useThemeColor({}, 'background2');
  const textColor = useThemeColor({}, 'text');
  const text2Color = useThemeColor({}, 'text2');
  const background1 = useThemeColor({}, 'background1');

  // Recebe os parâmetros da navegação
  const {
    IDENTIFICADOR,
    ICONE,
    NOME,
    IDLOCAL,
    ORIENTACAO,
    LOCALIZACAO,
    OBSERVACAO,
    DESCRICAO,
    DESCRICAO_CATEGORIA,
    selectedAssociated
  } = route.params;

  const [data, setData] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const fetchAvailableDates = async () => {
    setIsLoadingData(true);
    try {
      const response = await listarAgendamentosDatas({
        IDLOCAL: IDLOCAL,
        TITULO: "700000"
      });
      if (response[0]?.ERRO) {
        setError(response[0].MSG_ERRO, 'error', 3000);
        navigation.goBack();
        return;
      }
      setData(response);
    } catch (err) {
      setError('Não foi possivel listar os dias disponíveis', 'error', 2000);
      console.log(err);
      navigation.goBack();
    }
    setIsLoadingData(false);
  };

  useEffect(() => {
    fetchAvailableDates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAssociated]);

  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      <Header title={NOME || 'Horários'} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <View style={[styles.card, { backgroundColor: background2 }]}> 
          <Text style={[styles.sectionTitle, { color: textColor }]}>HORÁRIOS</Text>
          {isLoadingData ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#DA1984" />
            </View>
          ) : (
            <>
              {data.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.scheduleItem}
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
                        IDLOCAL,
                        SELECTED_DATE: item.DATA,
                        INSCREVER: String(item.INSCREVER),
                        MATRICULAR: String(item.MATRICULAR),
                        USERAVATAR: selectedAssociated?.AVATAR,
                        USERTITULO: selectedAssociated?.TITULO,
                      }
                    );
                  }}
                >
                  <View style={styles.scheduleItemContent}>
                    <Text style={[styles.classTitle, { color: text2Color }]}>{item.DATA}</Text>
                    <View style={styles.localContainer}>
                      <IconSymbol name="clock" size={15} color="#878da3" library="fontawesome" />
                      <Text style={styles.local}>{item.HORARIOS}</Text>
                    </View>
                    <View style={styles.professorContainer}>
                      <IconSymbol name="calendar" size={15} color="#878da3" library="fontawesome" />
                      <Text style={styles.professor}>{item.DESCRICAO}</Text>
                    </View>
                  </View>
                  <View style={styles.arrowContainer}>
                    <IconSymbol name="chevron-right" size={30} color="#b7bbc8" library="material" />
                  </View>
                </TouchableOpacity>
              ))}
              {data.length === 0 && (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>
                    Nenhuma atividade encontrada
                  </Text>
                </View>
              )}
            </>
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
