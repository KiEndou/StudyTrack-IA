import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout, Icon } from "../components/AppLayout";
import { supabase } from "../services/supabase";
import { activityFromDatabase, subjectFromDatabase, type ActivityRecord } from "../services/academicData";

type HealthStatus = "checking" | "online" | "offline";
type Subject = { id: string; name: string; professor?: string | null };

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}
function formatDate(value?: string | null) {
  if (!value) return "Sem prazo";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(`${value.slice(0, 10)}T12:00:00`)).replace(" de ", " ");
}

export function DashboardPage() {
  const [status, setStatus] = useState<HealthStatus>("checking");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("estudante");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    if (!supabase) { setStatus("offline"); setLoading(false); return; }
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) { setStatus("offline"); setLoading(false); return; }
    setDisplayName(authData.user.user_metadata?.nome || authData.user.email?.split("@")[0] || "estudante");
    const [subjectsResult, activitiesResult] = await Promise.all([
      supabase.from("disciplinas").select("id, nome, professor").order("nome", { ascending: true }),
      supabase.from("atividades").select("*").order("data_entrega", { ascending: true, nullsFirst: false }),
    ]);
    if (!subjectsResult.error && subjectsResult.data) setSubjects(subjectsResult.data.map((row) => ({ ...subjectFromDatabase(row as { id: string; nome: string }), professor: (row as { professor?: string | null }).professor })));
    if (!activitiesResult.error && activitiesResult.data) setActivities(activitiesResult.data.map((row) => activityFromDatabase(row as Record<string, any>)));
    setStatus(subjectsResult.error || activitiesResult.error ? "offline" : "online");
    setLoading(false);
  }, []);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const activeActivities = activities.filter((item) => item.status !== "cancelled");
  const pending = activeActivities.filter((item) => item.status === "pending" || item.status === "in_progress");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = pending.filter((item) => item.due_date && new Date(`${item.due_date.slice(0, 10)}T00:00:00`) >= today).slice(0, 4);
  const subjectNames = new Map(subjects.map((subject) => [subject.id, subject.name]));

  return (
    <AppLayout>
      <section className="welcome-section">
        <div>
          <p className="eyebrow">SEU PAINEL DE ESTUDOS</p>
          <h1>{getGreeting()}, {displayName} <span className="wave">👋</span></h1>
          <p className="welcome-description">Um passo de cada vez. Organize sua rotina e acompanhe sua jornada acadêmica.</p>
        </div>
        <div className={`connection-pill ${status}`}><span className="connection-dot" />{status === "checking" ? "Verificando conexão" : status === "online" ? "Dados sincronizados" : "Falha ao sincronizar"}</div>
      </section>

      <section className="summary-grid" aria-label="Resumo acadêmico">
        <article className="summary-card"><div className="summary-card-top"><span>Disciplinas</span><div className="summary-icon sage"><Icon name="book" size={19} /></div></div><div className="summary-value">{loading ? "…" : subjects.length}</div><p>Suas matérias cadastradas</p></article>
        <article className="summary-card"><div className="summary-card-top"><span>Atividades pendentes</span><div className="summary-icon sand"><Icon name="check-square" size={19} /></div></div><div className="summary-value">{loading ? "…" : pending.length}</div><p>Tarefas que precisam da sua atenção</p></article>
        <article className="summary-card"><div className="summary-card-top"><span>Próximos prazos</span><div className="summary-icon lavender"><Icon name="calendar" size={19} /></div></div><div className="summary-value">{loading ? "…" : upcoming.length}</div><p>Entregas futuras cadastradas</p></article>
        <article className="summary-card"><div className="summary-card-top"><span>Concluídas</span><div className="summary-icon blue"><Icon name="chart" size={19} /></div></div><div className="summary-value">{loading ? "…" : activeActivities.filter((item) => item.status === "completed").length}</div><p>Atividades finalizadas</p></article>
      </section>

      <section className="dashboard-columns">
        <article className="content-card upcoming-card">
          <div className="card-heading"><div><h2>Próximas atividades</h2><p>O que vem pela frente na sua rotina.</p></div><span className="heading-icon"><Icon name="calendar" size={18} /></span></div>
          {loading ? <div className="empty-state"><strong>Carregando suas atividades…</strong></div> : upcoming.length ? <div className="dashboard-upcoming-list">{upcoming.map((item) => <div className="dashboard-upcoming-item" key={item.id}><span className="dashboard-upcoming-date">{formatDate(item.due_date)}</span><div><strong>{item.title}</strong><small>{item.subject_id ? subjectNames.get(item.subject_id) ?? "Disciplina" : "Sem disciplina"}</small></div></div>)}<Link to="/atividades" className="dashboard-view-link">Ver todas as atividades <Icon name="arrow-up" size={14} /></Link></div> : <div className="empty-state"><div className="empty-illustration"><Icon name="check-square" size={25} /></div><strong>Sua agenda começa aqui</strong><p>Quando você adicionar atividades com prazo, elas aparecerão aqui.</p><Link to="/atividades" className="dashboard-view-link">Adicionar atividade</Link></div>}
        </article>

        <article className="content-card subjects-card">
          <div className="card-heading"><div><h2>Minhas disciplinas</h2><p>Um espaço para cada matéria.</p></div><span className="heading-icon"><Icon name="book" size={18} /></span></div>
          {loading ? <div className="empty-state"><strong>Carregando disciplinas…</strong></div> : subjects.length ? <div className="dashboard-subject-list">{subjects.slice(0, 5).map((subject) => <div className="dashboard-subject-item" key={subject.id}><span className="dashboard-subject-dot" /><div><strong>{subject.name}</strong><small>{subject.professor || "Professor não informado"}</small></div></div>)}<Link to="/disciplinas" className="dashboard-view-link">Ver disciplinas <Icon name="arrow-up" size={14} /></Link></div> : <div className="empty-state compact-empty"><div className="empty-illustration"><Icon name="book" size={25} /></div><strong>Nenhuma disciplina por enquanto</strong><p>Adicione suas matérias para manter tudo organizado.</p><Link to="/disciplinas" className="dashboard-view-link">Adicionar disciplina</Link></div>}
        </article>
      </section>

      <section className="content-card rhythm-card"><div className="card-heading"><div><h2>Seu ritmo de estudos</h2><p>Pequenos passos também fazem parte do progresso.</p></div><span className="rhythm-label"><span className="rhythm-label-dot" /> Visão geral</span></div><div className="week-empty"><p>{activeActivities.length ? `Você tem ${activeActivities.length} atividades ativas. ${activeActivities.filter((item) => item.status === "completed").length} já foram concluídas.` : "Cadastre suas primeiras atividades para acompanhar seu ritmo de estudos."}</p></div></section>
      <footer className="dashboard-footer"><span>StudyTrack</span><span>Feito para acompanhar sua jornada, no seu tempo.</span></footer>
    </AppLayout>
  );
}
