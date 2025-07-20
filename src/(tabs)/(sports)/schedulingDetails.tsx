import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
} from "react-native";
import Header from "@/components/Header";
import { useThemeColor } from "@/hooks/useThemeColor";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useError } from "@/providers/ErrorProvider";
import { AgendamentoDetalhes, cancelarAgendamentos, exibirDetalhesAgendamento, gravarAgendamento } from "@/api/app/atividades";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useConfirmation } from "@/providers/ConfirmProvider";

export default function SchedulingDetailsScreen({ route }: any) {
  const { setError } = useError();
  const navigation = useNavigation();
  const confirm = useConfirmation();

  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingRequestActions, setIsLoadingRequestActions] = useState(false);

  const [details, setDetails] = useState<AgendamentoDetalhes>();

  const [modalActions, setModalActions] = useState<{ isOpen: boolean; action?: any }>({ isOpen: false });

  const background = useThemeColor({}, 'background');
  const background2 = useThemeColor({}, 'background2');
  const textColor = useThemeColor({}, 'text');
  const text2Color = useThemeColor({}, 'text2');

  const {
    DESCRICAO,
    ATIVIDADE,
    ICONE, // Alterado de ICONE_NOVO para ICONE
    ICONE_NOVO,
    USERNAME,
    LOCALIZACAO,
    HRINICIO,
    ORIENTACAO,
    DIAS,
    OBSERVACAO,
    IDAGENDAMENTO
  } = route.params;

  const fetchDetails = async () => {
    setIsLoadingDetails(true);

    try {
      const response = await exibirDetalhesAgendamento(IDAGENDAMENTO);
      setDetails(response);
    } catch (err) {
      navigation.navigate("(tabs)/(sports)/home");
    }
    setIsLoadingDetails(false);
  };

  const handleConfirm = async () => {
    setIsLoadingRequestActions(true);
    try {
      const response = await gravarAgendamento(HRINICIO);
      if (response.ERRO) {
        setError(response.MSG_ERRO, 'error', 3000);
        navigation.reset({
          index: 1,
          routes: [
            { name: '(tabs)' as never },
            { name: '(tabs)/(sports)/home' as never }
          ]
        });
      } else {
        setError("Agendamento efetuado com sucesso", "success", 3000);
        navigation.reset({
          index: 1,
          routes: [
            { name: '(tabs)' as never },
            { name: '(tabs)/(sports)/home' as never }
          ]
        });
      }
    } catch (error) {
      setError("Erro ao realizar agendamento", "error", 3000);
      navigation.reset({
        index: 1,
        routes: [
          { name: '(tabs)' as never },
          { name: '(tabs)/(sports)/home' as never }
        ]
      });
    } finally {
      setIsLoadingRequestActions(false);
    }
  };

  const handleCancelar = async () => {
    setIsLoadingRequestActions(true);
    try {
      const response = await cancelarAgendamentos(IDAGENDAMENTO);
      if (response.ERRO) {
        setError(response.MSG_ERRO, 'error', 3000);
        navigation.reset({
          index: 1,
          routes: [
            { name: '(tabs)' as never },
            { name: '(tabs)/(sports)/home' as never }
          ]
        });
      } else {
        setError("Agendamento cancelado com sucesso", "success", 3000);
        navigation.reset({
          index: 1,
          routes: [
            { name: '(tabs)' as never },
            { name: '(tabs)/(sports)/home' as never }
          ]
        });
      }
    } catch (error) {
      setError("Erro ao cancelar agendamento", "error", 3000);
      navigation.reset({
        index: 1,
        routes: [
          { name: '(tabs)' as never },
          { name: '(tabs)/(sports)/home' as never }
        ]
      });
    } finally {
      setIsLoadingRequestActions(false);
    }
  };

  useEffect(() => {
    if (IDAGENDAMENTO) {
      fetchDetails();
    }
  }, [IDAGENDAMENTO]);

  function formatDateBr(dateStr?: string): string {
    if (!dateStr) return '--';
    // Aceita tanto 2025-06-07 quanto 07/06/2025
    if (/\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    if (/\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
      return dateStr;
    }
    return dateStr;
  }

  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      <Header title="Detalhes do agendamento" backRoute="/(tabs)/(sports)/home" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingTop: 32, paddingBottom: 15 }}
        showsVerticalScrollIndicator={true}
      >
        <View style={{ alignItems: "center" }}>
          <View style={styles.iconPlaceholder}>
            <Text>
              <IconSymbol name={ICONE || ICONE_NOVO} size={40} library='fontawesome' color={'#505979'} />
            </Text>
          </View>
          <Text style={[styles.titulo, { color: text2Color }]}>{DESCRICAO}</Text>
          <Text style={[styles.subLink, { color: "#636d8e", fontWeight: '400', marginBottom: 8 }]}>Agendamento</Text>
        </View>

        <View style={[styles.card, { backgroundColor: background2 }, { gap: 8, marginTop: 10 }]}> 
          {isLoadingDetails ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#DA1984" />
              <Text style={styles.loadingText}>Carregando informações</Text>
            </View>
          ) : IDAGENDAMENTO ? (
            <>
              <Info label="Associado" value={details?.ASSOCIADO || "--"} />
              <Info label="Dia(s)" value={formatDateBr(details?.DATA)} />
              <Info label="Horário" value={details?.HORARIO || "--"} />
              <Info label="Local" value={details?.LOCALIZACAO || '--'} />
            </>
          ) : (
            <>
              <Info label="Associado" value={USERNAME || "--"} />
              <Info label="Dia(s)" value={formatDateBr(DIAS)} />
              <Info label="Horário" value={HRINICIO || "--"} />
              <Info label="Observação" value={OBSERVACAO || "--"} />
              <Info label="Local" value={LOCALIZACAO || '--'} />
            </>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: textColor }]}>DESCRIÇÃO DA ATIVIDADE</Text>
        <View style={[styles.card, { backgroundColor: background2 }]}>
          {isLoadingDetails ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#DA1984" />
              <Text style={styles.loadingText}>Carregando objetivo</Text>
            </View>
          ) : (
            <Text style={[styles.descricao, { color: text2Color }]}>
              {IDAGENDAMENTO ? details?.ORIENTACAO : ORIENTACAO}
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={[styles.botaoContainer, { backgroundColor: background2 }]}>
        {IDAGENDAMENTO ? (
          <TouchableOpacity
            style={[styles.botao, { backgroundColor: "#FF3F3F" }]}
            onPress={() => {
              setModalActions({
                isOpen: true,
                action: () => {
                  confirm.showConfirmation(DESCRICAO, async () => {
                    await handleCancelar();
                  }, {
                    abovePasswordComponent: (
                      <View style={{ padding: 16 }}>
                        <Text style={{ color: '#0F1C4799', fontSize: 16, fontWeight: '500', marginBottom: 16 }}>
                          Confirmação de Cancelamento de Agendamento
                        </Text>
                        <Text style={{ color: text2Color, fontSize: 19, fontWeight: '700', marginBottom: 16 }}>
                          {DESCRICAO} - {formatDateBr(details?.DATA)} - {details?.HORARIO || '--'}
                        </Text>
                      </View>
                    )
                  });
                }
              });
            }}
            disabled={isLoadingRequestActions}
          >
            <Text style={[styles.textoBotao]}>
              Cancelar agendamento
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.botao]}
            onPress={() => {
              confirm.showConfirmation(DESCRICAO, async () => {
                await handleConfirm();
              }, {
                abovePasswordComponent: (
                  <View style={{ padding: 16 }}>
                    <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '500', marginBottom: 16 }}>
                      Confirmação de Agendamento
                    </Text>
                    <Text style={{ color: text2Color, fontSize: 19, fontWeight: '700', marginBottom: 16 }}>
                      {DESCRICAO} - {formatDateBr(DIAS)} - {HRINICIO || '--'}
                    </Text>
                  </View>
                )
              });
            }}
            disabled={isLoadingRequestActions}
          >
            <Text style={[styles.textoBotao]}>
              Confirmar agendamento
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Cancelamento */}
      <Modal
        visible={modalActions.isOpen}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: background2 }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Cancelamento
            </Text>
            <Text style={[{ color: "#878da3", marginBottom: 36, fontSize: 15, fontWeight: '400' }]}>
              Tem certeza que deseja cancelar seu agendamento em {details?.GRUPO}?
            </Text>
            {details?.AVISO_CANCELAMENTO && (
              <>
                <Text style={[{ color: text2Color, marginBottom: 10, fontSize: 18, fontWeight: '800' }]}>
                  Aviso de cancelamento
                </Text>
                <Text style={[{ color: "#878da3", marginBottom: 36, fontSize: 15, fontWeight: '400' }]}>
                  {details.AVISO_CANCELAMENTO}
                </Text>
              </>
            )}
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: "#ffefec" }]}
                disabled={isLoadingRequestActions}
                onPress={() => setModalActions({ isOpen: false })}
              >
                <Text style={{ color: "#FF3F3F", fontWeight: "bold" }}>
                  Não
                </Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: "#FF3F3F" }]}
                onPress={() => {
                  setModalActions({ isOpen: false });
                  modalActions.action();
                }}
                disabled={isLoadingRequestActions}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Continuar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  iconPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: "#ced2e6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    alignSelf: "center",
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A202C",
    marginBottom: 8,
    textAlign: "center",
  },
  subLink: {
    color: "#D03481",
    fontSize: 15,
    textAlign: "center",
    fontWeight: "600",
  },
  status: { fontSize: 13, marginBottom: 16, textAlign: "center" },
  statusTag: {
    backgroundColor: "#07e56e",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: "#000",
  },
  associateAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: "#a3aac3",
    borderWidth: 2,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionContainer: {
    borderRadius: 20,
    overflow: "hidden",
    padding: 0,
    marginVertical: 10,
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "400",
    marginVertical: 4,
    paddingHorizontal: 16,
    color: "#39456a",
  },
  descricao: { fontSize: 13, color: "#6f7791" },
  costHeader: { fontWeight: "bold", fontSize: 15, color: "#0F1C47" },
  costLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  costLabel: { fontWeight: "bold", fontSize: 15, color: "#6f7791" },
  costDesc: { fontSize: 12, color: "#6f7791" },
  costValue: { fontWeight: "bold", fontSize: 15, color: "#0F1C47" },
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
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A202C",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  fakeCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#D53F8C",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  checkedBox: {
    backgroundColor: "#D53F8C",
    borderColor: "#D53F8C",
  },
  checkboxLabel: {
    fontSize: 14,
    marginLeft: 8,
    color: "#1A202C",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  toast: {
    position: "absolute",
    top: "50%",
    left: 16,
    right: 16,
    backgroundColor: "#48BB78",
    padding: 16,
    borderRadius: 24,
    transform: [{ translateY: -50 }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  toastMessage: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
    textAlign: "center",
  },
  loadingContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    backgroundColor: "#FED7D7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#C53030",
    fontSize: 14,
  },
});

function Info({ label, value }: { label: string; value: string | string[] }) {
  const text2Color = useThemeColor({}, 'text2');

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ fontSize: 15, color: "#6f7791" }}>{label}</Text>
      <Text style={{ fontSize: 15, color: text2Color, flex: 1, textAlign: 'right' }}>
        {value?.toString()}
      </Text>
    </View>
  );
}