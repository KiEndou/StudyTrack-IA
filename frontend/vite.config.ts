// Configuração do Vite usada para desenvolver e compilar o frontend React.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Ativa o suporte de transformação JSX e recursos do React.
  plugins: [react()],
  // Mantém a porta padrão esperada pelo backend e pelo ambiente local.
  server: { port: 5173 },
});
