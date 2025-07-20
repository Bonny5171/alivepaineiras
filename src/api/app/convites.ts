import { AxiosResponse } from 'axios';
import { getAuthContext } from '@/providers/AuthProvider';
import instance from '../api';

const baseURL = 'https://clubepaineiras.com.br/AliveTeste';
const servicePath = 'Alive.App.Atendimentos/GoVisit.asmx';
/*
        const context = getAuthContext();
        TITULO: context.user,
        CHAVE: context.chave,
*/

interface GravarConvitesResponse {
    LINK: string;
    ORDEM: number;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

interface GravarConvitesParams {
    QUANTIDADE: number;
    DATA: string; // format: dd/MM/yyyy
}

export async function gravarConvites(params: GravarConvitesParams): Promise<GravarConvitesResponse[]> {
    const context = getAuthContext();
    const query = new URLSearchParams({
        TITULO: context.user,
        QUANTIDADE: params.QUANTIDADE.toString(),
        DATA: params.DATA,
        CHAVE: context.chave,
    }).toString();

    const url = `${baseURL}/${servicePath}/GravarConvites?${query}`;
    const response: AxiosResponse<GravarConvitesResponse[]> = await instance.get(url);
    return response.data;
}

interface ListarConvitesResponse {
    IDCONVITE: string;
    DATA: string;
    ANO: string;
    MES: string;
    QUANTIDADE: string;
    ORDEM: number;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

interface ListarConvitesParams {
    TITULO: string;
}

export async function listarConvites(params?: ListarConvitesParams): Promise<ListarConvitesResponse[]> {
    const context = getAuthContext();
    const query = new URLSearchParams({
        TITULO: params?.TITULO || context.user,
        CHAVE: context.chave,
    }).toString();

    const url = `${baseURL}/${servicePath}/ListarConvites?${query}`;
    const response: AxiosResponse<ListarConvitesResponse[]> = await instance.get(url);
    return response.data;
}

/**
 * [
  {
    "IDCONVITE": "389f5d37-c56d-42c5-9954-0365f08510c7",
    "DATA": "22/05/2025",
    "ANO": "2025",
    "MES": "Maio",
    "QUANTIDADE": "3",
    "LINK": "https://app-govisit-paineiras-visitantes.firebaseapp.com/#/convite/389f5d37-c56d-42c5-9954-0365f08510c7",
    "DTEMISSAO": "20/05/2025",
    "IDSTATUS": 1,
    "STATUS": "Em aberto",
    "ORDEM": 1,
    "ERRO": false,
    "IDERRO": 0,
    "MSG_ERRO": ""
  },
 */

interface ListarConvidadosResponse {
    IDCONVIDADO: string;
    NOME: string;
    CELULAR: string;
    IDSTATUS: number;
    STATUS: string;
    FOTO: string;
    ORDEM: number;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

interface ListarConvidadosParams {
    IDCONVITE: string;
}

export async function listarConvidados(params: ListarConvidadosParams): Promise<ListarConvidadosResponse[]> {
    const context = getAuthContext();
    const query = new URLSearchParams({
        TITULO: context.user,
        IDCONVITE: params.IDCONVITE,
        CHAVE: context.chave,
    }).toString();

    const url = `${baseURL}/${servicePath}/ListarConvidados?${query}`;
    const response: AxiosResponse<ListarConvidadosResponse[]> = await instance.get(url);
    return response.data;
}
/*
[
  {
    "IDCONVIDADO": "18e2a1a0-35af-11f0-baef-bb302dc7832e",
    "NOME": "Mateus",
    "CELULAR": "14999999999",
    "IDSTATUS": 6,
    "STATUS": "Pendente",
    "FOTO": "https://govisit-fotos.s3.us-east-1.amazonaws.com/Visitantes/Perfil/18e2a1a0-35af-11f0-baef-bb302dc7832e.jpg",
    "ORDEM": 1,
    "ERRO": false,
    "IDERRO": 0,
    "MSG_ERRO": ""
  },
 */

interface DeletarConviteResponse {
    ORDEM: number;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

interface DeletarConviteParams {
    IDCONVITE: string;
}

export async function deletarConvite(params: DeletarConviteParams): Promise<DeletarConviteResponse[]> {
    const context = getAuthContext();
    const query = new URLSearchParams({
        TITULO: context.user,
        IDCONVITE: params.IDCONVITE,
        CHAVE: context.chave,
    }).toString();

    const url = `${baseURL}/${servicePath}/DeletarConvite?${query}`;
    const response: AxiosResponse<DeletarConviteResponse[]> = await instance.get(url);
    return response.data;
}
interface ExibirInformacaoResponse {
    INFORMACAO: string;
    ORDEM: number;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

/*
Exemplo de resposta:
[
  {
    "INFORMACAO": "Cada convite é composto por 1 ou mais visitantes e a data do ingresso.\r\nVisitantes são todas as pessoas acima de 1 ano de idade e o ingresso de cada visitante tem o custo de R$ 110,00 debitados da conta do titular (existe a possibilidade de pagamento no ato da entrada).\r\nCada visitante tem direito a R$ 20,00 de desconto em consumo no clube.",
    "ORDEM": 0,
    "ERRO": false,
    "IDERRO": 0,
    "MSG_ERRO": ""
  }
]
*/

export async function exibirInformacao(): Promise<ExibirInformacaoResponse[]> {
    const context = getAuthContext();
    const chave = context.chave;
    const query = new URLSearchParams({
        CHAVE: chave,
    }).toString();

    const url = `${baseURL}/${servicePath}/ExibirInformacao?${query}`;
    const response: AxiosResponse<ExibirInformacaoResponse[]> = await instance.get(url);
    return response.data;
}