import { AxiosResponse } from 'axios';
import { getAuthContext } from '@/providers/AuthProvider';
import instance from '../api';

const baseURL = 'https://clubepaineiras.com.br/AliveTeste';
const servicePathCessao = 'Alive.App.Locais/Cessao.asmx';
export interface Local {
    IDLOCAL: number;
    LOCALIDADE: string;
    GRUPO: string;
    RESTRICAO: string;
    OBSERVACAO: string;
    ORIENTACAO: string;
    ICONE: number;
    COR: string;
    EXIBIR_EXAME: boolean;
    IDATIVIDADES: number;
    IDTIPOENVIO: number;
    ASSUNTO: string;
    MENSAGEM: string;
    CAPACIDADE: number;
    DESCRICAO: string;
    ORDEM: number;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export async function listarLocais(): Promise<Local[]> {
    const url = `${baseURL}/${servicePathCessao}/ListarLocais`;
    const context = getAuthContext();

    const response: AxiosResponse<Local[]> = await instance.get(url, {
        params: {
            TITULO: context.user,
            CHAVE: context.chave,
        },
    });

    return response.data;
}

export interface DetalhesLocal {
    IDLOCAL: number;
    DESCRICAO: string;
    CAPACIDADE: number;
    PRECO: string;
    OBSERVACAO: string;
    TERMO: string;
    CAPA: string;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export async function exibirDetalhes(idLocal: number): Promise<DetalhesLocal[]> {
    const url = `${baseURL}/${servicePathCessao}/ExibirDetalhes`;
    const context = getAuthContext();

    const response: AxiosResponse<DetalhesLocal[]> = await instance.get(url, {
        params: {
            TITULO: context.user,
            IDLOCAL: idLocal,
            CHAVE: context.chave,
        },
    });

    return response.data;
}
/*
[
    {
        "IDLOCAL": 1410,
        "DESCRICAO": "Churrasqueira Primavera.",
        "CAPACIDADE": 30,
        "PRECO": "240",
        "OBSERVACAO": "",
        "TERMO": "",
        "CAPA": "http://clubepaineiras.com.br/Alive/pFiles/Locacao/Capa/foto.jpg",
        "ERRO": false,
        "IDERRO": 0,
        "MSG_ERRO": ""
    }
]
 */

export interface GaleriaImagem {
    IDIMAGEM: number;
    LINK: string;
    ORDEM: number;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export async function listarGaleria(idLocal: number): Promise<GaleriaImagem[]> {
    const url = `${baseURL}/${servicePathCessao}/ListarGaleria`;
    const context = getAuthContext();

    const response: AxiosResponse<GaleriaImagem[]> = await instance.get(url, {
        params: {
            TITULO: context.user,
            IDLOCAL: idLocal,
            CHAVE: context.chave,
        },
    });

    return response.data;
}
/**
 * [
    {
        "IDIMAGEM": 0,
        "LINK": "http://clubepaineiras.com.br/Alive/pFiles/Locacao/Galeria/foto.jpg",
        "ORDEM": 0,
        "ERRO": false,
        "IDERRO": 0,
        "MSG_ERRO": ""
    }
]
 */

export interface Disponibilidade {
    IDLOCAL: number;
    DIA: string;
    RESERVADO: boolean;
    ORDEM: number;
    ERRO: boolean;
    IDERRO: number;
    TERMOS_USO: string;
    MSG_ERRO: string;
}

export async function listarDisponibilidade(
    idLocal: number,
    mes: number,
    ano: number
): Promise<Disponibilidade[]> {
    const url = `${baseURL}/${servicePathCessao}/ListarDisponibilidade`;
    const context = getAuthContext();

    const response: AxiosResponse<Disponibilidade[]> = await instance.get(url, {
        params: {
            TITULO: context.user,
            IDLOCAL: idLocal,
            MES: mes.toString().padStart(2, '0'),
            ANO: ano,
            CHAVE: context.chave,
        },
    });

    return response.data;
}
/**
 * [
    {
        "IDLOCAL": 1410,
        "DIA": "25/05/2025",
        "RESERVADO": false,
        "ORDEM": 1,
        "ERRO": false,
        "IDERRO": 0,
        "MSG_ERRO": ""
    },
    {
        "IDLOCAL": 1410,
        "DIA": "25/05/2025",
        "RESERVADO": false,
        "ORDEM": 2,
        "ERRO": false,
        "IDERRO": 0,
        "MSG_ERRO": ""
    }
]
 */

export interface ReservaResponse {
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
    // Add other fields if the API returns more data
}

export async function reservar(
    idLocal: number,
    data: string // format: 'DD/MM/YYYY'
): Promise<ReservaResponse> {
    const url = `${baseURL}/${servicePathCessao}/Reservar`;
    const context = getAuthContext();

    const response: AxiosResponse<ReservaResponse> = await instance.get(url, {
        params: {
            TITULO: context.user,
            IDLOCAL: idLocal,
            DATA: data,
            CHAVE: context.chave,
        },
    });

    return response.data;
}

export interface Reserva {
    IDLOCACAO: number;
    LOCAL: string;
    STATUS: string;
    DATA: string;
    ORDEM: number;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export async function listarReserva(): Promise<Reserva[]> {
    const url = `${baseURL}/${servicePathCessao}/ListarReserva`;
    const context = getAuthContext();

    const response: AxiosResponse<Reserva[]> = await instance.get(url, {
        params: {
            TITULO: context.user,
            CHAVE: context.chave,
        },
    });

    return response.data;
}
/*
[
    {
        "IDLOCACAO": 6576,
        "LOCAL": "Churrasqueira Primavera.",
        "STATUS": "Aguardando liberação",
        "DATA": "25/05/2025",
        "ORDEM": 1,
        "ERRO": false,
        "IDERRO": 0,
        "MSG_ERRO": ""
    },
    {
        "IDLOCACAO": 6575,
        "LOCAL": "Churrasqueira Primavera.",
        "STATUS": "Aguardando liberação",
        "DATA": "25/05/2025",
        "ORDEM": 2,
        "ERRO": false,
        "IDERRO": 0,
        "MSG_ERRO": ""
    },
    {
        "IDLOCACAO": 6574,
        "LOCAL": "Churrasqueira Primavera.",
        "STATUS": "Aguardando liberação",
        "DATA": "25/05/2025",
        "ORDEM": 3,
        "ERRO": false,
        "IDERRO": 0,
        "MSG_ERRO": ""
    },
    ]
 */

    export interface CancelarReservaResponse {
        ERRO: boolean;
        IDERRO: number;
        MSG_ERRO: string;
    }

    export async function cancelarReserva(idLocacao: number): Promise<CancelarReservaResponse[]> {
        const url = `${baseURL}/${servicePathCessao}/Cancelar`;
        const context = getAuthContext();

        const params = new URLSearchParams();
        params.append('TITULO', context.user);
        params.append('IDLOCACAO', idLocacao.toString());
        params.append('CHAVE', context.chave);

        const response: AxiosResponse<CancelarReservaResponse[]> = await instance.post(url, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        return response.data;
    }