import { AuthContextType, getAuthContext } from '@/providers/AuthProvider';
import instance from '../api';
import axios, { AxiosResponse } from 'axios';
import Config from 'react-native-config';

console.log('<<<<< Config >>>>>', Config)

// Defina a base do URL e o caminho do serviço
const baseURL = 'https://clubepaineiras.com.br/AliveTeste';
const servicePath = 'Alive.App/Acesso.asmx';

// Defina a interface para os parâmetros da API
interface AutenticarParams {
  TITULO: string;
  SENHA: string;
}

interface AutenticarResponseItem {
  ALTERAR_SENHA: boolean;
  CHAVE: string;
  USERKEY: string;
  LINK: string;
  IDTOKEN: number;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

// A resposta é um array de objetos do tipo AutenticarResponseItem
type AutenticarResponse = AutenticarResponseItem[];

// Função para autenticar
export const autenticar = async (params: AutenticarParams): Promise<AxiosResponse<AutenticarResponse>> => {
  const context = getAuthContext();
  const url = `${baseURL}/${servicePath}/Autenticar`;

  console.log('params', {
      TITULO: params.TITULO,
      SENHA: params.SENHA,
      IP: context.ip,
      BROWSER: " ",
      TOKEN: Config.EXPO_PUBLIC_TOKEN || 'Desconhecido',
      DISPOSITIVO: context.device,
      VERSAO_APP: context.appVersion,
      VERSAO_OS: context.osVersion,
    })
  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO,
      SENHA: params.SENHA,
      IP: context.ip,
      BROWSER: " ",
      TOKEN: Config.EXPO_PUBLIC_TOKEN || 'Desconhecido',
      DISPOSITIVO: context.device,
      VERSAO_APP: context.appVersion,
      VERSAO_OS: context.osVersion,
    },
  });
  context.setTitulo(params.TITULO);
  context.setChave(response.data[0].CHAVE);
  context.setUserkey(response.data[0].USERKEY); // Salva o USERKEY no contexto

  return response;
};
// Defina a interface para a resposta da API de Convalidar
interface ConvalidarResponseItem {
  CHAVE: string;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

// A resposta é um array de objetos do tipo ConvalidarResponseItem
type ConvalidarResponse = ConvalidarResponseItem[];

// Função para convalidar e setar a chave no contexto
export const convalidar = async (): Promise<ConvalidarResponse> => {
  const context = getAuthContext();
  const url = `${baseURL}/${servicePath}/Convalidar`;
  const response = await instance.get(url, {
    params: {
      USERKEY: context.userkey, // USERKEY obtido do contexto
    },
  });
  context.setChave(response.data[0].CHAVE);
  return response.data;
};

// Defina a interface para a resposta da API de Logoff
interface LogoffResponseItem {
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

// A resposta é um array de objetos do tipo LogoffResponseItem
type LogoffResponse = LogoffResponseItem[];

// Função para fazer o Logoff
// export const logoff = async (chave: string): Promise<AxiosResponse<LogoffResponse>> => {
//   const url = `${baseURL}/${servicePath}/Logoff`;

//   // Faz a requisição GET para o endpoint de Logoff
//   const response = await axios.get(url, {
//     params: {
//       CHAVE: chave, // CHAVE obtida do contexto
//     },
//   });

//   return response;
// };

// Defina a interface para a resposta da API de Validar
interface ValidarResponseItem {
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

interface ValidarParams {
  SENHA: string;
}

// A resposta é um array de objetos do tipo ValidarResponseItem
type ValidarResponse = ValidarResponseItem[];

// Função para validar
export const validar = async (params: ValidarParams): Promise<AxiosResponse<ValidarResponse>> => {
  const context = getAuthContext();
  const url = `${baseURL}/${servicePath}/Validar`;
  const response = await instance.get(url, {
    params: {
      TITULO: context.user,
      SENHA: params.SENHA,
      CHAVE: context.chave,
    },
  });

  return response;
};

// Defina a interface para os itens de aviso
interface AvisoItem {
  IDAVISO: number;
  DATA: string;
  ASSUNTO: string;
  DESCRICAO: string;
  IDSERVICO: number;
  LEITURA: boolean;
  ORDEM: number;
  EXIBIR_LINK: boolean;
  LINK_ARQUIVO: string;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

// A resposta é um array de objetos do tipo AvisoItem
type ListarAvisosResponse = AvisoItem[];

// Função para listar avisos
export const listarAvisos = async (): Promise<ListarAvisosResponse> => {
  const url = `${baseURL}/${servicePath}/ListarAvisos`;
  const context = getAuthContext();
  // Faz a requisição GET para o endpoint de ListarAvisos
  const response = await instance.get(url, {
    params: {
      TITULO: context.user,
      CHAVE: context.chave,
    },
  });

  return response.data;
};

// Defina a interface para a resposta da API de ExibirPerfil
interface ExibirPerfilResponseItem {
  NOME: string;
  ID_PAGINA_INICIAL: number;
  AGENDAR_CONSULTA: boolean;
  EMITIR_INGRESSO: boolean;
  EXIBIR_ANUNCIO: boolean;
  EXIBIR_FOTO: boolean;
  EXIBIR_CAPA: boolean;
  TOTAL_DOCUMENTOS: number;
  ATUALIZAR_SERVICO: boolean;
  VALIDAR_SENHA: boolean;
  AVISAR_PUSH: boolean;
  MSG_AVISO_PUSH: string;
  TOTAL_ACESSOS: number;
  ULTIMO_ACESSO: string;
  EXIBIR_AVISOS: boolean;
  TOTAL_AVISOS: number;
  TITULARIDADE: boolean;
  FATURA_DIGITAL: boolean;
  HABILITAR_BIOMETRIA: boolean;
  ATUALIZAR_CAPA: string;
  ATUALIZAR_FOTO: string;
  TOTAL_PUSH: number;
  REMOVER_CAPA: boolean;
  EXIBIR_AGENDA: boolean;
  TERMO_CONECTA: boolean;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

// A resposta é um array de objetos do tipo ExibirPerfilResponseItem
type ExibirPerfilResponse = ExibirPerfilResponseItem[];

// Função para exibir perfil
export const exibirPerfil = async (): Promise<ExibirPerfilResponse> => {
  const context = getAuthContext();
  const url = `${baseURL}/${servicePath}/ExibirPerfil`;
  const response = await instance.get(url, {
    params: {
      TITULO: context.user,
      CHAVE: context.chave,
    },
  });

  context.setNome(response.data[0].NOME);

  return response.data;
};

// Defina a interface para os parâmetros da API de Resetar
interface ResetarParams {
  EMAIL: string;
}

// Defina a interface para a resposta da API de Resetar
interface ResetarResponseItem {
  TITULO: string;
  SENHA: string;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

// A resposta é um array de objetos do tipo ResetarResponseItem
type ResetarResponse = ResetarResponseItem[];

// Função para resetar senha
export const resetar = async (params: ResetarParams): Promise<ResetarResponse> => {
  const url = `${baseURL}/${servicePath}/Resetar`;
  const response = await instance.get(url, {
    params: {
      EMAIL: params.EMAIL,
    },
  });
  return response.data;
};

type UpdatePasswordResponse = any;

interface UpdatePasswordParams {
  TITULO: string;
  SENHA_ATUAL: string;
  NOVA_SENHA: string;
}

// Função para alterar a senha
export const updatePassword = async (params: UpdatePasswordParams): Promise<UpdatePasswordResponse> => {
  const url = `${baseURL}/${servicePath}/Alterar`;
  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO,
      SENHA_ATUAL: params.SENHA_ATUAL,
      NOVA_SENHA: params.NOVA_SENHA,
    },
  });
  return response.data;
};


// Defina a interface para os parâmetros da API de ListarNotificacao
interface ListarNotificacaoParams {
  TITULO: string;
  CHAVE: string;
}

// Defina a interface para os parâmetros da API de GravarNotificacao
interface GravarNotificacaoParams {
  TITULO: string;
  CHAVE: string;
  HABILITAR_PUSH: boolean;
  PUSH_APP: boolean;
  PUSH_ATIVIDADE: boolean;
  PUSH_CONVIDADO: boolean;
  PUSH_DEPENDENTE: boolean;
  PUSH_FINANCEIRO: boolean;
  PUSH_MEDICO: boolean;
  PUSH_OUVIDORIA: boolean;
  PUSH_VAGAS: boolean;
}

// Defina a interface para a resposta das APIs de Notificacao
interface NotificacaoResponseItem {
  TITULO: string;
  HABILITAR_PUSH: boolean;
  PUSH_APP: boolean;
  PUSH_ATIVIDADE: boolean;
  PUSH_CONVIDADO: boolean;
  PUSH_DEPENDENTE: boolean;
  PUSH_FINANCEIRO: boolean;
  PUSH_MEDICO: boolean;
  PUSH_OUVIDORIA: boolean;
  PUSH_VAGAS: boolean;
  ORDEM: number;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

// A resposta é um array de objetos do tipo NotificacaoResponseItem
type NotificacaoResponse = NotificacaoResponseItem[];

// Função para listar notificações
export const listarNotificacao = async (params: ListarNotificacaoParams): Promise<NotificacaoResponse> => {
  const url = `${baseURL}/${servicePath}/ListarNotificacao`;
  console.log('Enviando listarNotificacao com params:', params)
  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO,
      CHAVE: params.CHAVE,
    },
  });
  return response.data;
};

// Função para gravar notificações
export const gravarNotificacao = async (params: GravarNotificacaoParams): Promise<NotificacaoResponse> => {
  const url = `${baseURL}/${servicePath}/GravarNotificacao`;
  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO,
      CHAVE: params.CHAVE,
      HABILITAR_PUSH: params.HABILITAR_PUSH,
      PUSH_APP: params.PUSH_APP,
      PUSH_ATIVIDADE: params.PUSH_ATIVIDADE,
      PUSH_CONVIDADO: params.PUSH_CONVIDADO,
      PUSH_DEPENDENTE: params.PUSH_DEPENDENTE,
      PUSH_FINANCEIRO: params.PUSH_FINANCEIRO,
      PUSH_MEDICO: params.PUSH_MEDICO,
      PUSH_OUVIDORIA: params.PUSH_OUVIDORIA,
      PUSH_VAGAS: params.PUSH_VAGAS,
    },
  });
  return response.data;
};

