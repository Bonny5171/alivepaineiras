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
    ATESTADO_PARQ: boolean;
    AUTORIZACAO_PARQ: boolean;
    ORDEM: number;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
    STATUS?: string; // Adicionado para refletir o backend
    DATA_PARQ?: string; // Adicionado para refletir o backend
}

export async function listarAssociados(): Promise<Associado[]> {
    const url = `${baseURL}/${associadosServicePath}/Listar`;
    const context = getAuthContext();

    const response: AxiosResponse<Associado[]> = await instance.get(url, {
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
        "TITULO": "700000",
        "NOME": "Associado ",
        "IDADE": 34,
        "SEXO": "Masculino",
        "STATUS": "Sem registro", //Sem registro || Assinado || Expirado
        "DATA_PARQ": "Expirado em 01/01/2024",
        "EMAIL": "marcela.cat@clubepaineiras.com",
        "TELEFONE": "11959503454",
        "DTNASCTO": "05/10/1990 00:00:00",
        "AVATAR": "https://clubepaineiras.com.br/Alive/pFiles/AVATAR/7000/56004.jpg",
        "IDPESSOA": 56004,
        "MATRICULAR": false,
        "ATESTADO_PARQ": false,
        "AUTORIZACAO_PARQ": false,
        "ORDEM": 1,
        "ERRO": false,
        "IDERRO": 0,
        "MSG_ERRO": ""
    },
]
*/

export interface PerguntaParq {
    IDPERGUNTA: number;
    PERGUNTA: string;
    ORDEM: number;
}

export interface QuestionarioParq {
    QUESTIONARIO: PerguntaParq[];
}

export interface RespostaParq {
    IDPERGUNTA: number;
    RESPOSTA: boolean;
    ORDEM: number;
}

export interface QuestionarioRespostaParq {
    QUESTIONARIO: RespostaParq[];
}

export interface ParqApiResponse {
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

// Listar perguntas do PAR-Q
export async function listarPerguntasParq(TITULO: string): Promise<QuestionarioParq[]> {
    const context = getAuthContext();
    const url = `${baseURL}/Alive.App.Atendimentos/Medico.asmx/ListarPerguntas`;
    const response: AxiosResponse<QuestionarioParq[]> = await instance.get(url, {
        params: {
            TITULO: TITULO || context.user,
            CHAVE: context.chave,
        },
    });
    return response.data;
}
/*
Exemplo de resposta:
[
    {
        "QUESTIONARIO": [
            {
                "IDPERGUNTA": 1,
                "PERGUNTA": "1. Algum médico já disse que você possui algum problema de coração e que só deveria realizar atividade física supervisionado por profissionais de saúde?",
                "ORDEM": 1
            },
            {
                "IDPERGUNTA": 2,
                "PERGUNTA": "2. Você sente dores no peito quando pratica atividade física?",
                "ORDEM": 2
            },
            {
                "IDPERGUNTA": 3,
                "PERGUNTA": "3. No último mês, você sentiu dores no peito quando praticou atividade física?",
                "ORDEM": 3
            }
        ]
    }
]
*/

// Gravar respostas do PAR-Q
export async function gravarRespostasParq(TITULO:number, respostas: QuestionarioRespostaParq[]): Promise<ParqApiResponse[]> {
    const context = getAuthContext();
    const url = `${baseURL}/Alive.App.Atendimentos/Medico.asmx/GravarRespostas`;
    const formData = new URLSearchParams();
    formData.append('TITULO', TITULO.toString());
    formData.append('RESPOSTAS', JSON.stringify(respostas));
    formData.append('CHAVE', context.chave);
    const response: AxiosResponse<ParqApiResponse[]> = await instance.post(url, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
}
/*
Exemplo de resposta:
[
    {
        "ERRO": false,
        "IDERRO": 0,
        "MSG_ERRO": ""
    }
]
*/

// Listar respostas do PAR-Q
export async function listarRespostasParq(titulo: string): Promise<QuestionarioRespostaParq[]> {
    const context = getAuthContext();
    const url = `${baseURL}/Alive.App.Atendimentos/Medico.asmx/ListarRespostas`;
    const response: AxiosResponse<QuestionarioRespostaParq[]> = await instance.get(url, {
        params: {
            TITULO: titulo || context.user,
            CHAVE: context.chave,
        },
    });
    return response.data;
}
/*
Exemplo de resposta:
[
    {
        "QUESTIONARIO": [
            {
                "IDPERGUNTA": 1,
                "RESPOSTA": false,
                "ORDEM": 1
            },
            {
                "IDPERGUNTA": 2,
                "RESPOSTA": true,
                "ORDEM": 2
            },
            {
                "IDPERGUNTA": 3,
                "RESPOSTA": false,
                "ORDEM": 3
            }
        ]
    }
]
*/

// Gravar arquivos do PAR-Q (atestado e autorização)
/*exemplo respostas
    [ { "QUESTIONARIO":[ { "IDPERGUNTA":1, "RESPOSTA":false, "ORDEM":1 }, { "IDPERGUNTA":2, "RESPOSTA":true, "ORDEM":2 }, { "IDPERGUNTA":3, "RESPOSTA":false, "ORDEM":3 }, { "IDPERGUNTA":4, "RESPOSTA":false, "ORDEM":4 }, { "IDPERGUNTA":5, "RESPOSTA":true, "ORDEM":5 }, { "IDPERGUNTA":6, "RESPOSTA":true, "ORDEM":6 }, { "IDPERGUNTA":7, "RESPOSTA":true, "ORDEM":7 } ], "ERRO":false, "IDERRO":0, "MSG_ERRO":"" } ]
*/
export async function gravarArquivosParq(titulo: string, atestado: string, autorizacao: string): Promise<ParqApiResponse[]> {
    const context = getAuthContext();
    const url = `${baseURL}/Alive.App.Atendimentos/Medico.asmx/GravarArquivosParQ`;
    const formData = new URLSearchParams();
    formData.append('TITULO', titulo || context.user);
    formData.append('ATESTADO', atestado);
    formData.append('AUTORIZACAO', autorizacao);
    formData.append('CHAVE', context.chave);
    const response: AxiosResponse<ParqApiResponse[]> = await instance.post(url, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
}
/*
Exemplo de resposta:
[
    {
        "ERRO": false,
        "IDERRO": 0,
        "MSG_ERRO": ""
    }
]
*/

export interface ArquivosParqResponse {
    ATESTADO: string;
    AUTORIZACAO: string;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

// Exibir arquivos do PAR-Q (atestado e autorização)
export async function exibirArquivosParq(titulo: string): Promise<ArquivosParqResponse[]> {
    const context = getAuthContext();
    const url = `${baseURL}/Alive.App.Atendimentos/Medico.asmx/ExibirArquivosParQ`;
    const response: AxiosResponse<ArquivosParqResponse[]> = await instance.get(url, {
        params: {
            TITULO: titulo || context.user,
            CHAVE: context.chave,
        },
    });
    return response.data;
}
// Exemplo de resposta:
// [
//   {
//     "ATESTADO": "https://clubepaineiras.com.br/Alive/pFiles/PARQ/700000/56004Atestado.pdf",
//     "AUTORIZACAO": "https://clubepaineiras.com.br/Alive/pFiles/PARQ/700000/56004Autorizacao.jpg",
//     "ERRO": false,
//     "IDERRO": 0,
//     "MSG_ERRO": ""
//   }
// ]