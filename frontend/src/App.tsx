// Componente principal responsável pela estrutura de navegação do frontend.
import { Link, Route, Routes } from "react-router-dom";

// Importa as páginas que já fazem parte da primeira versão do sistema.
import { DashboardPage } from "./pages/DashboardPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// Define as rotas visíveis do StudyTrack IA.
function App() {
  return (
    <Routes>
      {/* A página inicial apresenta o resumo e o status da API. */}
      <Route path="/" element={<DashboardPage />} />
      {/* Qualquer endereço desconhecido exibe uma página de retorno. */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
// Reexporta Link para manter disponível o componente de navegação neste módulo.
export { Link };
