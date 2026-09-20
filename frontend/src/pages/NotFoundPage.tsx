// Página exibida quando o usuário acessa uma rota que ainda não existe.
import { Link } from "react-router-dom";

// Oferece uma navegação simples de volta ao dashboard.
export function NotFoundPage() {
  return (
    <main className="app-shell centered">
      <p className="eyebrow">404</p>
      <h1>Pagina nao encontrada.</h1>
      <Link to="/" className="back-link">Voltar ao inicio</Link>
    </main>
  );
}