// Defina a interface para os itens de serviço
interface ServicoItem {
  IDSERVICO: number;
  DESCRICAO: string;
  QUANTIDADE: number;
  ORDEM: number;
}

// Defina a interface para a resposta da API de ListarQuantidadeServicos
interface ListarQuantidadeServicosResponseItem {
  SERVICO: ServicoItem[];
  IMAGEM_CONTATO: string;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

// A resposta é um array de objetos do tipo ListarQuantidadeServicosResponseItem
type ListarQuantidadeServicosResponse = ListarQuantidadeServicosResponseItem[];

// Função para listar quantidade de serviços
export const listarQuantidadeServicos = async (): Promise<ListarQuantidadeServicosResponse> => {
  const context = getAuthContext();
  const url = `${baseURL}/${servicePath}/ListarQuantidadeServicos`;
  const response = await instance.get(url, {
    params: {
      TITULO: context.user,
      CHAVE: context.chave,
    },
  });
  return response.data;
};

// Função para avisar a API do clique na notificação (GravarAviso)

// Agora só recebe IDAVISO, TITULO e CHAVE vêm do contexto
interface GravarAvisoParams {
  IDAVISO: number;
}

interface GravarAvisoResponseItem {
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

type GravarAvisoResponse = GravarAvisoResponseItem[];

export const gravarAviso = async (params: GravarAvisoParams): Promise<GravarAvisoResponse> => {
  const context = getAuthContext();
  const url = `${baseURL}/${servicePath}/GravarAviso`;
  // A API espera application/x-www-form-urlencoded
  const searchParams = new URLSearchParams();
  searchParams.append('TITULO', context.user);
  searchParams.append('CHAVE', context.chave);
  searchParams.append('IDAVISO', params.IDAVISO.toString());
  const response = await instance.post(url, searchParams, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

// Função para excluir aviso
interface ExcluirAvisoParams {
  IDAVISO: number;
}

interface ExcluirAvisoResponseItem {
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

type ExcluirAvisoResponse = ExcluirAvisoResponseItem[];

export const excluirAviso = async (params: ExcluirAvisoParams): Promise<ExcluirAvisoResponse> => {
  const context = getAuthContext();
  const url = `${baseURL}/${servicePath}/ExcluirAviso`;
  const searchParams = new URLSearchParams();
  searchParams.append('TITULO', context.user);
  searchParams.append('CHAVE', context.chave);
  searchParams.append('IDAVISO', params.IDAVISO.toString());
  const response = await instance.post(url, searchParams, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

/*
Exemplo de resposta da API:
[
    {
        "SERVICO": [
            {
                "IDSERVICO": 1,
                "DESCRICAO": "Serviços",
                "QUANTIDADE": 47,
                "ORDEM": 1
            },
            {
                "IDSERVICO": 2,
                "DESCRICAO": "Dependentes",
                "QUANTIDADE": 66,
                "ORDEM": 2
            },
            {
                "IDSERVICO": 3,
                "DESCRICAO": "Convites",
                "QUANTIDADE": 3,
                "ORDEM": 3
            },
            {
                "IDSERVICO": 4,
                "DESCRICAO": "Locações",
                "QUANTIDADE": 62,
                "ORDEM": 4
            }
        ],
        "IMAGEM_CONTATO": "http://clubepaineiras.com.br/Alive/pFiles/Contato/contato.png",
        "ERRO": false,
        "IDERRO": 0,
        "MSG_ERRO": ""
    }
]
*/