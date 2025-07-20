import instance from '../api';
import { AxiosResponse } from 'axios';

// Defina a base do URL e o caminho do serviço
const baseURL = 'https://clubepaineiras.com.br/AliveTeste';
const servicePath = 'Alive.App.Atendimentos/Associados.asmx';

// Defina a interface para os parâmetros da API de AlterarCadastro
interface AlterarCadastroParams {
  TITULO: string;
  EMAIL: string;
  CELULAR: string;
  CHAVE: string;
}

// Defina a interface para a resposta da API de AlterarCadastro
interface AlterarCadastroResponseItem {
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

// A resposta é um array de objetos do tipo AlterarCadastroResponseItem
type AlterarCadastroResponse = AlterarCadastroResponseItem[];

// Função para alterar cadastro
export const alterarCadastro = async (params: AlterarCadastroParams): Promise<AlterarCadastroResponse> => {
  const url = `${baseURL}/${servicePath}/AlterarCadastro`;
  const response = await instance.get(url, {
    params: {
      TITULO: params.TITULO,
      EMAIL: params.EMAIL,
      CELULAR: params.CELULAR,
      CHAVE: params.CHAVE,
    },
  });

  return response.data;
};



// Defina a interface para os parâmetros da API de UploadAvatar
interface UploadAvatarParams {
  TITULO: string;
  CHAVE: string;
  AVATAR: string;
}

// Defina a interface para a resposta da API de UploadAvatar
interface UploadAvatarResponseItem {
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

// A resposta é um array de objetos do tipo UploadAvatarResponseItem
type UploadAvatarResponse = UploadAvatarResponseItem[];

// Função para fazer upload do avatar
export const uploadAvatar = async (params: UploadAvatarParams): Promise<UploadAvatarResponse> => {
  const url = `${baseURL}/${servicePath}/UploadAvatar`;

  const body = `TITULO=${encodeURIComponent(params.TITULO)}&CHAVE=${encodeURIComponent(params.CHAVE)}&AVATAR=${encodeURIComponent(params.AVATAR)}`;

  try {
    const response = await instance.post(url, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Erro ao fazer upload do avatar:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      requestBody: body,
    });
    throw error;
  }
};;