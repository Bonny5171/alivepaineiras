import React, { createContext, useContext, useState, ReactNode } from "react";

type ErrorContextType = {
  error: string | null;
  subText?: string | null;
  type: "error" | "success" | null;
  setError: (
    message: string | null,
    type?: "error" | "success",
    duration?: number,
    subText?: string | null
  ) => void;
};

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [error, setErrorState] = useState<string | null>(null);
  const [subText, setSubText] = useState<string | null>(null);
  const [type, setType] = useState<"error" | "success" | null>(null);

  const setError = (
    message: string | null,
    type: "error" | "success" = "error",
    duration: number = 3000,
    subText: string | null = null
  ) => {
    setErrorState(message);
    setType(type);
    setSubText(subText);

    if (message) {
      setTimeout(() => {
        setErrorState(null);
        setType(null);
        setSubText(null);
      }, duration);
    }
  };

  return (
    <ErrorContext.Provider value={{ error, subText, type, setError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) throw new Error("useError deve ser usado dentro do ErrorProvider");
  return context;
};