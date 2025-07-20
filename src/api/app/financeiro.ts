import { AxiosResponse } from 'axios';
import { getAuthContext } from '@/providers/AuthProvider';
import instance from '../api';

// Defina a base do URL e o caminho do serviço
const baseURL = 'https://clubepaineiras.com.br/AliveTeste';
const servicePath = 'Alive.App/Financeiro.asmx';

// Defina a interface para os itens de fatura
interface FaturaItem {
  REFERENCIA: string;
  DESCRICAO: string;
  VENCIMENTO: string;
  STATUS: string;
  VALOR: string;
  ORDEM: number;
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

// A resposta é um array de objetos do tipo FaturaItem
type ListarFaturasResponse = FaturaItem[];

// Função para listar faturas
export const listarFaturas = async (): Promise<ListarFaturasResponse> => {
    const context = getAuthContext();
    const url = `${baseURL}/${servicePath}/ListarFaturas`;

    // Faz a requisição GET para o endpoint de ListarFaturas
    const response = await instance.get(url, {
        params: {
            TITULO: context.user,
            CHAVE: context.chave,
        },
    });

    return response.data;
};

export interface ExibirFaturaResponse {
    VENCIMENTO: string;
    CODIGO: string;
    VALOR: string;
    ENVIAR: boolean;
    EMAIL: string;
    ORDEM: number;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export const exibirFatura = async ( referencia: string): Promise<ExibirFaturaResponse[]> => {
    const context = getAuthContext();
    const url = `${baseURL}/${servicePath}/ExibirFatura`;

    // Faz a requisição GET para o endpoint de ExibirFatura
    const response = await instance.get(url, {
        params: {
            TITULO: context.user,
            REFERENCIA: referencia,
            CHAVE: context.chave,
        },
    });

    return response.data;
};

export interface EnviarFaturaResponse {
    PERMITIR_LIGACAO: boolean;
    TELEFONE: string;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export const enviarFatura = async (referencia: string): Promise<EnviarFaturaResponse[]> => {
    const context = getAuthContext();
    const url = `${baseURL}/${servicePath}/EnviarFatura`;

    // Faz a requisição GET para o endpoint de EnviarFatura
    const response = await instance.get(url, {
        params: {
            TITULO: context.user,
            REFERENCIA: referencia,
            CHAVE: context.chave,
        },
    });

    return response.data;
};

export interface VisualizarBoletoResponse {
    ARQUIVO: string;
    LINK: string;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export const visualizarBoleto = async (referencia: string): Promise<VisualizarBoletoResponse[]> => {
    const context = getAuthContext();
    const url = `${baseURL}/${servicePath}/VisualizarBoleto`;

    // Faz a requisição GET para o endpoint de VisualizarBoleto
    const response = await instance.get(url, {
        params: {
            TITULO: context.user,
            REFERENCIA: referencia,
            CHAVE: context.chave,
        },
    });

    return response.data;
};


export interface ListarTaxasResponse {
    GRUPO: string;
    TAXA: string;
    VALOR: string;
    NOME: string;
    DATA: string;
    ORDEM: number;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export const listarTaxas = async (referencia: string): Promise<ListarTaxasResponse[]> => {
    const context = getAuthContext();
    const url = `${baseURL}/${servicePath}/ListarTaxas`;

    // Faz a requisição GET para o endpoint de ListarTaxas
    const response = await instance.get(url, {
        params: {
            TITULO: context.user,
            REFERENCIA: referencia,
            CHAVE: context.chave,
        },
    });

    return response.data;
};

export interface VerificarTiqueteResponse {
    VALIDO: boolean;
    MENSAGEM: string;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export const verificarTiquete = async (tiquete: string): Promise<VerificarTiqueteResponse> => {
    const context = getAuthContext();
    const url = `${baseURL}/${servicePath}/VerificarTiquete`;
    try {
        const response = await instance.get(url, {
            params: {
                TITULO: context.user,
                CHAVE: context.chave, 
                TIQUETE: tiquete,
            },
        });
        return response.data[0];
    } catch (error) {
        throw error;
    }
};

export interface ValidarTiqueteResponse {
    SUCESSO: boolean;
    MENSAGEM: string;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export const validarTiquete = async (
    tiquete: string,
    valor: string
): Promise<ValidarTiqueteResponse> => {
    const context = getAuthContext();
    const url = `${baseURL}/${servicePath}/ValidarTiquete`;
    try {
        const response = await instance.get(url, {
            params: {
                TITULO: context.user,
                CHAVE: context.chave,
                TIQUETE: tiquete,
                VALOR: valor,
            },
        });
        return response.data[0];
    } catch (error) {
        throw error;
    }
};