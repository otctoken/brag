// AppContext.tsx
import React from "react";

export interface AppContextType {
  // 定义 Context 中需要共享的值的类型
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
  anotherNumber: number;
  setAnotherNumber: React.Dispatch<React.SetStateAction<number>>;
}

export const AppContext = React.createContext<AppContextType | undefined>(
  undefined,
);

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};

interface AppContextProviderProps {
  children: React.ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({
  children,
}) => {
  const [count, setCount] = React.useState(2);
  const [anotherNumber, setAnotherNumber] = React.useState(998888);

  return (
    <AppContext.Provider
      value={{ count, setCount, anotherNumber, setAnotherNumber }}
    >
      {children}
    </AppContext.Provider>
  );
};
