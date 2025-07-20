import { AxiosResponse } from 'axios';
import { getAuthContext } from '@/providers/AuthProvider';
import instance from '../api';

const baseURL = 'https://clubepaineiras.com.br/AliveTeste';
const associadosServicePath = 'Alive.App.Atendimentos/Associados.asmx';

export interface Associado {
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

const cache = new Map<string, Associado>();
export async function listarAssociados(): Promise<Associado[]> {
    const url = `${baseURL}/${associadosServicePath}/Listar`;
    const context = getAuthContext();
    const chaveCache = context.user || context.chave;

    if (cache.has(chaveCache)) return cache.get(chaveCache)!;

    const response: AxiosResponse<Associado[]> = await instance.get(url, {
        params: {
            TITULO: context.user,
            CHAVE: context.chave,
        },
    });

    cache.set(chaveCache, response.data);
    return response.data;
}
/**
 * [
    {
        "TITULO": "700000",
        "NOME": "Associado ",
        "IDADE": 34,
        "SEXO": "Masculino",
        "EMAIL": "marcela.cat@clubepaineiras.com",
        "TELEFONE": "11959503454",
        "DTNASCTO": "05/10/1990 00:00:00",
        "AVATAR": "http://clubepaineiras.com.br/Alive/pFiles/AVATAR/7000/56004.jpg",
        "IDPESSOA": 56004,
        "MATRICULAR": false,
        "ORDEM": 1,
        "ERRO": false,
        "IDERRO": 0,
        "MSG_ERRO": ""
    },
    {
        "TITULO": "700002",
        "NOME": "Marcela Camargo",
        "IDADE": 44,
        "SEXO": "Feminino",
        "EMAIL": "marcela.cat@clubepaineiras.com.br",
        "TELEFONE": "11959503454",
        "DTNASCTO": "03/05/1981 00:00:00",
        "AVATAR": "http://clubepaineiras.com.br/Alive/pFiles/AVATAR/7000/56364.jpg",
        "IDPESSOA": 56364,
        "MATRICULAR": false,
        "ORDEM": 2,
        "ERRO": false,
        "IDERRO": 0,
        "MSG_ERRO": ""
    },
 */

export interface Especialista {
    ICONE: string;
    IDESPECIALISTA: number;
    ESPECIALISTA: string;
    ESPECIALIDADE: string;
    IDCATEGORIA: number,
    ORDEM: number;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export async function listarEspecialistas(): Promise<Especialista[]> {
    const url = `${baseURL}/Alive.App.Atendimentos/Medico.asmx/ListarEspecialistas`;
    const context = getAuthContext();

    const response: AxiosResponse<Especialista[]> = await instance.get(url, {
        params: {
            TITULO: context.user,
            CHAVE: context.chave,
        },
    });

    return response.data;
}
/**
 * [
 *   {
 *     "IDESPECIALISTA": 6747,
 *     "ESPECIALISTA": "Ana Maria de O. Silva",
 *     "ESPECIALIDADE": "Terapia da Mão",
 *     "ORDEM": 1,
 *     "ERRO": false,
 *     "IDERRO": 0,
 *     "MSG_ERRO": ""
 *   },
 *   {
 *     "IDESPECIALISTA": 354527,
 *     "ESPECIALISTA": "Camila Campos Rodrigues Rossi",
 *     "ESPECIALIDADE": "Fisioterapia pélvica ",
 *     "ORDEM": 2,
 *     "ERRO": false,
 *     "IDERRO": 0,
 *     "MSG_ERRO": ""
 *   }
 * ]
 */

export interface Escala {
    DATA: string;
    DESCRICAO: string;
    HORARIOS: number;
    ORDEM: number;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export async function listarEscala(TITULO: string, IDESPECIALISTA: number): Promise<Escala[]> {
    const url = `${baseURL}/Alive.App.Atendimentos/Medico.asmx/ListarEscala`;
    const context = getAuthContext();

    const response: AxiosResponse<Escala[]> = await instance.get(url, {
        params: {
            TITULO,
            IDESPECIALISTA,
            CHAVE: context.chave,
        },
    });

    return response.data;
}
/**
 * [
 *   {
 *     "DATA": "26/05/2025",
 *     "DESCRICAO": "Segunda-Feira",
 *     "HORARIOS": 4,
 *     "ORDEM": 1,
 *     "ERRO": false,
 *     "IDERRO": 0,
 *     "MSG_ERRO": ""
 *   },
 *   {
 *     "DATA": "29/05/2025",
 *     "DESCRICAO": "Quinta-Feira",
 *     "HORARIOS": 7,
 *     "ORDEM": 2,
 *     "ERRO": false,
 *     "IDERRO": 0,
 *     "MSG_ERRO": ""
 *   }
 * ]
 */
export interface Horario {
    HORARIO: string;
    VALOR: number;
    ORDEM: number;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}
export async function listarHorarios(IDESPECIALISTA: number, DATA: string): Promise<Horario[]> {
    const url = `${baseURL}/Alive.App.Atendimentos/Medico.asmx/ListarHorarios`;
    const context = getAuthContext();

    const response: AxiosResponse<Horario[]> = await instance.get(url, {
        params: {
            IDESPECIALISTA,
            DATA,
            CHAVE: context.chave,
        },
    });

    return response.data;
}

/**
 * Lista os horários disponíveis para um especialista em uma data específica.
 * Exemplo de resposta:
 * [
 *   {
 *     "HORARIO": "13:00",
 *     "VALOR": 195,
 *     "ORDEM": 1,
 *     "ERRO": false,
 *     "IDERRO": 0,
 *     "MSG_ERRO": ""
 *   },
 *   {
 *     "HORARIO": "16:00",
 *     "VALOR": 195,
 *     "ORDEM": 2,
 *     "ERRO": false,
 *     "IDERRO": 0,
 *     "MSG_ERRO": ""
 *   }
 * ]
 */

export interface GravarResponse {
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export async function gravarHorario(HORARIO: string): Promise<GravarResponse[]> {
    const url = `${baseURL}/Alive.App.Atendimentos/Medico.asmx/Gravar`;
    const context = getAuthContext();

    const response: AxiosResponse<GravarResponse[]> = await instance.get(url, {
        params: {
            HORARIO,
            CHAVE: context.chave,
        },
    });

    return response.data;
}