import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  Image,
  Linking,
} from "react-native";
import Header from "@/components/Header";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  fetchActivityTerms,
  ActivityTerms,
  exibirDetalhes,
  DetalheAtividadeResponse,
  matricular,
  incluirListaEspera,
  ListarAssociadosMatriculadosResponseItem,
  listarAssociadosMatriculados,
  tranferirMatricula,
  listarDebitos, // ADICIONADO
} from "@/api/app/atividades";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useError } from "@/providers/ErrorProvider";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "@/providers";
import { useConfirmation } from "@/providers/ConfirmProvider";

export default function TransferRegistrationDetailsScreen({ route }: any) {
  const { setError } = useError();
  const navigation = useNavigation();
  const confirm = useConfirmation();

  const background = useThemeColor({}, 'background');
  const background2 = useThemeColor({}, 'background2');
  const textColor = useThemeColor({}, 'text');
  const text2Color = useThemeColor({}, 'text2');

  const {
    IDATIVIDADE,
    ANTIGATURMA,
    TURMA,
    DESCRICAO,
    ICONE,
    USERTITULO,
  } = route.params;

  const [isLoadingActivityDetails, setIsLoadingActivityDetails] = useState(true);
  const [isLoadingRequestActions, setIsLoadingRequestActions] = useState(false);
  const [isLoadingDebitos, setIsLoadingDebitos] = useState(false); // ADICIONADO

  const [modalRegulations, setModalRegulations] = useState<{ isOpen: boolean; toRegister: boolean; action?: any }>({ isOpen: false, toRegister: false });
  const [agreeWithRegulation, setAgreeWithRegulation] = useState(false);
  const [colapsabbleCosts, setColapsabbleCost] = useState(true);

  const [regulation, setRegulation] = useState<string>("");
  const [regulationLink, setRegulationLink] = useState<string>("");
  const [regulationLinkText, setRegulationLinkText] = useState<string>("");
  const [details, setDetails] = useState<DetalheAtividadeResponse>();
  const [debitos, setDebitos] = useState<any[]>([]); // ADICIONADO

  const fetchAcitityDetails = async () => {
    setIsLoadingActivityDetails(true);
    try {
      const response = await exibirDetalhes({
        IDATIVIDADE: Number(IDATIVIDADE),
        IDTURMA: ANTIGATURMA as string,
        TITULO: USERTITULO as string,
      });
      setDetails(response);
      setRegulation(response.REGULAMENTO || "");
      setRegulationLink(response.LINK_ARQUIVO || "");
      setRegulationLinkText(response.TEXTO_LINK || "");
    } catch (err) {
      // setError('Não foi possivel obter os detalhes da atividade')
    }
    setIsLoadingActivityDetails(false);
  };

  const fetchDebitos = async () => {
    setIsLoadingDebitos(true);
    try {
      const debitosData = await listarDebitos({
        TITULO: USERTITULO,
        IDATIVIDADE,
        IDTURMA: TURMA,
      });
      let debitosValidos = Array.isArray(debitosData)
        ? (debitosData as any[]).filter(
            (debito) =>
              !debito.ERRO && debito.VALOR && debito.VALOR !== "0,00" && debito.DESCRICAO
          )
        : [];
      // Ordena pelo campo ORDEM (número crescente)
      (debitosValidos as any[]).sort((a, b) => (a.ORDEM ?? 0) - (b.ORDEM ?? 0));
      setDebitos(debitosValidos);
    } catch (e) {
      setDebitos([]);
    }
    setIsLoadingDebitos(false);
  };

  const handleConfirm = async () => {
    setIsLoadingRequestActions(true);

    // Função para determinar a home correta
    const getHomeRoute = () => {
      const state = navigation.getState && navigation.getState();
      if (state && state.routes) {
        for (let i = state.routes.length - 1; i >= 0; i--) {
          const routeName = state.routes[i].name;
          if (routeName === '(tabs)/(cultural)/home' || routeName === '(tabs)/(sports)/home') {
            return routeName;
          }
        }
      }
      return '(tabs)/(sports)/home';
    };

    try {
      const response = await tranferirMatricula({
        IDATIVIDADE,
        TURMA_ATUAL: ANTIGATURMA,
        TURMA_NOVA: TURMA,
        TITULO: USERTITULO
      });
      if (response.ERRO) {
        setError(response.MSG_ERRO, 'error', 3000);
      } else {
        setError('Sua transferência de matrícula foi realizada com sucesso', 'success', 3000);
        navigation.reset({
          index: 1,
          routes: [
            { name: '(tabs)' },
            { name: getHomeRoute() },
          ]
        } as any);
      }
    } catch (err) {
      setError('Erro ao transferir matrícula', 'error', 3000);
    }

    setIsLoadingRequestActions(false)
  };

  useEffect(() => {
    fetchAcitityDetails();
    fetchDebitos(); // ADICIONADO
  }, []);

  useEffect(() => {
    if (details?.MSG_ERRO) {
      setError(details?.MSG_ERRO, 'error', 3000);
      navigation.goBack();
    }
  }, [details]);

  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      <Header title="Detalhes" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingTop: 32, paddingBottom: 15 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Top */}
        <View style={{ alignItems: "center" }}>
          <View style={styles.iconPlaceholder}>
            <Text>
              <IconSymbol name={ICONE || "list"} size={40} color='#505979' />
            </Text>
          </View>

          <Text style={[styles.titulo, { color: text2Color }]}>{`${DESCRICAO} - ${TURMA}`}</Text>
          <TouchableOpacity
            onPress={() => {
              setModalRegulations({
                isOpen: true,
                toRegister: false,
              });
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 8,
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <Text style={styles.subLink}>Regulamento Interno</Text>
              <IconSymbol
                size={15}
                name="file-text"
                library="fontawesome"
                color="#D03481"
              />
            </View>
          </TouchableOpacity>
        </View>

        <Enrolled TURMA={TURMA} IDATIVIDADE={IDATIVIDADE} />

        {/* Main Informations */}
        <View style={[styles.card, { backgroundColor: background2 }, { gap: 8 }]}>
          {isLoadingActivityDetails ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#DA1984" />
              <Text style={styles.loadingText}>Carregando informações</Text>
            </View>
          ) : (
            <>
              <Info label="Dia(s)" value={details?.DIAS || "--"} />
              <Info label="Horário" value={details?.HORARIO || "--"} />
              <Info label="Professor(a)" value={details?.PROFESSOR || "--"} />
              <Info label="Categoria" value={details?.NIVEL || '--'} />
              <Info label="Local" value={details?.LOCAL || "--"} />
              <Info label="Matrícula" value="Curso sempre cobrado" />
            </>
          )}
        </View>

        {/* Goals */}
        <Text style={[styles.sectionTitle, { color: text2Color }]}>OBJETIVO DA ATIVIDADE</Text>
        <View style={[styles.card, { backgroundColor: background2 }]}>
          {isLoadingActivityDetails ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#DA1984" />
              <Text style={styles.loadingText}>Carregando objetivo</Text>
            </View>
          ) : (
            <Text style={[styles.descricao, { color: text2Color }]}>{details?.OBJETIVO}</Text>
          )}
        </View>

        {/* Coast */}
        <Text style={[styles.sectionTitle, { color: text2Color }]}>COBRANÇA</Text>
        <View style={[styles.card, { backgroundColor: background2 }, { gap: 10 }]}> 
          <TouchableOpacity
            style={[styles.costLine]}
            onPress={() => {
              setColapsabbleCost((prev) => !prev);
            }}
          >
            <View>
              <Text style={[styles.costHeader, { color: textColor }]}>Custos</Text>
            </View>
            {colapsabbleCosts ? (
              <IconSymbol
                name="chevron-up"
                size={18}
                library="fontawesome"
                color="#b7bbc8"
              />
            ) : (
              <IconSymbol
                name="chevron-down"
                size={18}
                library="fontawesome"
                color="#b7bbc8"
              />
            )}
          </TouchableOpacity>
          {colapsabbleCosts ? (
            isLoadingDebitos ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#DA1984" />
                <Text style={styles.loadingText}>Carregando custos</Text>
              </View>
            ) : (() => {
              const debitosValidos = (debitos || []).filter(
                (debito) => !debito.ERRO && debito.VALOR && debito.VALOR !== "0,00" && debito.DESCRICAO
              );

              if (debitosValidos.length > 0) {
                return <>
                  <View style={{ width: "100%", height: 1, backgroundColor: background, marginVertical: 10 }} />
                  {debitosValidos.map((debito, idx) => (
                    <View key={idx} style={[styles.costLine, { marginBottom: 8 }]}>
                      <View>
                        <Text style={[styles.costValue, { color: textColor }]}>{debito.MES || '-'}</Text>
                        {debito.DESCRICAO && (
                          <Text style={styles.costDesc}>{debito.DESCRICAO}</Text>
                        )}
                      </View>
                      <Text style={[styles.costValue, { color: textColor }]}>
                        R$ {debito.VALOR}
                      </Text>
                    </View>
                  ))}
                </>;
              } else {
                return <Text style={styles.costDesc}>Nenhum custo encontrado.</Text>;
              }
            })()
          ) : null}
        </View>
      </ScrollView>

      {/* Button Actions */}
      {(!isLoadingActivityDetails && details) && (
        <ButtonActions
          openRegulations={() => setModalRegulations({ isOpen: true, toRegister: true })}
        />
      )}

      {/* Regulation */}
      <Modal
        visible={modalRegulations.isOpen}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: background2 }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Regulamento interno</Text>
            <ScrollView style={{ marginBottom: 12, maxHeight: 200 }}>
              {isLoadingActivityDetails ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#DA1984" />
                  <Text style={styles.loadingText}>
                    Carregando regulamento...
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={[styles.modalText, { color: '#878da3' }]}>
                    {regulation || "Regulamento não disponível."}
                  </Text>
                  {regulationLink ? (
                    <TouchableOpacity
                      style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center' }}
                      onPress={() => {
                        if (regulationLink) {
                          if (typeof window !== 'undefined' && window.open) {
                            window.open(regulationLink, '_blank');
                          } else {
                            Linking.openURL(regulationLink);
                          }
                        }
                      }}
                    >
                      <IconSymbol
                        size={15}
                        name="file-text"
                        library="fontawesome"
                        color="#D03481"
                      />
                      <Text style={{ color: '#D03481', fontWeight: 'bold', marginLeft: 8 }}>
                        {regulationLinkText || 'Abrir Regulamento Completo'}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              )}
            </ScrollView>

            {modalRegulations.toRegister ? (
              <>
                <View style={styles.checkboxRow}>
                  <Pressable
                    onPress={() => {
                      setAgreeWithRegulation(prev => !prev);
                    }}
                    style={[
                      styles.fakeCheckbox,
                      agreeWithRegulation && styles.checkedBox,
                    ]}
                  >
                    {agreeWithRegulation && (
                      <Text style={{ color: "#fff" }}>✓</Text>
                    )}
                  </Pressable>
                  <Text style={[styles.checkboxLabel, { color: textColor }]}>
                    Eu li e concordo com os termos e condições
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <Pressable
                    style={[styles.actionBtn, { backgroundColor: "#F9D9EB" }]}
                    onPress={() => {
                      setModalRegulations({ isOpen: false, toRegister: false });
                    }}
                  >
                    <Text style={{ color: "#D53F8C", fontWeight: "bold" }}>
                      Cancelar
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, { backgroundColor: "#D53F8C" }]}
                    onPress={() => {
                      if (!agreeWithRegulation) {
                        return setError(
                          "Você precisa aceitar os termos e condições",
                          "error",
                          1000
                        );
                      }
                      setModalRegulations({ isOpen: false, toRegister: false });
                      confirm.showConfirmation(DESCRICAO, async () => {
                        await handleConfirm();
                      }, {
                        abovePasswordComponent: (
                          <View style={{ padding: 16 }}>
                            <Text style={{ color: '#0F1C4799', fontSize: 16, fontWeight: '500', marginBottom: 16 }}>
                              Confirmação de Transferência de Matrícula
                            </Text>
                            <Text style={{ color: '#0F1E47', fontSize: 19, fontWeight: '700', marginBottom: 16 }}>
                              {DESCRICAO} - R${details?.VALOR_MATRICULA}
                            </Text>
                          </View>
                        )
                      });
                    }}
                    disabled={isLoadingRequestActions}
                  >
                    {(isLoadingRequestActions) ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        Continuar
                      </Text>
                    )}
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: "#DA1984" }]}
                  onPress={() => {
                    setModalRegulations({ isOpen: false, toRegister: false });
                  }}
                >
                  <Text style={{ color: "#FFF", fontWeight: "bold" }}>
                    Fechar
                  </Text>
                </Pressable>
              </View>
            )}
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
    overflow: 'hidden'
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
    gap: 8,
    display: 'flex',
    flexDirection: 'column',
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
    fontSize: 18,
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
  enrolledImageContainer: {
    width: 40, height: 40, borderRadius: 28, overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center'
  },
  enrolledAvatarImage: { width: 40, height: 40, borderRadius: 28 },
});

