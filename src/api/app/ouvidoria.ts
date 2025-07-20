import { AxiosResponse } from 'axios';
import { getAuthContext } from '@/providers/AuthProvider';
import instance from '../api';

const baseURL = 'https://clubepaineiras.com.br/AliveTeste';
const servicePath = 'Alive.App.Atendimentos/Ocorrencias.asmx';
const conectaServicePath = 'Alive.App.Conecta/Conecta.asmx';

export interface Ocorrencia {
    IDOCORRENCIA: number;
    DATA: string;
    TIPO: string;
    MOTIVO: string;
    PROTOCOLO: string;
    STATUS: string;
    AVALIAR: boolean;
    RECORRER: boolean;
    ORDEM: number;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export async function listarOcorrencias(): Promise<Ocorrencia[]> {
    const url = `${baseURL}/${servicePath}/Listar`;
    const context = getAuthContext();

    const response: AxiosResponse<Ocorrencia[]> = await instance.get(url, {
        params: {
            TITULO: context.user,
            CHAVE: context.chave,
        },
    });

    return response.data;
}

export interface ProtocoloResponse {
    PROTOCOLO: string;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export async function gerarProtocolo(): Promise<ProtocoloResponse> {
    const url = `${baseURL}/${servicePath}/GerarProtocolo`;
    const context = getAuthContext();

    const response: AxiosResponse<ProtocoloResponse[]> = await instance.get(url, {
        params: {
            TITULO: context.user,
            CHAVE: context.chave,
        },
    });

    return response.data[0];
}

export interface GravarOcorrenciaParams {
    DESCRICAO: string;
    IDMOTIVO: number;
    PRIVADO: number;
    LOCAL: string;
    DATA: string;
    HORA: string;
}

export interface GravarOcorrenciaResponse {
    IDOCORRENCIA: number;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export async function gravarOcorrencia(params: GravarOcorrenciaParams): Promise<GravarOcorrenciaResponse> {
    const url = `${baseURL}/${servicePath}/Gravar`;
    const context = getAuthContext();

    const response: AxiosResponse<GravarOcorrenciaResponse[]> = await instance.get(url, {
        params: {
            TITULO: context.user,
            CHAVE: context.chave,
            ...params,
        },
    });

    return response.data[0];
}

export interface GravarImagemParams {
    IDOCORRENCIA: number;
    IMAGEM: string;
}

export interface GravarImagemResponse {
    IDOCORRENCIA: number;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export async function gravarImagem(params: GravarImagemParams): Promise<GravarImagemResponse> {
    const url = `${baseURL}/${servicePath}/GravarImagem`;
    const context = getAuthContext();
    console.log('GravarImagem', params);

    const formData = new URLSearchParams();
    formData.append('IDOCORRENCIA', params.IDOCORRENCIA.toString());
    formData.append('IMAGEM', params.IMAGEM);
    formData.append('CHAVE', context.chave);

    const response: AxiosResponse<GravarImagemResponse[]> = await instance.post(url, formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    return response.data[0];
}

export interface AnexoURL {
    NOME_ARQUIVO: string;
    ARQUIVO: string;
    LINK_ARQUIVO: string;
    ORDEM: number;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export async function listarAnexosURL(IDOCORRENCIA: number): Promise<AnexoURL[]> {
    const url = `${baseURL}/${servicePath}/ListarAnexosURL`;
    const context = getAuthContext();

    const formData = new URLSearchParams();
    formData.append('IDOCORRENCIA', IDOCORRENCIA.toString());
    formData.append('CHAVE', context.chave);

    const response: AxiosResponse<AnexoURL[]> = await instance.post(url, formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    return response.data;
}

export interface EnviarAudioParams {
    TITULO: string;
    AUDIO: string;
    CHAVE: string;
}

export interface EnviarAudioResponse {
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export async function enviarAudio(audio: string): Promise<EnviarAudioResponse> {
    const url = `${baseURL}/${servicePath}/EnviarAudio`;
    const context = getAuthContext();

    const formData = new URLSearchParams();
    formData.append('TITULO', context.user);
    formData.append('AUDIO', audio);
    formData.append('CHAVE', context.chave);

    const response: AxiosResponse<EnviarAudioResponse[]> = await instance.post(url, formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    return response.data[0];
}

export interface ExibirOcorrenciaResponse {
    TITULO: string;
    ASSOCIADO: string;
    DESCRICAO: string;
    RESPOSTA: string;
    EXIBIR_RESPOSTA: boolean;
    PROTOCOLO: string;
    MOTIVO: string;
    DATA: string;
    HORARIO: string;
    LOCAL: string;
    TIPO: string;
    EXIBIR_ANEXOS: boolean;
    LISTAR_AREAS: boolean;
    IDMOTIVO: number;
    PRIVADO: number;
    AVALIAR: boolean;
    NOME_ARQUIVO: string;
    AUDIO: string;
    IMAGEM: string;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export async function exibirOcorrencia(IDOCORRENCIAS: number): Promise<ExibirOcorrenciaResponse> {
    const url = `${baseURL}/${servicePath}/Exibir`;
    const context = getAuthContext();

    const response: AxiosResponse<ExibirOcorrenciaResponse[]> = await instance.get(url, {
        params: {
            TITULO: context.user,
            IDOCORRENCIAS,
            CHAVE: context.chave,
        },
    });

    return response.data[0];
}

export interface GravarImagemNotionParams {
    IDIMAGEM: string;
    IMAGEM: string;
}

export interface GravarImagemNotionResponse {
    LINK: string;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

export async function gravarImagemNotion(params: GravarImagemNotionParams): Promise<GravarImagemNotionResponse> {
    const url = `${baseURL}/${conectaServicePath}/GravarImagemNotion`;
    const context = getAuthContext();

    const formData = new URLSearchParams();
    formData.append('IDIMAGEM', params.IDIMAGEM);
    formData.append('IMAGEM', params.IMAGEM);
    formData.append('CHAVE', context.chave);

    const response: AxiosResponse<GravarImagemNotionResponse[]> = await instance.post(url, formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    return response.data[0];
}

export async function fetchTermoClassificados(): Promise<string> {
    const context = getAuthContext();
    const url = `${baseURL}/${conectaServicePath}/ExibirTermo`;
    const params = {
        TIPO: 3,
        CHAVE: context.chave,
    };
    try {
        const response = await instance.get(url, { params });
        // Se a resposta for JSON direto
        if (Array.isArray(response.data)) {
            return response.data[0]?.DESCRICAO || '';
        }
        // Se vier como string JSON
        if (typeof response.data === 'string') {
            const arr = JSON.parse(response.data);
            return arr[0]?.DESCRICAO || '';
        }
        return '';
    } catch (e) {
        return '';
    }
}