import { getAuthContext } from '@/providers/AuthProvider';
import instance from '../api';
import { AxiosResponse } from 'axios';

// Defina a base do URL e o caminho do serviço
const baseURL = 'https://clubepaineiras.com.br/AliveTeste';
const servicePath = 'Alive.App.Atividades/Atividades.asmx';
const hourServiceParth = 'Alive.App.Atividades/GradeHoraria.asmx';
const waitingActivitiesPath = "Alive.App.Atividades/ListaEspera.asmx";
const canceledServicePath = 'Alive.App.Atividades/Programacao.asmx';
const scheduleServicePath = 'Alive.App.Locais/Agendamentos.asmx';
const transferServicePath = 'Alive.App.Atividades/Transferencias.asmx';

// Defina a interface para os parâmetros da API
interface ListarAssociadosParams {
  TITULO: string;
  IDAREA: number;
}

interface AtividadeResponseItem {
  IDATIVIDADE: number;
  TITULO: string;
  NOME: string;
  ATIVIDADE: string;
  TURMA: string;
  STATUS: string;
  DATA: string;
  AVATAR: string;
  DEPARTAMENTO: string;
  HORARIO: string;
  DIAS: string;
  POSICAO: number;
  MATRICULAR: boolean;
  ICONE: string;
  IDAREA: number;
  ORDEM: number;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

type AtividadeResponse = AtividadeResponseItem[];

// Função para listar associados e suas atividades
export const listarAssociados = async (
  params: ListarAssociadosParams
): Promise<AtividadeResponse> => {
  const context = getAuthContext();
  const url = `${baseURL}/${servicePath}/ListarAssociados`;
  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO,
      IDAREA: params.IDAREA,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

interface ExibirDetalhesParams {
  TITULO: string;
  IDATIVIDADE: number;
  IDTURMA: string;
}

export interface DetalheAtividadeResponse {
  ASSOCIADO: string;
  ATIVIDADE: string;
  HORARIO: string;
  DIAS: string;
  PROFESSOR: string;
  LOCAL: string;
  CATEGORIA: string;
  NIVEL: string;
  MATRICULAR: boolean;
  CANCELAR: boolean;
  TRANSFERIR: boolean;
  FASEREMATRICULA: boolean;
  INCIDE_VALOR: boolean;
  VALOR_MENSAL: string;
  VALOR_MATRICULA: string;
  TIPO_COBRANCA: string;
  TIPO: string;
  LINK_ARQUIVO: string;
  TEXTO_LINK: string;
  IDSTATUS: number;
  STATUS: string;
  EXIBIR_PROTOCOLO: boolean;
  PROTOCOLO: string;
  OBJETIVO: string;
  REGULAMENTO?: string; // Adicionado para refletir o backend
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

export const exibirDetalhes = async (
  params: ExibirDetalhesParams
): Promise<DetalheAtividadeResponse> => {
  const url = `${baseURL}/${servicePath}/ExibirDetalhes`;
  const context = getAuthContext();
  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO,
      IDATIVIDADE: params.IDATIVIDADE,
      IDTURMA: params.IDTURMA,
      CHAVE: context.chave,
    },
  });
  return response.data[0];
};
/*
[
  {
    "ASSOCIADO": "Associado ",
    "ATIVIDADE": "Aqua/mob 2025",
    "HORARIO": "20:15 as 21:00",
    "DIAS": " Sex",
    "PROFESSOR": "Joao Carlos Nunes",
    "LOCAL": "Piscina Kids 1",
    "CATEGORIA": "Acima de 14 anos",
    "NIVEL": "Livre",
    "MATRICULAR": true,
    "CANCELAR": false,
    "TRANSFERIR": false,
    "FASEREMATRICULA": false,
    "INCIDE_VALOR": true,
    "VALOR_MENSAL": "140,00",
    "VALOR_MATRICULA": "219,33",
    "TIPO_COBRANCA": "Curso sempre cobrado",
    "TIPO": "",
    "LINK_ARQUIVO": "https://clubepaineiras.com.br/Alive/pFiles/180116174174925779411711701592267113517145494432/Atividades/Regulamento/Regulamento_001.pdf",
    "TEXTO_LINK": "Visualizar Regulamento",
    "IDSTATUS": 3,
    "STATUS": "Vaga Disponível",
    "EXIBIR_PROTOCOLO": false,
    "PROTOCOLO": "",
    "OBJETIVO": "A aula com duração de 45 minutos, será dividida em aquecimento, parte principal e volta à calma. Terá movimentos de mobilidade articular , desenvolveremos as capacidades físicas de força, resistência muscular localizada, condicionamento físico cardiorrespiratório e melhora no bem-estar, através do contato ao meio líquido.",
    "REGULAMENTO": "Limite de alunos por turma/curso : 6\r\nLista de espera : Até 1 lista a mais\r\nPagamento : Curso cobrado\r\nFreqüência : Não há\r\nDuração das aulas : 45 minutos\r\nMaterial para o curso : Touca e roupa de banho\r\nSaídas antecipadas : Não há\r\nAtrasos : Não há\r\nFaltas : Não há\r\nUniforme : Não há\r\nAtestados : Dermatológico da piscina em dia\r\n",
    "ERRO": false,
    "IDERRO": 0,
    "MSG_ERRO": ""
  }
]
 */