const Enrolled = (props: {
  IDATIVIDADE: string
  TURMA: string
}) => {
  const { TURMA, IDATIVIDADE } = props
  const navigation = useNavigation();

  const AuthContext = useAuth();

  const brand = useThemeColor({}, 'brand');
  const background = useThemeColor({}, 'background');

  const background2 = useThemeColor({}, 'background2');
  const text2Color = useThemeColor({}, 'text2');

  const [enrolled, setEnrolled] = useState<ListarAssociadosMatriculadosResponseItem[]>([]);
  const [isLoadingEnrolled, setIsLoadingEnrolled] = useState(true);

  const fetchEnrolled = async () => {
    setIsLoadingEnrolled(true)

    try {
      const response = await listarAssociadosMatriculados({
        IDATIVIDADE: Number(IDATIVIDADE),
        TURMA,
        TITULO: AuthContext.user
      })
      setEnrolled(response);
    } catch (error) { }

    setIsLoadingEnrolled(false)
  }

  useEffect(() => {
    fetchEnrolled();
  }, [])

  if (!enrolled && !isLoadingEnrolled) return;

  return (
    <>
      <Text style={[styles.sectionTitle, { color: text2Color }]}>TURMA {TURMA}</Text>
      <View style={[styles.card, { backgroundColor: background2 }]}>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {enrolled.slice(0, 10).map((item) => {
            const getInitials = () => {
              if (!item.NOME) return '';
              const nameParts = item.NOME.split(' ');
              if (nameParts.length > 1) {
                return `${nameParts[0][0]}${nameParts[1][0]}`;
              }
              return nameParts[0][0];
            };
            return (
              <View style={[styles.enrolledImageContainer, { marginLeft: -15, borderWidth: 2, backgroundColor: '#eee', borderColor: background }]}>
                {item.AVATAR ? (
                  <Image source={{ uri: item.AVATAR }} style={[styles.enrolledAvatarImage]} />
                ) : (
                  <Text style={{ color: '#0F1C47' }}>{getInitials()}</Text>
                )}
              </View>
            )
          })}
          {enrolled.length > 10 && (
            <Text style={{ fontSize: 12, fontWeight: '600', color: text2Color, marginLeft: 10 }}>+{enrolled.length - 10}</Text>
          )}
        </View>

        <TouchableOpacity
          style={{ marginTop: 25 }}
          onPress={() => {
            navigation.navigate('(tabs)/(sports)/enrolledGroup', {
              DATA: enrolled,
              TURMA
            })
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: '400', color: brand, textAlign: 'center' }}>Ver Matriculados</Text>
        </TouchableOpacity>
      </View>
    </>
  )
}

const ButtonActions = (props: {
  openRegulations: () => void
}) => {
  const { openRegulations } = props

  const background2 = useThemeColor({}, 'background2');

  return (
    <View style={[styles.botaoContainer, { backgroundColor: background2 }]}>
      <TouchableOpacity
        style={[styles.botao]}
        onPress={openRegulations}
      >
        <Text style={styles.textoBotao}>
          Confirmar troca
        </Text>
      </TouchableOpacity>
    </View>
  )
};

function Info({ label, value }: { label: string; value: string | string[] }) {
  const text2Color = useThemeColor({}, 'text2');

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ fontSize: 15, color: "#878da3" }}>{label}</Text>
      <Text style={{ fontSize: 15, color: text2Color }}>
        {value?.toString()}
      </Text>
    </View>
  );
}
