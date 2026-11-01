// Ponto de entrada que monta a aplicação React no elemento root do HTML.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Carrega o componente principal e os estilos globais da aplicação.
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import "./styles.css";

// StrictMode ajuda a identificar problemas comuns durante o desenvolvimento.
// BrowserRouter habilita a navegação entre as páginas sem recarregar o documento.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