interface ListarMatriculadosParams {
  TITULO: string;
  IDATIVIDADE: number;
  TURMA: string;
}

interface MatriculadoResponseItem {
  IDASSOCIADO: number;
  NOME: string;
  MATRICULA: string;
  STATUS: string;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

type MatriculadoResponse = MatriculadoResponseItem[];
//listar matriculados em uma ativdade especifica
export const listarMatriculados = async (
  params: ListarMatriculadosParams
): Promise<AxiosResponse<MatriculadoResponse>> => {
  const url = `${baseURL}/${servicePath}/ListarMatriculados`;
  const context = getAuthContext();
  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO,
      IDATIVIDADE: params.IDATIVIDADE,
      TURMA: params.TURMA,
      CHAVE: context.chave,
    },
  });

  return response;
};

interface ProgramarExclusaoParams {
  TITULO: number;
  IDATIVIDADE: number;
  IDTURMA: string;
}

interface ProgramarExclusaoResponse {
  DTCANCELAMENTO: string;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

export const programarExclusao = async (
  params: ProgramarExclusaoParams
): Promise<ProgramarExclusaoResponse> => {
  const url = `${baseURL}/${servicePath}/ProgramarExclusao`;
  const context = getAuthContext();
  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO,
      IDATIVIDADE: params.IDATIVIDADE,
      IDTURMA: params.IDTURMA,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

//Nova Atividades
//passo 1 Listar Atividades para usuario especifico ou para todos
interface ListarAtividadesFiltroParams {
  TITULO: string;
  IDAREA: number;
}

export interface AtividadeFiltroResponseItem {
  ICONE: string;
  ICONE_NOVO: string;
  IDENTIFICADOR: number;
  DESCRICAO: string;
  GRUPO: string;
  NOME: string;
  PERIODO: string;
  VAGAS: number;
  VALOR: string;
  STATUS: string;
  EXIBIR_TURMAS: boolean;
  ORDEM: number;
  MSG_BLOQUEIO: string;
  BLOQUEIO: number;
  TURMAS: number;
  IDAREA: number;
  IDDEPARTAMENTO: number;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

type AtividadeFiltroResponse = AtividadeFiltroResponseItem[];

export const listarAtividadesFiltro = async (
  params: ListarAtividadesFiltroParams
): Promise<AtividadeFiltroResponse> => {
  const url = `${baseURL}/${hourServiceParth}/ListarAtividadesFiltro`;
  const context = getAuthContext();
  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO,
      CHAVE: context.chave,
      IDAREA: params.IDAREA,
    },
  });

  return response.data;
};

//passo 2 Listar Horarios para atividade especifica tambem é usado para exibir os detalhes da atividade
interface ListarHorariosParams {
  IDATIVIDADE: number;
  TITULO: string;
  VERIFICAR_VAGA?: boolean;
}

