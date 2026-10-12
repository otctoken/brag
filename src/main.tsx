import "./wallet.css";
import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";
import { DAppKitProvider } from "@mysten/dapp-kit-react";
import { dAppKit } from "./dappKit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppContextProvider } from "./AppContext";
const queryClient = new QueryClient();


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <DAppKitProvider dAppKit={dAppKit}>
        <AppContextProvider>
          <App />
        </AppContextProvider>
      </DAppKitProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
