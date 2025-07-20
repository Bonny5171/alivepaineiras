import { getAuthContext } from '@/providers/AuthProvider';
import instance from '../api';

// Defina a base do URL e o caminho do serviço
const baseURL = 'https://clubepaineiras.com.br/AliveTeste';
const servicePath = 'Alive.App.Agenda/Horarios.asmx';

// Defina a interface para a resposta de ExibirPublico
export interface ExibirPublicoResponse {
    PUBLICO: string;
    ACADEMIA: string;
    ESTACIONAMENTO: string;
    TITULO: string;
    EXIBIR_PUBLICO: boolean;
    EXIBIR_LIMITE: boolean;
    ORDEM: number;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

// Função para exibir o público
export const exibirPublico = async (): Promise<ExibirPublicoResponse[]> => {
    const context = getAuthContext();
    const url = `${baseURL}/${servicePath}/ExibirPublico`;

    // Faz a requisição GET para o endpoint de ExibirPublico
    const response = await instance.get(url, {
        params: {
            TITULO: context.user,
            CHAVE: context.chave,
        },
    });

    return response.data;
};