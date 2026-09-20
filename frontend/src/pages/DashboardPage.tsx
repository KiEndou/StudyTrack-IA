// Página inicial que apresenta o estado atual da integração com o backend.
import { useEffect, useState } from "react";

// Centraliza a chamada usada para verificar se a API está disponível.
import { checkApiHealth } from "../services/api";

// Estados possíveis exibidos enquanto a conexão com o backend é verificada.
type HealthStatus = "checking" | "online" | "offline";

// Componente responsável pelo dashboard inicial do estudante.
export function DashboardPage() {
  // Guarda o resultado da verificação para atualizar o indicador visual da API.
  const [status, setStatus] = useState<HealthStatus>("checking");

  // Executa a verificação uma vez quando a página é carregada.
  useEffect(() => {
    // Marca a API como online quando a resposta é bem-sucedida.
    checkApiHealth()
      .then(() => setStatus("online"))
      // Exibe o estado offline quando a chamada falha ou a API está indisponível.
      .catch(() => setStatus("offline"));
  }, []);

  // Renderiza a apresentação inicial e os indicadores preparados para crescer.
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">STUDYTRACK IA</p>
        <h1>Seu ritmo de estudo, com clareza.</h1>
        <p className="subtitle">
          A base do seu tutor inteligente esta pronta para crescer com voce.
        </p>
        <div className="status-line">
          {/* A classe do ponto muda conforme o estado retornado pela API. */}
          <span className={`status-dot ${status}`} />
          API {status === "checking" ? "verificando" : status === "online" ? "online" : "offline"}
        </div>
      </section>
      <section className="workspace-grid" aria-label="Resumo do estudo">
        {/* Estes cartões representam áreas que receberão dados reais futuramente. */}
        <article className="metric-card"><span>Proximo passo</span><strong>Definir seu primeiro plano</strong></article>
        <article className="metric-card"><span>Banco conectado</span><strong>Supabase pronto</strong></article>
        <article className="metric-card"><span>Autenticacao</span><strong>Supabase Auth</strong></article>
      </section>
    </main>
  );
}