interface HorarioResponseItem {
  IDENTIFICADOR: string;
  ATIVIDADE: string;
  HRINICIO: string;
  HRTERMINO: string;
  DIAS: string;
  TURMA: string;
  LOCAL: string;
  PROFESSOR: string;
  NIVEL: string;
  VAGAS: number;
  INSCREVER: boolean;
  LINK_ARQUIVO: string;
  TEXTO_LINK: string;
  ORDEM: number;
  VALOR_MENSAL: string;
  MATRICULAR: boolean;
  TIPO_COBRANCA: string;
  MSG_TESTEHABILIDADE: string;
  TESTEHABILIDADE: number;
  FAIXA_ETARIA: string;
  CATEGORIA: string;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

type HorarioResponse = HorarioResponseItem[];

export const listarHorarios = async (
  params: ListarHorariosParams
): Promise<HorarioResponse> => {
  const url = `${baseURL}/${servicePath}/ListarHorarios`;
  const context = getAuthContext();
  const response = await instance.get(url, {
    params: {
      IDATIVIDADE: params.IDATIVIDADE,
      TITULO: params.TITULO,
      VERIFICAR_VAGA: params.VERIFICAR_VAGA ?? true,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

//passo 3 Listar cadastrados para nova atividade
interface ListarCadastradosParams {
  TITULO: string;
  IDATIVIDADE: number;
  TURMA: string;
}

interface CadastradoResponseItem {
  NOME: string;
  TITULO: string;
  AVATAR: string;
  ORDEM: number;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

type CadastradoResponse = CadastradoResponseItem[];

export const listarCadastrados = async (
  params: ListarCadastradosParams
): Promise<CadastradoResponse> => {
  const url = `${baseURL}/${servicePath}/ListarCadastrados`;
  const context = getAuthContext();
  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO,
      IDATIVIDADE: params.IDATIVIDADE,
      TURMA: params.TURMA,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

//passo 4 Matricular o usuario na atividade
interface MatricularParams {
  TITULO: string;
  IDATIVIDADE: number;
  IDTURMA: string;
}

interface MatricularResponse {
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

export const matricular = async (
  params: MatricularParams
): Promise<MatricularResponse> => {
  const url = `${baseURL}/${servicePath}/Matricular`;
  const context = getAuthContext();
  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO,
      IDATIVIDADE: params.IDATIVIDADE,
      IDTURMA: params.IDTURMA,
      CHAVE: context.chave,
    },
  });

  return response.data[0];
};
//listar associados para efetuar o cadastro em onva atividade.
interface ListarAssociadosParams {
  TITULO: string;
}

export interface AssociadoResponseItem {
  TITULO: string;
  NOME: string;
  IDADE: number;
  SEXO: string;
  EMAIL: string;
  TELEFONE: string;
  DTNASCTO: string;
  AVATAR: string;
  IDPESSOA: number;
  MATRICULAR: boolean;
  ORDEM: number;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

type AssociadoResponse = AssociadoResponseItem[];

const cache = new Map<string, AssociadoResponse>();
export const listarDependentes = async (
  params: ListarAssociadosParams
): Promise<AssociadoResponse> => {
  const url = `${baseURL}/Alive.App.Atendimentos/Associados.asmx/Listar`;
  const context = getAuthContext();
  const chaveCache = params.TITULO || context.user;

  // if (cache.has(chaveCache)) return cache.get(chaveCache)!

  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO || context.user,
      CHAVE: context.chave,
    },
  });

  cache.set(chaveCache, response.data);
  return response.data;
};

//listar associados para efetuar o cadastro em onva atividade.
interface ListarAssociadosAgendamentoParams {
  TITULO: string;
  IDLOCAL: number;
}

export interface AssociadoAgendamentoResponseItem {
  TITULO: string;
  NOME: string;
  IDADE: number;
  SEXO: string;
  EMAIL: string;
  TELEFONE: string;
  DTNASCTO: string;
  AVATAR: string;
  IDPESSOA: number;
  MATRICULAR: boolean;
  ORDEM: number;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

type AssociadoAgendamentoResponse = AssociadoAgendamentoResponseItem[];

export const listarDependentesAgendamento = async (
  params: ListarAssociadosAgendamentoParams
): Promise<AssociadoAgendamentoResponse> => {
  const url = `${baseURL}/${scheduleServicePath}/ListarAssociados`;
  const context = getAuthContext();
  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO || context.user,
      IDLOCAL: params.IDLOCAL,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

interface ListarProximasAtividadesParams {
  TITULO: string;
}

export interface ProximaAtividadeResponseItem {
  TIPO: number;
  IDATIVIDADE: number;
  ATIVIDADE: string;
  DTATIVIDADE: string;
  HRINICIO: string;
  CANCELADA: boolean;
  TITULO: string;
  AVATAR: string;
  ICONE: string;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

type ProximaAtividadeResponse = ProximaAtividadeResponseItem[];

export const listarProximasAtividades = async (
  params: ListarProximasAtividadesParams
): Promise<ProximaAtividadeResponse> => {
  const url = `${baseURL}/${servicePath}/ListarProximasAtividades`;
  const context = getAuthContext();
  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

interface ListarEsperaParams {
  TITULO: string;
  IDAREA: number;
}

export interface ListaEsperaResponseItem {
  TITULO: string;
  IDATIVIDADE: number;
  ATIVIDADE: string;
  POSICAO: number;
  TURMA: string;
  ICONE: string;
  IDAREA: number;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

type ListaEsperaResponse = ListaEsperaResponseItem[];

export const listarEspera = async (
  params: ListarEsperaParams
): Promise<ListaEsperaResponse> => {
  const url = `${baseURL}/${waitingActivitiesPath}/ListarAssociados`;
  const context = getAuthContext();
  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO,
      IDAREA: params.IDAREA,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

interface ListarProgramacaoParams {
  TITULO: string;
  IDAREA: number;
}

export interface ProgramacaoResponseItem {
  IDATIVIDADE: number;
  TITULO: string;
  NOME: string;
  ATIVIDADE: string;
  TURMA: string;
  DTCANCELAMENTO: string;
  STATUS: string;
  AVATAR: string;
  DEPARTAMENTO: string;
  ICONE: string;
  HORARIO: string;
  DATA: string;
  POSICAO: number;
  MATRICULAR: boolean;
  IDAREA: number;
  ORDEM: number;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

type ProgramacaoResponse = ProgramacaoResponseItem[];

export const listarProgramacao = async (
  params: ListarProgramacaoParams
): Promise<ProgramacaoResponse> => {
  const url = `${baseURL}/${canceledServicePath}/Listar`;
  const context = getAuthContext();
  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO,
      IDAREA: params.IDAREA,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

interface ListarQuantidadeParams {
  TITULO: string;
  IDAREA: string;
}

interface ServicoItem {
  IDSERVICO: number;
  DESCRICAO: string;
  QUANTIDADE: number;
  ORDEM: number;
}

interface ListarQuantidadeResponseItem {
  SERVICO: ServicoItem[];
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

type ListarQuantidadeResponse = ListarQuantidadeResponseItem[];

export const listarQuantidade = async (
  params: ListarQuantidadeParams
): Promise<ListarQuantidadeResponse> => {
  const url = `${baseURL}/${hourServiceParth}/ListarQuantidade`;
  const context = getAuthContext();

  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO,
      IDAREA: params.IDAREA,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

// Interface para os detalhes de atividade
export interface NovaActivity {
  IDENTIFICADOR: number;
  TITULO: string;
  NOME: string;
  ATIVIDADE: string;
  ESPECIALISTA: string;
  ESPECIALIDADE: string;
  TURMA: string;
  STATUS: string;
  AVATAR: string;
  DEPARTAMENTO: string;
  HORARIO: string;
  DATA: string;
  POSICAO?: number;
  MATRICULAR: boolean;
  ICONE: string;
  ORDEM: number;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

// Interface para a agenda do associado
export interface MemberAgenda {
  IDENTIFICADOR: number;
  TITULO: string;
  NOME: string;
  ATIVIDADE: string;
  ESPECIALISTA: string;
  ESPECIALIDADE: string;
  TURMA: string;
  STATUS: string;
  AVATAR: string;
  DEPARTAMENTO: string;
  HORARIO: string;
  DATA: string;
  POSICAO?: number;
  MATRICULAR: boolean;
  ICONE: string;
  ORDEM: number;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

// Função para buscar detalhes de atividades ativas
export const fetchActiveActivityDetails = async (
  membership: string,
  idAtividade: number,
  idTurma: string
): Promise<NovaActivity[]> => {
  const url = `${baseURL}/${servicePath}/ExibirMatriculas`;
  const context = getAuthContext();

  const response = await instance.get(url, {
    params: {
      TITULO: membership,
      IDATIVIDADE: idAtividade,
      TURMA: idTurma,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

// Função para buscar detalhes de atividades em lista de espera
export const fetchWaitingActivityDetails = async (
  membership: string,
  idAtividade: number,
  idTurma: string
): Promise<NovaActivity[]> => {
  const url = `${baseURL}/${waitingActivitiesPath}/ExibirListaEspera`;
  const context = getAuthContext();

  const response = await instance.get(url, {
    params: {
      TITULO: membership,
      IDATIVIDADE: idAtividade,
      TURMA: idTurma,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

// Função para buscar detalhes de atividades canceladas
export const fetchCanceledActivityDetails = async (
  membership: string,
  idAtividade: number,
  idTurma: string
): Promise<NovaActivity[]> => {
  const url = `${baseURL}/${canceledServicePath}/ExibirCancelados`;
  const context = getAuthContext();

  const response = await instance.get(url, {
    params: {
      TITULO: membership,
      IDATIVIDADE: idAtividade,
      TURMA: idTurma,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

// Função para buscar a agenda do associado
export const fetchMemberAgenda = async (
  membership: string
): Promise<MemberAgenda[]> => {
  const url = `${baseURL}/${servicePath}/ListarProximasAtividades`;
  const context = getAuthContext();

  const response = await instance.get(url, {
    params: {
      TITULO: membership,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

// Interface para os parâmetros da função fetchActivityTerms
export interface ActivityTermsParams {
  membership: string;
  activityId: number;
  groupId: number;
}

// Interface para o retorno da função fetchActivityTerms
export interface ActivityTerms {
  REGULAMENTO: string;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

// Função para buscar o regulamento da atividade
export const fetchActivityTerms = async ({
  membership,
  activityId,
  groupId,
}: ActivityTermsParams): Promise<ActivityTerms> => {
  const url = `${baseURL}/${servicePath}/ExibirRegulamento`;
  const context = getAuthContext();

  const response = await instance.get(url, {
    params: {
      IDATIVIDADE: activityId,
      TURMA: groupId,
      TITULO: membership,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

// Função para matricular o usuário na atividade
export const enrollActivity = async (
  membership: string,
  idAtividade: number,
  idTurma: string
): Promise<any> => {
  const url = `${baseURL}/${servicePath}/Matricular`;
  const context = getAuthContext();

  const response = await instance.get(url, {
    params: {
      TITULO: membership,
      IDATIVIDADE: idAtividade,
      IDTURMA: idTurma,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

// Interface para os dados retornados pela API ListarAssociadosMatriculas
export interface AtividadeMatriculaItem {
  IDENTIFICADOR: number;
  TITULO: string;
  NOME: string;
  ATIVIDADE: string;
  ESPECIALISTA: string;
  ESPECIALIDADE: string;
  TURMA: string;
  STATUS: string;
  AVATAR: string;
  IDAREA: number;
  DEPARTAMENTO: string;
  HORARIO: string;
  DATA: string;
  POSICAO: number;
  MATRICULAR: boolean;
  ICONE: string;
  ORDEM: number;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

type AtividadeMatriculaResponse = AtividadeMatriculaItem[];

// Função para listar atividades matriculadas
export const listarAssociadosMatriculas = async (params: {
  TITULO: string;
  IDAREA: string;
}): Promise<AtividadeMatriculaResponse> => {
  const url = `${baseURL}/${servicePath}/ListarAssociadosMatriculas`;
  const context = getAuthContext();
  
  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO,
      IDAREA: params.IDAREA,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

// Interface para os dados retornados pela API de agendamentos
export interface AgendamentoItem {
  IDAGENDAMENTO: number;
  DATA: string;
  HORARIO: string;
  TITULO: string;
  NOME: string;
  GRUPO: string;
  LOCALIDADE: string;
  CANCELAR: boolean;
  ORDEM: number;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

type AgendamentoResponse = AgendamentoItem[];

// Função para listar agendamentos do associado
export const listarAgendamentos = async (params: { TITULO: string, IDAREA: string }): Promise<AgendamentoResponse> => {
  const url = `${baseURL}/${scheduleServicePath}/Listar`;
  const context = getAuthContext();

  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO,
      IDAREA: params.IDAREA,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

// Interface para os detalhes de agendamento
export interface AgendamentoDetalhes {
  GRUPO: string;
  DATA: string;
  HORARIO: string;
  INTERVALO: string;
  ASSOCIADO: string;
  TITULO_RESUMO: string;
  LOCALIZACAO: string;
  LOCALIDADE: string;
  RESERVAS: number;
  ORIENTACAO: string;
  EXCLUIR: boolean;
  COR_DESTAQUE: string;
  COR: string;
  AVISO_CANCELAMENTO: string;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

type AgendamentoDetalhesResponse = AgendamentoDetalhes;

// Função para buscar detalhes de um agendamento
export const exibirDetalhesAgendamento = async (idAgendamento: number): Promise<AgendamentoDetalhesResponse> => {
  const url = `${baseURL}/${scheduleServicePath}/ExibirDetalhes`;
  const context = getAuthContext();

  const response = await instance.get(url, {
    params: {
      IDAGENDAMENTO: idAgendamento,
      CHAVE: context.chave,
    },
  });

  return response.data[0];
};

export type AtividadesAgendaHorariosItem = {
  DESCRICAO: string;
  HRINICIO: string;
  HRTERMINO: string;
  DIAS: string;
  TURMA: string;
  LOCAL: string;
  PROFESSOR: string;
  NIVEL: string;
  VAGAS: number;
  INSCREVER: boolean;
  LINK_ARQUIVO: string;
  TEXTO_LINK: string;
  ORDEM: number;
  VALOR_MENSAL: string;
  MATRICULAR: boolean;
  TIPO_COBRANCA: string;
  MSG_TESTEHABILIDADE: string;
  TESTEHABILIDADE: number;
  FAIXA_ETARIA: string;
  GENERO: string;
  IDTIPOSERVICO: number;
  CATEGORIA: string;
  IDAREA: number;
  DATA: string;
};

type AtividadesAgendaHorariosResponse = AtividadesAgendaHorariosItem[]

// Listar agendamento turmas
export const listarAtividadesAgendaHorarios = async (props: {
  IDAREA: number;
  IDENTIFICADOR: number;
  TITULO: string;
  VERIFICAR_VAGA: boolean;
}): Promise<AtividadesAgendaHorariosResponse> => {
  const url = `${baseURL}/${servicePath}/ListarAtividadeAgendaHorarios`;
  const context = getAuthContext();

  const response = await instance.get(url, {
    params: {
      ...props,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

// Cancelar Listar de Espera
export const cancelarListaDeEspera = async (props: {
  IDTURMA: number;
  IDATIVIDADE: number;
  TITULO: string;
}) => {
  const url = `${baseURL}/${waitingActivitiesPath}/Cancelar`;
  const context = getAuthContext();

  const response = await instance.get(url, {
    params: {
      ...props,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

export const cancelarMatricula = async (props: {
  IDTURMA: number;
  IDATIVIDADE: number;
  TITULO: string;
}) => {
  const url = `${baseURL}/${servicePath}/ProgramarExclusao`;
  const context = getAuthContext();

  const response = await instance.get(url, {
    params: {
      ...props,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

export const incluirListaEspera = async (props: {
  IDTURMA: number;
  IDATIVIDADE: number;
  TITULO: string;
}) => {
  const url = `${baseURL}/${waitingActivitiesPath}/Incluir`;
  const context = getAuthContext();

  const response = await instance.get(url, {
    params: {
      ...props,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

interface ListarAtividadesAgendamentosParams {
  TITULO: string;
}

export interface AtividadeAgendamentosResponseItem {
  IDLOCAL: string;
  IDGRUPO: string;
  ATIVIDADE: string;
  LOCALIZACAO: string;
  RESTRICAO: string;
  OBSERVACAO: string;
  ORIENTACAO: string;
  EXIBIR_EXAME: string;
  ICONE: string;
  ICONE_NOVO: string;
  COR_DESTAQUE: string;
  MSG_ALERTA: string;
  EXIBIR_ALERTA: string;
  COR_ALERTA: string;
  TITULO_ALERTA: string;
  ORDEM: string;
  ERRO: string;
  IDERRO: boolean;
  MSG_ERRO: string;
}

type AtividadeAgendamentosResponse = AtividadeAgendamentosResponseItem[];

export const listarAtividadesAgendamentos = async (params: ListarAtividadesAgendamentosParams): Promise<AtividadeAgendamentosResponse> => {
  const url = `${baseURL}/${scheduleServicePath}/ListarGrupos`;
  const context = getAuthContext();
  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

export type listarAtividadeDatasResponseItem = {
  DATA: string;
  DESCRICAO: string;
  HORARIOS: string;
  ORDEM: number;
  ERRO: boolean
  IDERRO: 0,
  MSG_ERRO: string
};

export const listarAgendamentosDatas = async (props: {
  IDLOCAL: string;
  TITULO: string;
}): Promise<listarAtividadeDatasResponseItem[]> => {
  const url = `${baseURL}/${scheduleServicePath}/ListarEscala`;
  const context = getAuthContext();

  const response = await instance.get(url, {
    params: {
      ...props,
      CHAVE: context.chave,
    },
  });

  return response.data;
}

export type ListarAgendamentosHorariosReponseItem = {
  AGENDAMENTOS: number;
  ERRO: boolean;
  EXIBIR_GRAFICO: boolean;
  HORARIO: string;
  IDERRO: number;
  INTERVALO: string;
  MSG_ERRO: string;
  ORDEM: number;
  RESERVAS: number;
};

export const listarAgendamentosHorarios = async (props: {
  IDLOCAL: string;
  DATA: string;
  TITULO: string;
}): Promise<ListarAgendamentosHorariosReponseItem[]> => {
  const url = `${baseURL}/${scheduleServicePath}/ListarHorarios`;
  const context = getAuthContext();

  const response = await instance.get(url, {
    params: {
      ...props,
      CHAVE: context.chave,
    },
  });

  return response.data;
};
//
export type ListarHorariosAulasLivresItem = {
  ATIVIDADE: string;
  HRINICIO: string;
  HRTERMINO: string;
  DIAS: string;
  TURMA: string;
  LOCAL: string;
  PROFESSOR: string;
  NIVEL: string;
  VAGAS: string;
  INSCREVER: string;
  LINK_ARQUIVO: string;
  TEXTO_LINK: string;
  ORDEM: string;
  VALOR_MENSAL: string;
  MATRICULAR: string;
  TIPO_COBRANCA: string;
  MSG_TESTEHABILIDADE: string;
  FAIXA_ETARIA: string;
  CATEGORIA: string;
  ERRO: string;
  IDERRO: boolean;
  MSG_ERRO: string;
};

export const listarHorariosAulasLivres = async (props: {
  TITULO: string;
  IDATIVIDADE: number;
}): Promise<ListarHorariosAulasLivresItem[]> => {
  const url = `${baseURL}/${servicePath}/ListarHorariosLivres`;
  const context = getAuthContext();

  const response = await instance.get(url, {
    params: {
      ...props,
      CHAVE: context.chave,
    },
  });

  return response.data;
};
//
export type ListarAssociadosMatriculadosResponseItem = {
  NOME: string;
  TITULO: string;
  AVATAR: string;
  ORDEM: number;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}
export const listarAssociadosMatriculados = async (props: {
  TITULO: string;
  IDATIVIDADE: number;
  TURMA: string;
}): Promise<ListarAssociadosMatriculadosResponseItem[]> => {
  const url = `${baseURL}/${servicePath}/ListarMatriculados`;
  const context = getAuthContext();

  const response = await instance.get(url, {
    params: {
      ...props,
      CHAVE: context.chave,
    },
  });

  return response.data;
};
// 
export const cancelarAgendamentos = async (IDAGENDAMENTO: string) => {
  const url = `${baseURL}/${scheduleServicePath}/Cancelar`;
  const context = getAuthContext();

  const response = await instance.get(url, {
    params: {
      IDAGENDAMENTO,
      CHAVE: context.chave,
    },
  });

  return response.data;
}
// 
export const gravarAgendamento = async (HORARIO: string) => {
  const url = `${baseURL}/${scheduleServicePath}/Gravar`;
  const context = getAuthContext();

  const response = await instance.get(url, {
    params: {
      HORARIO,
      CHAVE: context.chave,
    },
  });

  return response.data;
}
// 
export const desistirCancelamento = async (props: {
  IDTURMA: number;
  IDATIVIDADE: number;
  TITULO: string;
}) => {
  const url = `${baseURL}/${canceledServicePath}/Cancelar`;
  const context = getAuthContext();
  const response = await instance.get(url, {
    params: {
      ...props,
      CHAVE: context.chave,
    },
  });

  return response.data;
}
// 
export const tranferirMatricula = async (props: {
  TITULO: string,
  IDATIVIDADE: string,
  TURMA_ATUAL: string,
  TURMA_NOVA: string,
}) => {
  const url = `${baseURL}/${transferServicePath}/Confirmar`;
  const context = getAuthContext();
  const response = await instance.get(url, {
    params: {
      ...props,
      CHAVE: context.chave,
    },
  });

  return response.data;
}
// 
export const listarTranferencias = async (props: {
  TITULO: string;
  IDATIVIDADE: number;
  IDTURMA: string;
}) => {
  const url = `${baseURL}/${transferServicePath}/ListarHorarios`;
  const context = getAuthContext();
  const response = await instance.get(url, {
    params: {
      ...props,
      CHAVE: context.chave,
    },
  });

  return response.data;
}
//
export type ListarAgendamentosTurmasItem = {
  IDLOCAL: string
  IDGRUPO: string
  ATIVIDADE: string
  LOCALIZACAO: string
  RESTRICAO: string
  OBSERVACAO: string
  ORIENTACAO: string
  EXIBIR_EXAME: boolean
  ICONE: string
  ICONE_NOVO: string
  COR_DESTAQUE: string
  MSG_ALERTA: string
  EXIBIR_ALERTA: string
  COR_ALERTA: string
  TITULO_ALERTA: string
  ORDEM: number
  ERRO: boolean
  IDERRO: number
  MSG_ERRO: string
}
export const listarAgendamentosTurmas = async (IDGRUPO: string): Promise<ListarAgendamentosTurmasItem[]> => {
  const url = `${baseURL}/${scheduleServicePath}/ListarTurmas`;
  const context = getAuthContext();
  const response = await instance.get(url, {
    params: {
      IDGRUPO,
      CHAVE: context.chave,
    },
  });

  return response.data;
}

/*
[
    {
        "IDLOCAL": 5,
        "IDGRUPO": 12,
        "ATIVIDADE": "AULAS DE BOXE",
        "LOCALIZACAO": "Complexo de Lutas",
        "RESTRICAO": "Limite de 16 pessoas por horário",
        "OBSERVACAO": "A partir de 14 anos - 3 reservas semanais",
        "ORIENTACAO": "•  Duração: 50 minutos\n\n•  Valor: R$ 22,00 por agendamento\n\n•  Local: Complexo de Lutas\n\n       \n     \nOrientações:\n      \n  •  Serão disponibilizados papel toalha, borrifador e álcool gel distribuídos no posto de aula para realizar a higienização dos equipamentos utilizados.\n\n  •  Cada associado deverá fazer a higienização dos equipamentos e acessórios utilizados durante o treino obrigatoriamente após a utilização com o auxílio do professor e/ou estagiário.\n\n  •  Serão utilizados somente para abastecer garrafas (proibido o uso direto dos mesmos).\n\n  •  Não serão disponibilizadas toalhas pelo clube, cada associado deverá trazer sua própria toalha para uso pessoal.\n\n  •  Evite sempre levar as mãos ao rosto.\n  \n  •  Não faça contato físico.\n  \n  •  Obrigatório o uso de máscaras. \n  \n  •  O instrutor não poderá em hipótese alguma realizar correções posturais e alongamentos tocando no aluno. \n  \n  •  Deverão usar somente comando de voz, respeitando o distanciamento social.\n\n  •  Pedimos que os revezamentos nos horários sejam feitos de forma dinâmica e rápida, respeitando as regras do regimento interno fixado na placa do setor.\n\n  •  Respeite os profissionais disponibilizados pelo Clube para auxiliar no controle de uso do local com segurança.",
        "EXIBIR_EXAME": false,
        "ICONE": "fa-boxing-glove",
        "ICONE_NOVO": "fa-boxing-glove",
        "COR_DESTAQUE": "237,28,36",
        "MSG_ALERTA": "Não há vagas para o restante da semana.\n \nPor favor, aguarde a liberação, pela Coordenação da Atividade, da próxima escala semanal.\n \nEnviaremos uma notificação quando da disponibilidade dos novos horários.",
        "EXIBIR_ALERTA": false,
        "COR_ALERTA": "0,0,0",
        "TITULO_ALERTA": "Escala Semanal",
        "ORDEM": 0,
        "ERRO": false,
        "IDERRO": 0,
        "MSG_ERRO": ""
    }
]
 */

export interface ListarAssociadosAgendamentoItem {
  TITULO: string;
  NOME: string;
  IDADE: number;
  SEXO: string;
  EXAME: string;
  STATUS: number;
  AVATAR: string;
  ORDEM: number;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

export type ListarAssociadosAgendamentoResponse = ListarAssociadosAgendamentoItem[];

export const listarAssociadosAgendamento = async (): Promise<ListarAssociadosAgendamentoResponse> => {
  const url = `${baseURL}/${scheduleServicePath}/ListarAssociados`;
  const context = getAuthContext();

  const response = await instance.get(url, {
    params: {
      TITULO: context.user,
      IDLOCAL: 43,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

export interface DebitoItem {
  DESCRICAO: string;
  VALOR: string;
  VENCIMENTO?: string;
  STATUS?: string;
}

export const listarDebitos = async (params: {
  TITULO: string | number;
  IDATIVIDADE: string | number;
  IDTURMA: string | number;
}): Promise<DebitoItem[]> => {
  const context = getAuthContext();
  const url = `${baseURL}/${servicePath}/ListarDebitos`;
  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO,
      IDATIVIDADE: params.IDATIVIDADE,
      IDTURMA: params.IDTURMA,
      CHAVE: context.chave,
    },
  });
  return response.data;
};