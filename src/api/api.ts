import { getLogout } from '@/providers/AuthProvider';
import { convalidar } from '@/api/app/auth';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Config from 'react-native-config';

//Define se o modo de depuração está ativado
// Se DEBUG for true, os logs serão exibidos no console
const isDebug = Config.EXPO_PUBLIC_DEBUG === 'true';
const DEBUG = __DEV__ && isDebug;

// Códigos de cores ANSI
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',

    // Cores de texto
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',

    // Cores de fundo
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',
};

// Função para resumir objetos grandes para log
function summarizeData(data: any, maxLines = 10): any {
    if (Array.isArray(data)) {
        if (data.length === 0) return [];
        if (data.length > maxLines) {
            return [
                ...data.slice(0, maxLines).map(item => summarizeData(item, maxLines)),
                `... (${data.length - maxLines} more items)`
            ];
        }
        return data.map(item => summarizeData(item, maxLines));
    } else if (typeof data === 'object' && data !== null) {
        const summary: any = {};
        for (const key in data) {
            if (Array.isArray(data[key])) {
                summary[key] = summarizeData(data[key], maxLines);
            } else if (typeof data[key] === 'object' && data[key] !== null) {
                // Resumir subobjeto se tiver mais de 10 linhas
                const str = JSON.stringify(data[key], null, 2);
                const lines = str.split('\n');
                if (lines.length > maxLines) {
                    summary[key] = {
                        ...summarizeData(data[key], maxLines),
                        _summary: `... (${lines.length - maxLines} more lines)`
                    };
                } else {
                    summary[key] = summarizeData(data[key], maxLines);
                }
            } else {
                summary[key] = data[key];
            }
        }
        return summary;
    }
    return data;
}

// Função para criar logs coloridos
const logColor = (color: string, message: string, data?: any) => {
    if (!DEBUG) return;
    //  console.log(`${color}%s${colors.reset}`, message);
    if (data) {
    // console.log(JSON.stringify(summarizeData(data), null, 2));
    }
};

// Cria uma instância do Axios
const instance: AxiosInstance = axios.create();

// Interceptor de requisição
instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Não loga nada aqui!
    return config;
}, (error: AxiosError) => {
    // Não loga nada aqui!
    return Promise.reject(error);
});

// Interceptor de resposta
instance.interceptors.response.use(async (response: AxiosResponse) => {
    if (isDebug) console.log('<<<< DEBUG-INTERCEPTOR >>>>', response.config.url, response.config.params);

    // Loga request e response juntos
    logColor(colors.blue, `[Request] ${response.config.method?.toUpperCase()} ${response.config.url}`);
    if (response.config.headers) {
        logColor(colors.blue, 'Headers:', response.config.headers);
    }
    if (response.config.params) {
        logColor(colors.blue, 'Query Params:', response.config.params);
    }
    if (response.config.data) {
        logColor(colors.blue, 'Body:', response.config.data);
    }
    logColor(colors.green, `[Response] ${response.status} ${response.statusText}`);
    logColor(colors.green, 'Data:', response.data);
    if (response.data[0]?.IDERRO === 333) {
        // Chama convalidar para atualizar a chave
        try {
            await convalidar();
        } catch (e) {
            logColor(colors.red, '[Convalidar Error]', e);
        }
    } else if (response.data[0]?.IDERRO === 666 || response.data[0]?.IDERRO === 131 || response.data[0]?.IDERRO === 110 || response.data[0]?.IDERRO === 114) {
        const logout = getLogout();
        logout();
    }
    return response;
}, (error: AxiosError) => {
    if (error.response) {
        logColor(colors.blue, `[Request] ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
        if (error.config?.headers) {
            logColor(colors.blue, 'Headers:', error.config.headers);
        }
        if (error.config?.params) {
            logColor(colors.blue, 'Query Params:', error.config.params);
        }
        if (error.config?.data) {
            logColor(colors.blue, 'Body:', error.config.data);
        }
        logColor(colors.red, `[Response Error] ${error.response.status} ${error.response.statusText}`);
        logColor(colors.red, 'Data:', error.response.data);
    } else {
        logColor(colors.red, `[Response Error] ${error.message}`);
    }
    return Promise.reject(error);
});

// Exporta a instância do Axios
export default instance;