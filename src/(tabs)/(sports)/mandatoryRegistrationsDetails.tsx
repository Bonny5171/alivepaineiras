import React, { useState, useEffect, useCallback } from "react";
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
  ListarAssociadosMatriculadosResponseItem,
  listarAssociadosMatriculados,
  incluirListaEspera,
  cancelarMatricula,
  cancelarListaDeEspera,
  desistirCancelamento,
  listarDebitos,
  listarAgendamentos,
} from "@/api/app/atividades";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useError } from "@/providers/ErrorProvider";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "@/providers";
import { useConfirmation } from '@/providers/ConfirmProvider';
import { Enrolled } from "@/components/Enrolled";
import { ButtonActions } from "@/components/ButtonActions";
import { Info } from "@/components/Info";
import { exibirConsulta, listarConsultas, listarConsultasCanceladas } from "@/api/app/appointments";

export default function MandatoryRegistrationDetailsScreen({ route }: any) {
  const { setError } = useError();
  const navigation = useNavigation();
  const confirm = useConfirmation();

  const background = useThemeColor({}, "background");
  const background2 = useThemeColor({}, "background2");
  const textColor = useThemeColor({}, "text");
  const text2Color = useThemeColor({}, "text2");
  const tertiaryText = useThemeColor({}, "tertiaryText")

  const {
    IDATIVIDADE,
    TURMA,
    DESCRICAO,
    VAGAS,
    IDAREA,
    POSICAO,
    ICONE,
    USERTITULO,
    USERAVATAR,
    DESCRICAO_CATEGORIA,
    STATUS_LABEL,
    STATUS_COLOR,
    TITULO,
    IDENTIFICADOR,
    NOME,
    CATEGORY,
    IDCONSULTA,
  } = route.params;

  const [isLoadingActivityDetails, setIsLoadingActivityDetails] = useState(true);
  const [isLoadingRequestActions, setIsLoadingRequestActions] = useState(false);
  const [agreeWithRegulation, setAgreeWithRegulation] = useState(false);
  const [colapsabbleCosts, setColapsabbleCost] = useState(true);
  const [modalRegulations, setModalRegulations] = useState<{ isOpen: boolean; toRegister: boolean; actionType?: string }>({ isOpen: false, toRegister: false });
  const [modalActions, setModalActions] = useState<{ isOpen: boolean; message: string; action?: any }>({ message: '', isOpen: false });

  const [details, setDetails] = useState({});
  const [regulation, setRegulation] = useState<string>("");
  const [regulationLink, setRegulationLink] = useState<string>("");
  const [regulationLinkText, setRegulationLinkText] = useState<string>("");
  const [debitos, setDebitos] = useState<any[]>([]);
  const [isLoadingDebitos, setIsLoadingDebitos] = useState(false);


  // Função para encontrar a última home válida no histórico
  const getHomeRoute = () => {
    const state = navigation.getState && navigation.getState();
    console.log('NAVIGATION STATE:', state);
    if (state && state.routes) {
      // Procura do fim para o início
      for (let i = state.routes.length - 1; i >= 0; i--) {
        const routeName = state.routes[i].name;
        if (routeName === '(tabs)/(cultural)/home' || routeName === '(tabs)/(sports)/home') {
          return routeName;
        }
      }
    }
    // Default caso não encontre
    return '(tabs)/(sports)/home';
  };

  const DATAS_BY_STATUS = {
    Matriculado: {
      statusLabel: "Matriculado",
      bgColor: "#35E07C",
    },
    "Em espera": {
      statusLabel: `${POSICAO}ª Posiçao`,
      bgColor: "#EA9610",
    },
    Inscrito: {
      statusLabel: `${POSICAO}ª Posição`,
      bgColor: "#EA9610",
    },
    "Cancelado": {
      statusLabel: `Cancelado`,
      bgColor: "#FF3F3F",
    }
  }[details?.STATUS as string];

  const fetchAcitityDetails = async () => {

    setIsLoadingActivityDetails(true);

    if (IDAREA === 4) {
      const response = await listarAgendamentos({ TITULO, IDAREA });
      const CONSULTA = response[0];

      setDetails({
        ...CONSULTA,
        ASSOCIADO: CONSULTA.NOME,
        NIVEL: CATEGORY,
        LOCAL: CONSULTA.LOCALIDADE,
        DIAS: CONSULTA.DATA,
        OBJETIVO: CONSULTA.DESCRICAO,
      });

    } else if (IDAREA === 3) {
      const isStatusCanceled = STATUS_LABEL == 'Cancelado';

      const response = isStatusCanceled
        ? await listarConsultasCanceladas(TITULO)
        : await listarConsultas(TITULO);

      const responseFiltered = isStatusCanceled
        ? response.filter((item) => item.IDCONSULTA === IDCONSULTA)
        : response.filter((item) => item.IDCONSULTA === IDENTIFICADOR)

      const LISTA_CONSULTA = responseFiltered[0];
      const CONSULTA = await exibirConsulta(LISTA_CONSULTA.IDCONSULTA);

      setDetails({
        ...CONSULTA[0],
        ...responseFiltered[0],
        ASSOCIADO: NOME
      });
    } else {
      try {
        const response = await exibirDetalhes({
          IDATIVIDADE: Number(IDATIVIDADE),
          IDTURMA: TURMA as string,
          TITULO: USERTITULO as string,
        });

        setDetails(response);
        setRegulation(response.REGULAMENTO || "");
        setRegulationLink(response.LINK_ARQUIVO || "");
        setRegulationLinkText(response.TEXTO_LINK || "");

      } catch (err) { }
    }

    setIsLoadingActivityDetails(false);
  };

  const fetchDebitos = async () => {
    setIsLoadingDebitos(true);
    try {
      const debitosData = await listarDebitos({
        TITULO: USERTITULO || TITULO,
        IDATIVIDADE,
        IDTURMA: TURMA,
      });

      let debitosValidos = Array.isArray(debitosData) ? debitosData.filter(
        (debito) => !debito.ERRO && debito.VALOR && debito.VALOR !== "0,00" && debito.DESCRICAO
      ) : [];
      // Ordena pelo campo ORDEM (número crescente)
      debitosValidos.sort((a, b) => (a.ORDEM ?? 0) - (b.ORDEM ?? 0));
      setDebitos(debitosValidos);
    } catch (e) {
      setDebitos([]);
    }
    setIsLoadingDebitos(false);
  };

  const handleMatricular = async () => {
    setIsLoadingRequestActions(true);
    try {
      const response = await matricular({
        IDATIVIDADE,
        IDTURMA: TURMA,
        TITULO: USERTITULO,
      });
      if (response.ERRO) {
        setError(response.MSG_ERRO);
        navigation.reset({
          index: 0,
          routes: [
            { name: '(tabs)' as never },
            { name: getHomeRoute() as never }
          ]
        });
      } else {
        setError("Matricula efetuada com sucesso", "success", 3000);
        navigation.reset({
          index: 0,
          routes: [
            { name: '(tabs)' as never },
            { name: getHomeRoute() as never }
          ]
        });
      }
    } catch (error) {
      console.log(error);
      setError("Erro ao efetuar matricula", "error", 3000);
      navigation.reset({
        index: 0,
        routes: [
          { name: '(tabs)' as never },
          { name: getHomeRoute() as never }
        ]
      });
    }
    setIsLoadingRequestActions(false);
  };

  const handleIncluir = async () => {
    setIsLoadingRequestActions(true);
    try {
      let response = await incluirListaEspera({
        IDATIVIDADE,
        IDTURMA: TURMA,
        TITULO: USERTITULO,
      });
      // Se for array, pega o primeiro item
      if (Array.isArray(response)) {
        response = response[0];
      }
      if (response.ERRO) {
        setError(response.MSG_ERRO);
        // Não faz reset de navegação em caso de erro
      } else {
        setError("Associado incluido na lista de espera", "success", 3000);
        navigation.reset({
          index: 0,
          routes: [
            { name: '(tabs)' as never },
            { name: getHomeRoute() as never }
          ]
        });
      }
    } catch (error) {
      console.log(error);
      setError("Erro ao entrar na lista de espera", "error", 3000);
      navigation.reset({
        index: 0,
        routes: [
          { name: '(tabs)' as never },
          { name: getHomeRoute() as never }
        ]
      });
    }
    setIsLoadingRequestActions(false);
  };

  const handleCancelarMatricula = async () => {
    setIsLoadingRequestActions(true);
    try {
      const response = await cancelarMatricula({
        IDATIVIDADE,
        IDTURMA: TURMA,
        TITULO: USERTITULO,
      });
      if (response.ERRO) {
        setError(response.MSG_ERRO);
        navigation.reset({
          index: 0,
          routes: [
            { name: '(tabs)' as never },
            { name: getHomeRoute() as never }
          ]
        });
      } else {
        setError("Matricula cancelada com sucesso", "success", 3000);
        navigation.reset({
          index: 0,
          routes: [
            { name: '(tabs)' as never },
            { name: getHomeRoute() as never }
          ]
        });
      }
    } catch (error) {
      console.log(error);
      setError("Erro ao cancelar matricula", "error", 3000);
      navigation.reset({
        index: 0,
        routes: [
          { name: '(tabs)' as never },
          { name: getHomeRoute() as never }
        ]
      });
    }
    setIsLoadingRequestActions(false);
  };

  const handleCancelarEspera = async () => {
    setIsLoadingRequestActions(true);
    try {
      const response = await cancelarListaDeEspera({
        IDATIVIDADE,
        IDTURMA: TURMA,
        TITULO: USERTITULO,
      });
      if (response.ERRO) {
        setError(response.MSG_ERRO);
        navigation.reset({
          index: 0,
          routes: [
            { name: '(tabs)' as never },
            { name: getHomeRoute() as never }
          ]
        });
      } else {
        setError("Associado saiu da lista de espera", "success", 3000);
        navigation.reset({
          index: 0,
          routes: [
            { name: '(tabs)' as never },
            { name: getHomeRoute() as never }
          ]
        });
      }
    } catch (error) {
      console.log(error);
      setError("Erro ao sair da lista de espera", "error", 3000);
      navigation.reset({
        index: 0,
        routes: [
          { name: '(tabs)' as never },
          { name: getHomeRoute() as never }
        ]
      });
    }
    setIsLoadingRequestActions(false);
  };

  const handleCancelarCancelamento = async () => {
    setIsLoadingRequestActions(true);
    try {
      const response = await desistirCancelamento({
        IDATIVIDADE,
        IDTURMA: TURMA,
        TITULO: USERTITULO,
      });
      if (response.ERRO) {
        setError(response.MSG_ERRO);
        navigation.reset({
          index: 0,
          routes: [
            { name: '(tabs)' as never },
            { name: getHomeRoute() as never }
          ]
        });
      } else {
        setError("Associado desistiu do cancelamento com sucesso", "success", 3000);
        navigation.reset({
          index: 0,
          routes: [
            { name: '(tabs)' as never },
            { name: getHomeRoute() as never }
          ]
        });
      }
    } catch (error) {
      console.log(error);
      setError("Erro ao desistir do cancelamento", "error", 3000);
      navigation.reset({
        index: 0,
        routes: [
          { name: '(tabs)' as never },
          { name: getHomeRoute() as never }
        ]
      });
    }
    setIsLoadingRequestActions(false);
  };

  useEffect(() => {
    fetchAcitityDetails();
    if (IDAREA !== 3) {
      fetchDebitos();
    }
    // fetchRegulation removido
  }, []);

  useEffect(() => {
    if (details?.MSG_ERRO) {
      console.log('USER EFFECT [DETAILS]', details?.MSG_ERRO)
      setError(details?.MSG_ERRO, "error", 3000);
      navigation.goBack();
    }
  }, [details]);

  // Handler fixo para o botão Continuar do modal de regulamento
  const handleRegulationContinue = async () => {
    if (!agreeWithRegulation) {
      return setError(
        "Você precisa aceitar os termos e condições",
        "error",
        1000
      );
    }
    if (modalRegulations.actionType === "matricular") {
      confirm.showConfirmation(DESCRICAO, async () => {
        setIsLoadingRequestActions(true);
        try {
          await handleMatricular();
        } catch (e: any) {
          setError("Erro ao efetuar matrícula", "error", 3000);
          navigation.reset({
            index: 0,
            routes: [
              { name: '(tabs)' as never },
              { name: getHomeRoute() as never }
            ]
          });
        } finally {
          setIsLoadingRequestActions(false);
        }
      }, {
        abovePasswordComponent: (
          <View style={styles.confirmationContainer}>
            <Text style={[styles.confirmationLabel, { color: tertiaryText }]}>
              Confirmação de Matrícula
            </Text>
            <Text style={[styles.confirmationTitle, { color: text2Color }]}>
              {DESCRICAO} - R$ {details?.VALOR_MATRICULA}
            </Text>
          </View>
        ),
      });
    } else if (modalRegulations.actionType === "incluir") {
      confirm.showConfirmation(DESCRICAO, async () => {
        setIsLoadingRequestActions(true);
        try {
          await handleIncluir();
        } catch (e: any) {
          setError("Erro ao entrar na lista de espera", "error", 3000);
          navigation.reset({
            index: 0,
            routes: [
              { name: '(tabs)' as never },
              { name: getHomeRoute() as never }
            ]
          });
        } finally {
          setIsLoadingRequestActions(false);
        }
      }, {
        abovePasswordComponent: (
          <View style={styles.confirmationContainer}>
            <Text style={[styles.confirmationLabel, { color: tertiaryText }]}>
              Inscrição na Lista de Espera
            </Text>
            <Text style={[styles.confirmationTitle, { color: text2Color }]}>
              {DESCRICAO}
            </Text>
          </View>
        )
      });
    }
    setModalRegulations({ isOpen: false, toRegister: false });
  };

  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      <Header title="Detalhes" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingTop: 32,
          paddingBottom: 15,
        }}
        showsVerticalScrollIndicator={true}
      >
        {/* Top */}
        <View style={{ alignItems: "center" }}>
          <View style={styles.iconPlaceholder}>
            <Text>
              <IconSymbol
                name={ICONE}
                size={40}
                library="fontawesome"
                color={"#505979"}
              />
            </Text>
          </View>

          {
            IDAREA === 3 ? (
              details?.ESPECIALIDADE ? (
                <Text style={[styles.titulo, { color: text2Color }]}>
                  {details.ESPECIALIDADE}
                </Text>
              ) : (
                <ActivityIndicator size="small" color="#DA1984" />
              )
            ) : (
              <Text style={[styles.titulo, { color: text2Color }]}>
                {`${DESCRICAO} - ${TURMA}`}
              </Text>
            )
          }

          {IDAREA === 3
          ? (<TouchableOpacity
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
                  // marginBottom: 8,
                  marginVertical: 20,
                }}
              >
                <Text style={styles.subLink}>Informações</Text>
                <IconSymbol
                  size={15}
                  name="file-text"
                  library="fontawesome"
                  color="#D03481"
                />
              </View>
            </TouchableOpacity>)
          : (<TouchableOpacity
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
                marginBottom: 8,
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
            </TouchableOpacity>)
          }

          {!isLoadingActivityDetails && details && IDAREA !== 3 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 13, color: textColor, marginRight: 4 }}>
                Status:{" "}
              </Text>
              <View
                style={[
                  styles.statusTag,
                  STATUS_COLOR && STATUS_COLOR.length > 0
                    ? { backgroundColor: STATUS_COLOR }
                    : Number(VAGAS) > 0
                      ? { backgroundColor: "#35E07C" }
                      : { backgroundColor: "#EA9610" },
                  DATAS_BY_STATUS && !STATUS_COLOR && {
                    backgroundColor: DATAS_BY_STATUS?.bgColor,
                  },
                ]}
              >
                <Text style={[
                  styles.statusText,
                  details.STATUS === 'Cancelado' && { color: '#FFF' }
                ]}>
                  {STATUS_LABEL
                    ? STATUS_LABEL
                    : DATAS_BY_STATUS
                      ? DATAS_BY_STATUS?.statusLabel
                      : Number(VAGAS) > 0
                        ? "Vagas disponíveis"
                        : "Lista de espera"}
                </Text>
              </View>
              <View style={styles.associateAvatar}>
                {USERAVATAR ? (
                  <Image
                    resizeMode="contain"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    source={{ uri: USERAVATAR as string }}
                  />
                ) : (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' }}>
                    <Text style={{ color: '#0F1C47', fontWeight: 'bold', fontSize: 18 }}>
                      {(() => {
                        // Prefer ASSOCIADO, fallback to DESCRICAO, then USERTITULO
                        const name = (typeof details?.ASSOCIADO === 'string' && details.ASSOCIADO)
                          || (typeof DESCRICAO === 'string' && DESCRICAO)
                          || (typeof USERTITULO === 'string' && USERTITULO)
                          || '';
                        if (!name) return '';
                        const nameParts = name.trim().split(/\s+/);
                        if (nameParts.length === 1) {
                          return nameParts[0][0].toUpperCase();
                        }
                        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
                      })()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {details?.STATUS === "Matriculado" && (
          <Enrolled TURMA={TURMA} IDATIVIDADE={IDATIVIDADE} />
        )}

        {/* Main Informations */}
        <View
          style={[styles.card, { backgroundColor: background2 }, { gap: 8 }]}
        >
          {isLoadingActivityDetails ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#DA1984" />
              <Text style={styles.loadingText}>Carregando informações</Text>
            </View>
          ) : (
            <>
              <Info label="Associado" value={details?.ASSOCIADO || "--"} />
              {IDAREA === 3 ? (<Info label="Dia(s)" value={details?.DATA || "--"} />) : (<Info label="Dia(s)" value={details?.DIAS || "--"} />)}
              <Info label="Horário" value={details?.HORARIO || "--"} />
              {IDAREA === 3 ? (<Info label="Especialista (a)" value={details?.ESPECIALISTA || "--"} />) : IDAREA === 4
              ? (<></>) : (<Info label="Professor(a)" value={details?.PROFESSOR || "--"} />)}
              {IDAREA === 3 ? (<></>) : (<Info label="Categoria" value={details?.NIVEL || "--"} />)}
              {IDAREA === 3 ? (<></>) : (<Info label="Local" value={details?.LOCAL || "--"} />)}
              {IDAREA === 3 ? (<></>) : (<Info label="Matrícula" value="Curso sempre cobrado" />)}
            </>
          )}
        </View>

        {/* Goals */}
         {
          IDAREA === 3
            ? (<></>)
            : (<>
                <Text style={[styles.sectionTitle, { color: text2Color }]}>
                  OBJETIVO DA ATIVIDADE
                </Text>
                <View style={[styles.card, { backgroundColor: background2 }]}>
                  {isLoadingActivityDetails ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#DA1984" />
                      <Text style={styles.loadingText}>Carregando objetivo</Text>
                    </View>
                  ) : (
                    <Text style={[styles.descricao, { color: text2Color }]}>
                      {details?.OBJETIVO}
                    </Text>
                  )}
                </View>
              </>)
          }

        {/* Coast */}
        {
          IDAREA === 3
          ? (<>
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
                      if (details.VALOR) {
                        return <>
                          <View style={{ width: "100%", height: 1, backgroundColor: background, marginVertical: 10 }} />
                          <View style={[styles.costLine, { marginBottom: 8 }]}>
                            <View>
                              <Text style={{ color: '#7B8196', fontSize: 16 }}>Agendamento</Text>
                              <Text style={{ color: '#7B8196', fontSize: 14 }}>{details.DATA} às {details.HORARIO}</Text>
                            </View>
                            <Text style={[styles.costValue, { color: textColor }]}>
                              R$ {details.VALOR}
                            </Text>
                          </View>
                        </>;
                      } else {
                        return <Text style={styles.costDesc}>Nenhum custo encontrado.</Text>;
                      }
                    })()
                  ) : null}
                </View>
              </>)
          : IDAREA === 4
                  ? (<></>)
                  : (<>
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
                    </>)
        }
      </ScrollView>

      {/* Button Actions */}
      {(!isLoadingActivityDetails && details) && (
        <ButtonActions
          TRANSFERIR={details.TRANSFERIR}
          CANCELAR={details.CANCELAR}
          MATRICULAR={details.MATRICULAR}
          INSCRITO={details.STATUS === "Inscrito"}
          CANCELAR_CANCELAMENTO={details.STATUS === 'Cancelado'}
          INSCREVER={Number(VAGAS) === 0}
          IDENTIFICADOR={IDATIVIDADE}
          IDAREA={IDAREA}
          DESCRICAO={DESCRICAO}
          USERTITULO={USERTITULO}
          USERAVATAR={USERAVATAR}
          ANTIGATURMA={TURMA}
          ICONE={ICONE} // Adicionado para garantir passagem do ícone
          onMatricular={() => {
            setModalRegulations({
              isOpen: true,
              toRegister: true,
              actionType: "matricular"
            });
          }}
          onIncluir={() => {
            setModalRegulations({
              isOpen: true,
              toRegister: true,
              actionType: "incluir"
            });
          }}
          onCancelarMatricula={() => {
            setModalActions({
              message: `Você tem certeza que deseja cancelar a sua matrícula em ${DESCRICAO}?`,
              isOpen: true,
              action: () => {
                confirm.showConfirmation(DESCRICAO, async () => {
                  setIsLoadingRequestActions(true);
                  try {
                    await handleCancelarMatricula();
                  } catch (e: any) {
                    setError("Erro ao cancelar matrícula", "error", 3000);
                    navigation.reset({
                      index: 0,
                      routes: [
                        { name: '(tabs)' as never },
                        { name: getHomeRoute() as never }
                      ]
                    });
                  } finally {
                    setIsLoadingRequestActions(false);
                  }
                }, {
                  abovePasswordComponent: (
                    <View style={styles.confirmationContainer}>
                      <Text style={[styles.confirmationLabel, { color: tertiaryText }]}>
                        Cancelamento de Matrícula
                      </Text>
                      <Text style={[styles.confirmationTitle, { color: text2Color }]}>
                        {DESCRICAO}
                      </Text>
                    </View>
                  )
                });
              },
            });
          }}
          onCancelarEspera={() => {
            setModalActions({
              message: `Você tem certeza que deseja sair da lista de espera?`,
              isOpen: true,
              action: () => {
                confirm.showConfirmation(DESCRICAO, async () => {
                  setIsLoadingRequestActions(true);
                  try {
                    await handleCancelarEspera();
                  } catch (e: any) {
                    setError("Erro ao sair da lista de espera", "error", 3000);
                    navigation.reset({
                      index: 0,
                      routes: [
                        { name: '(tabs)' as never },
                        { name: getHomeRoute() as never }
                      ]
                    });
                  } finally {
                    setIsLoadingRequestActions(false);
                  }
                }, {
                  abovePasswordComponent: (
                    <View style={styles.confirmationContainer}>
                      <Text style={[styles.confirmationLabel, { color: tertiaryText }]}>
                        Saída da Lista de Espera
                      </Text>
                      <Text style={[styles.confirmationTitle, { color: text2Color }]}>
                        {DESCRICAO}
                      </Text>
                    </View>
                  )
                });
              },
            });
          }}
          onCancelarCancelamento={() => {
            console.log('cancelar');
            confirm.showConfirmation(DESCRICAO, async () => {
              console.log('cancelar 1');
              setIsLoadingRequestActions(true);
              try {
                await handleCancelarCancelamento();
              } catch (e: any) {
                setError("Erro ao desistir do cancelamento", "error", 3000);
                navigation.reset({
                  index: 0,
                  routes: [
                    { name: '(tabs)' as never },
                    { name: getHomeRoute() as never }
                  ]
                });
              } finally {
                setIsLoadingRequestActions(false);
              }
            }, {
              abovePasswordComponent: (
                <View style={styles.confirmationContainer}>
                      <Text style={[styles.confirmationLabel, { color: tertiaryText }]}>
                    Desistência de Cancelamento
                  </Text>
                  <Text style={[styles.confirmationTitle, { color: text2Color }]}>
                    {DESCRICAO}
                  </Text>
                </View>
              )
            });
          }}
        />
      )}

      {/* Regulation */}
      <Modal
        visible={modalRegulations.isOpen}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContainer, { backgroundColor: background2 }]}
          >
            <Text style={[styles.modalTitle, { color: textColor }]}>Regulamento interno</Text>
            {
              IDAREA === 3
              ? (<ScrollView style={{ marginBottom: 12, maxHeight: 200 }}>
              {isLoadingActivityDetails ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#DA1984" />
                  <Text style={styles.loadingText}>Carregando regulamento...</Text>
                </View>
              ) : (
                <>
                  <Text style={[styles.modalText, { color: "#878da3" }]}>
                    {details.REGULAMENTO || "Regulamento não disponível."}
                  </Text>
                  {/* {regulationLink ? (
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
                  ) : null} */}
                </>
              )}
            </ScrollView>)
            : (<ScrollView style={{ marginBottom: 12, maxHeight: 200 }}>
              {isLoadingActivityDetails ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#DA1984" />
                  <Text style={styles.loadingText}>Carregando regulamento...</Text>
                </View>
              ) : (
                <>
                  <Text style={[styles.modalText, { color: "#878da3" }]}>
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
            </ScrollView>)
            }

            {modalRegulations.toRegister ? (
              <>
                <View style={styles.checkboxRow}>
                  <Pressable
                    onPress={() => {
                      setAgreeWithRegulation((prev) => !prev);
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
                    disabled={isLoadingRequestActions}
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
                    onPress={handleRegulationContinue}
                    disabled={isLoadingActivityDetails || isLoadingRequestActions}
                  >
                    {isLoadingActivityDetails || isLoadingRequestActions ? (
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

      {/* Cancelamento */}
      <Modal
        visible={modalActions.isOpen}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContainer, { backgroundColor: background2 }]}
          >
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Cancelamento
            </Text>

            <Text style={[{ color: "#878da3", marginBottom: 36, fontSize: 15, fontWeight: '400', }]}>
              {modalActions.message}
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: "#ffefec" }]}
                disabled={isLoadingRequestActions}
                onPress={() =>
                  setModalActions({
                    isOpen: false,
                    message: '',
                    action: () => { }
                  })
                }
              >
                <Text style={{ color: "#FF3F3F", fontWeight: "bold" }}>
                  Não
                </Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: "#FF3F3F" }]}
                onPress={() => {
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
    overflow: "hidden",
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
    marginBottom: 15,
    marginTop: 25,
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
  costValue: { fontWeight: "bold", fontSize: 15, color: "#0F1C47", paddingBottom: 3 },
  botaoContainer: {
    height: "auto",
    width: "100%",
    padding: 16,
    gap: 8,
    display: "flex",
    flexDirection: "column",
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
    paddingInline: 16
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
    width: 40,
    height: 40,
    borderRadius: 28,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  enrolledAvatarImage: { width: 40, height: 40, borderRadius: 28 },
  confirmationContainer: {
    padding: 16,
  },
  confirmationLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
});
