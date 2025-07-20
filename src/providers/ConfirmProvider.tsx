import { validar } from "@/api/app/auth";
import ConfirmActionComponent from "@/components/ConfirmOverlay";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useError } from "./ErrorProvider";

type ConfirmationContextType = {
    isVisible: boolean;
    isLoading: boolean;
    password: string;
    error: string | null;
    showConfirmation: (
        title: string,
        onConfirm: () => Promise<void>,
        options?: {
            beforePasswordComponents?: React.ReactNode[];
            abovePasswordComponent?: React.ReactNode;
            canConfirm?: boolean;
        }
    ) => void;
    hideConfirmation: () => void;
    setPassword: (password: string) => void;
    setError: (error: string | null) => void;
};

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const ConfirmationProvider = ({ children }: { children: ReactNode }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [onConfirmCallback, setOnConfirmCallback] = useState<() => Promise<void>>(() => Promise.resolve());
    const [beforePasswordComponents, setBeforePasswordComponents] = useState<React.ReactNode[]>([]);
    const [abovePasswordComponent, setAbovePasswordComponent] = useState<React.ReactNode | undefined>(undefined);
    const [canConfirm, setCanConfirm] = useState(true); // default true para manter compatibilidade
    const { setError: setGlobalError } = useError();

    const showConfirmation = (
        title: string,
        onConfirm: () => Promise<void>,
        options?: { beforePasswordComponents?: React.ReactNode[], abovePasswordComponent?: React.ReactNode, canConfirm?: boolean }
    ) => {
        setTitle(title);
        setOnConfirmCallback(() => onConfirm);
        setBeforePasswordComponents(options?.beforePasswordComponents || []);
        setAbovePasswordComponent(options?.abovePasswordComponent);
        setCanConfirm(options?.canConfirm !== undefined ? options.canConfirm : true);
        setIsVisible(true);
    };

    const hideConfirmation = () => {
        setIsVisible(false);
        setPassword("");
        setError(null);
    };

    const handleConfirm = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const resp = await validar({ SENHA: password });
            // Trata erro retornado pela API
            if (Array.isArray(resp?.data) && resp.data[0]?.ERRO) {
                const msg = resp.data[0]?.MSG_ERRO || "Erro ao validar senha.";
                setError(msg); // erro local no modal
                setGlobalError(msg, "error", 5000); // erro global/toast
                return; // Não segue para o callback nem fecha o modal
            }
            await onConfirmCallback();
            hideConfirmation();
        } catch (err) {
            setError("Ocorreu um erro ao confirmar a ação.");
            setGlobalError("Ocorreu um erro ao confirmar a ação.", "error", 5000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ConfirmationContext.Provider
            value={{
                isVisible,
                isLoading,
                password,
                error,
                showConfirmation,
                hideConfirmation,
                setPassword,
                setError,
            }}
        >
            {children}
            <ConfirmActionComponent
                title={title}
                onClose={hideConfirmation}
                onConfirm={handleConfirm}
                confirmButtonLabel="Confirmar"
                onCancel={hideConfirmation}
                cancelButtonLabel="Cancelar"
                visible={isVisible}
                onPasswordChange={setPassword}
                isLoading={isLoading}
                beforePasswordComponents={beforePasswordComponents}
                abovePasswordComponent={abovePasswordComponent}
                canConfirm={canConfirm}
                setCanConfirm={setCanConfirm}
            />
        </ConfirmationContext.Provider>
    );
};

export const useConfirmation = () => {
    const context = useContext(ConfirmationContext);
    if (!context) throw new Error("useConfirmation deve ser usado dentro do ConfirmationProvider");
    return context;
};