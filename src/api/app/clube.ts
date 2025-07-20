import { getAuthContext } from '@/providers/AuthProvider';
import instance from '../api';

// Defina a base do URL e o caminho do serviço
const baseURL = 'https://clubepaineiras.com.br/AliveTeste';
const destaquesPath = 'Alive.App.Agenda/Destaques.asmx';


// Defina a interface para os grupos
export interface GrupoItem {
    IDGRUPO: number;
    NOME: string;
    ICONE: string;
    ORDEM: number;
}

// A resposta é um array com um objeto que contém a propriedade GRUPOS (array de GrupoItem) e IMAGEM
export type ListarGruposResponse = { GRUPOS: GrupoItem[]; IMAGEM?: string }[];

// Função para listar grupos
export const listarGrupos = async (): Promise<ListarGruposResponse> => {
    const context = getAuthContext();
    const url = `${baseURL}/${destaquesPath}/ListarGrupos`;
    const response = await instance.post(
        url,
        new URLSearchParams({
            TITULO: context.user,
            CHAVE: context.chave,
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );
    return response.data;
};

/*
Exemplo de resposta:
[
    {
        "GRUPOS": [
            {
                "IDGRUPO": 1,
                "NOME": "Piscinas",
                "ICONE": "fa-water-ladder",
                "ORDEM": 1
            },
            {
                "IDGRUPO": 2,
                "NOME": "Quadras",
                "ICONE": "fa-goal-net",
                "ORDEM": 2
            },
            {
                "IDGRUPO": 3,
                "NOME": "Ginásios",
                "ICONE": "fa-school-flag",
                "ORDEM": 3
            }
        ],
        "IMAGEM": "https://clubepaineiras.com.br/Alive/pFiles/Clube/0.jpg",
    }
]
*/

// Defina a interface para os locais
export interface LocalItem {
    IDLOCAL: number;
    NOME: string;
    ICONE: string;
    IMAGEM: string;
    DESCRICAO: string;
    LOCALIZACAO: string;
    ORDEM: number;
    ERRO: boolean;
    IDERRO: number;
    MSG_ERRO: string;
}

// A resposta é um array de LocalItem
type ListarLocaisResponse = LocalItem[];

// Função para listar locais
export const listarLocais = async (idGrupo: number): Promise<ListarLocaisResponse> => {
    const context = getAuthContext();
    const url = `${baseURL}/${destaquesPath}/ListarLocais`;
    const response = await instance.post(
        url,
        new URLSearchParams({
            TITULO: context.user,
            IDGRUPO: idGrupo.toString(),
            CHAVE: context.chave,
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );
    return response.data;
};

/*
Exemplo de resposta:
[
    {
        "IDLOCAL": 2,
        "NOME": "Piscina Kids",
        "ICONE": "",
        "IMAGEM": "https://clubepaineiras.com.br/Alive/pFiles/Clube/0.jpg",
        "DESCRICAO": "A Piscina Kids foi especialmente projetada para crianças, tematizada para oferecer uma experiência divertida e segura. \nAulas de Natação: Disponíveis para diferentes faixas etárias, permitindo que as crianças aprendam a nadar desde cedo. \nOs pais podem acompanhar as aulas de seus filhos na arquibancada ao lado da piscina.\n",
        "LOCALIZACAO": "1ºsubsolo , próximas ao Café Paineiras",
        "ORDEM": 1,
        "ERRO": false,
        "IDERRO": 0,
        "MSG_ERRO": ""
    },
    {
        "IDLOCAL": 3,
        "NOME": "Piscina Olimpica",
        "ICONE": "",
        "IMAGEM": "https://clubepaineiras.com.br/Alive/pFiles/Clube/0.jpg",
        "DESCRICAO": "Esta piscina é projetada para atender aos padrões internacionais, proporcionando um ambiente adequado tanto para atletas de alto rendimento quanto para os associados que desejam praticar natação em um espaço de qualidade.\n Ela é utilizada para diversas atividades, entre elas:  Natação competitiva, Treinos de polo aquático e  Eventos esportivos\n",
        "LOCALIZACAO": "3º subsolo - Complexo do Vale. Acesso pelos elevadores da passarela",
        "ORDEM": 2,
        "ERRO": false,
        "IDERRO": 0,
        "MSG_ERRO": ""
    }
]
*/