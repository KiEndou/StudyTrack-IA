import { useCallback, useEffect, useMemo, useState } from "react";
import { AppLayout, Icon } from "../components/AppLayout";
import { supabase } from "../services/supabase";
import { activityFromDatabase, subjectFromDatabase, type ActivityRecord } from "../services/academicData";

type Subject = { id: string; name: string };
const numberFormat = (value: number) => value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

export function PerformancePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const loadData = useCallback(async () => {
    setLoading(true); setLoadError("");
    if (!supabase) { setLoadError("O Supabase não está configurado."); setLoading(false); return; }
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) { setLoadError("Entre na sua conta para visualizar seu desempenho."); setLoading(false); return; }
    const [subjectsResult, activitiesResult] = await Promise.all([
      supabase.from("disciplinas").select("id, nome").order("nome", { ascending: true }),
      supabase.from("atividades").select("*").order("data_entrega", { ascending: true, nullsFirst: false }),
    ]);
    if (subjectsResult.error) setLoadError(`Não foi possível carregar as disciplinas: ${subjectsResult.error.message}`);
    if (activitiesResult.error) setLoadError((current) => `${current ? `${current} ` : ""}Não foi possível carregar as atividades: ${activitiesResult.error.message}`);
    setSubjects((subjectsResult.data ?? []).map((row) => subjectFromDatabase(row as { id: string; nome: string })));
    setActivities((activitiesResult.data ?? []).map((row) => activityFromDatabase(row as Record<string, any>)));
    setLoading(false);
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const activeActivities = activities.filter((item) => item.status !== "cancelled");
  const completed = activeActivities.filter((item) => item.status === "completed").length;
  const inProgress = activeActivities.filter((item) => item.status === "in_progress").length;
  const completion = activeActivities.length ? Math.round((completed / activeActivities.length) * 100) : 0;
  const subjectStats = useMemo(() => subjects.map((subject) => {
    const items = activeActivities.filter((activity) => activity.subject_id === subject.id);
    const done = items.filter((item) => item.status === "completed").length;
    return { ...subject, total: items.length, done, percent: items.length ? Math.round((done / items.length) * 100) : 0 };
  }).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name)), [subjects, activeActivities]);
  const filteredActivities = activities.filter((item) => selectedSubject === "all" || item.subject_id === selectedSubject);
  const subjectNames = new Map(subjects.map((subject) => [subject.id, subject.name]));

  return (
    <AppLayout>
      <div className="performance-page">
        <section className="performance-intro">
          <div><p className="eyebrow">ACOMPANHE SUA EVOLUÇÃO</p><h1>Desempenho</h1><p className="performance-description">Acompanhe seu ritmo de conclusão e veja como suas atividades estão distribuídas por disciplina.</p></div>
          <button type="button" className="secondary-button" onClick={() => void loadData()}><Icon name="refresh" size={15} /> Atualizar dados</button>
        </section>

        <section className="performance-summary" aria-label="Resumo do desempenho">
          <article className="performance-summary-card performance-average-card"><div className="performance-summary-top"><span>Atividades concluídas</span><span className="performance-icon sage"><Icon name="check-circle" size={18} /></span></div><strong>{loading ? "…" : `${completion}%`}</strong><p>{completed} de {activeActivities.length} atividades ativas</p></article>
          <article className="performance-summary-card"><div className="performance-summary-top"><span>Atividades cadastradas</span><span className="performance-icon blue"><Icon name="clipboard" size={18} /></span></div><strong>{loading ? "…" : activeActivities.length}</strong><p>Sem contar atividades canceladas</p></article>
          <article className="performance-summary-card"><div className="performance-summary-top"><span>Em andamento</span><span className="performance-icon sand"><Icon name="activity" size={18} /></span></div><strong>{loading ? "…" : inProgress}</strong><p>Atividades que você já começou</p></article>
          <article className="performance-summary-card"><div className="performance-summary-top"><span>Disciplinas</span><span className="performance-icon rose"><Icon name="book" size={18} /></span></div><strong>{loading ? "…" : subjects.length}</strong><p>Matérias cadastradas</p></article>
        </section>

        {loadError && <div className="performance-inline-error"><Icon name="info" size={17} />{loadError}<button className="secondary-button" type="button" onClick={() => void loadData()}>Tentar novamente</button></div>}

        <section className="performance-main-grid">
          <article className="performance-panel performance-subject-panel">
            <div className="performance-panel-heading"><div><h2>Progresso por disciplina</h2><p>Percentual de atividades concluídas em cada matéria.</p></div><span className="performance-heading-icon"><Icon name="layers" size={17} /></span></div>
            {loading ? <div className="performance-empty"><span className="loading-spinner" /><strong>Carregando seu desempenho</strong></div> : subjectStats.length ? <div className="performance-subject-list">
              {subjectStats.map((subject) => <div className="performance-subject-row" key={subject.id}>
                <div className="performance-subject-info"><div><strong>{subject.name}</strong><span>{subject.done} de {subject.total} concluídas</span></div><strong>{subject.total ? `${subject.percent}%` : "—"}</strong></div>
                <div className="performance-progress-track"><div className="performance-progress-fill" style={{ width: `${subject.percent}%` }} /></div>
                <div className="performance-subject-foot"><span>{subject.total ? `${subject.total} atividades` : "Nenhuma atividade vinculada"}</span><span>{subject.total ? `${subject.total - subject.done} restantes` : "Adicione atividades"}</span></div>
              </div>)}
            </div> : <div className="performance-empty"><div className="performance-empty-icon"><Icon name="book" size={22} /></div><strong>Nenhuma disciplina cadastrada</strong><p>Cadastre suas matérias e atividades para acompanhar seu progresso.</p></div>}
          </article>

          <article className="performance-panel performance-insight-panel">
            <div className="performance-panel-heading"><div><h2>Visão geral</h2><p>Seu panorama de organização até aqui.</p></div><span className="performance-heading-icon"><Icon name="activity" size={17} /></span></div>
            {loading ? <div className="performance-empty"><span className="loading-spinner" /></div> : <>
              <div className="performance-big-number"><strong>{completion}%</strong><span>concluído</span></div>
              <div className="performance-scale"><div className="performance-scale-track"><span style={{ width: `${completion}%` }} /></div><div><span>0%</span><span>100%</span></div></div>
              <div className="performance-insight-note"><span className="performance-insight-dot" />{activeActivities.length === 0 ? "Cadastre suas primeiras atividades para começar a acompanhar seu progresso." : completion === 100 ? "Todas as suas atividades ativas foram concluídas. Excelente trabalho!" : "Continue avançando uma atividade de cada vez. Seu progresso será atualizado automaticamente."}</div>
            </>}
          </article>
        </section>

        <section className="performance-panel performance-history-panel">
          <div className="performance-history-heading"><div><h2>Suas atividades</h2><p>Acompanhe o status das atividades cadastradas.</p></div><label className="performance-filter"><Icon name="filter" size={15} /><select value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)} aria-label="Filtrar atividades por disciplina"><option value="all">Todas as disciplinas</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label></div>
          {loading ? <div className="performance-empty"><span className="loading-spinner" /><strong>Carregando atividades</strong></div> : filteredActivities.length ? <div className="performance-table-wrap"><table className="performance-table"><thead><tr><th>Atividade</th><th>Disciplina</th><th>Prazo</th><th>Status</th></tr></thead><tbody>{filteredActivities.map((item) => <tr key={item.id}><td><strong>{item.title}</strong></td><td>{item.subject_id ? subjectNames.get(item.subject_id) ?? "Disciplina não encontrada" : "Sem disciplina"}</td><td>{item.due_date ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${item.due_date.slice(0, 10)}T12:00:00`)) : "Sem prazo"}</td><td><span className="performance-score-pill">{{ pending: "Pendente", in_progress: "Em andamento", completed: "Concluída", cancelled: "Cancelada" }[item.status]}</span></td></tr>)}</tbody></table></div> : <div className="performance-empty history-empty"><div className="performance-empty-icon"><Icon name="clipboard" size={22} /></div><strong>Você ainda não tem atividades</strong><p>As atividades cadastradas aparecerão aqui com seus respectivos status.</p></div>}
        </section>
        <p className="performance-footnote"><Icon name="info" size={14} />A tabela atual do projeto ainda não possui campos de notas. Esta página acompanha o progresso pelas atividades; o registro de notas pode ser integrado quando a tabela de avaliações for criada.</p>
      </div>
    </AppLayout>
  );
}
