import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AppLayout, Icon } from "../components/AppLayout";
import { supabase } from "../services/supabase";
import { activityFromDatabase, activityToDatabase, statusToDatabase, subjectFromDatabase, type ActivityRecord, type UiActivityStatus, type UiActivityType } from "../services/academicData";

type ActivityStatus = UiActivityStatus;
type ActivityType = UiActivityType;
type Subject = { id: string; name: string };
type Activity = ActivityRecord;
type ActivityForm = {
  title: string;
  subject_id: string;
  activity_type: ActivityType;
  due_date: string;
  weight: string;
  status: ActivityStatus;
  description: string;
};

const emptyForm: ActivityForm = {
  title: "", subject_id: "", activity_type: "assignment", due_date: "", weight: "", status: "pending", description: "",
};
const statusLabels: Record<ActivityStatus, string> = {
  pending: "Pendente", in_progress: "Em andamento", completed: "Concluída", cancelled: "Cancelada",
};
const typeLabels: Record<ActivityType, string> = {
  assignment: "Trabalho", exam: "Prova", task: "Tarefa",
};

function formatDate(value?: string | null) {
  if (!value) return "Sem prazo definido";
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date).replace(" de ", " ");
}
function dateState(value?: string | null, status?: ActivityStatus) {
  if (!value || status === "completed" || status === "cancelled") return "normal";
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (due < today) return "late";
  const days = Math.ceil((due.getTime() - today.getTime()) / 86400000);
  return days <= 2 ? "soon" : "normal";
}

export function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [form, setForm] = useState<ActivityForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true); setLoadError("");
    if (!supabase) {
      setActivities([]); setSubjects([]);
      setLoadError("Configure as variáveis do Supabase no arquivo .env para carregar e salvar suas atividades.");
      setLoading(false); return;
    }
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      setActivities([]); setSubjects([]);
      setLoadError("Entre na sua conta para visualizar suas atividades.");
      setLoading(false); return;
    }
    const [activityResult, subjectResult] = await Promise.all([
      supabase.from("atividades").select("*").order("data_entrega", { ascending: true, nullsFirst: false }),
      supabase.from("disciplinas").select("id, nome").order("nome", { ascending: true }),
    ]);
    if (activityResult.error) {
      setActivities([]);
      setLoadError(`Não foi possível carregar as atividades: ${activityResult.error.message}`);
    } else {
      setActivities((activityResult.data ?? []).map((row) => activityFromDatabase(row as Record<string, any>)));
    }
    if (subjectResult.error) {
      setSubjects([]);
      setLoadError((current) => `${current ? `${current} ` : ""}Não foi possível carregar as disciplinas: ${subjectResult.error.message}`);
    } else setSubjects((subjectResult.data ?? []).map((row) => subjectFromDatabase(row as { id: string; nome: string })));
    setLoading(false);
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const subjectNames = useMemo(() => new Map(subjects.map((subject) => [subject.id, subject.name])), [subjects]);
  const counts = useMemo(() => ({
    total: activities.length,
    pending: activities.filter((item) => item.status === "pending").length,
    progress: activities.filter((item) => item.status === "in_progress").length,
    completed: activities.filter((item) => item.status === "completed").length,
  }), [activities]);
  const filtered = useMemo(() => activities.filter((item) => {
    const subjectName = item.subject_id ? subjectNames.get(item.subject_id) ?? "" : "";
    const matchesSearch = `${item.title} ${item.description ?? ""} ${subjectName}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"));
    return matchesSearch && (statusFilter === "all" || item.status === statusFilter) && (typeFilter === "all" || item.activity_type === typeFilter) && (subjectFilter === "all" || item.subject_id === subjectFilter);
  }), [activities, search, statusFilter, typeFilter, subjectFilter, subjectNames]);

  function openCreate() { setEditing(null); setForm(emptyForm); setFormError(""); setModalOpen(true); }
  function openEdit(item: Activity) {
    setEditing(item);
    setForm({
      title: item.title ?? "", subject_id: item.subject_id ?? "", activity_type: item.activity_type ?? "assignment",
      due_date: item.due_date?.slice(0, 10) ?? "", weight: item.weight?.toString() ?? "",
      status: item.status ?? "pending", description: item.description ?? "",
    });
    setFormError(""); setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setFormError("");
    if (!form.title.trim()) { setFormError("Informe o título da atividade."); return; }
    if (!supabase) { setFormError("O Supabase não está configurado neste ambiente."); return; }
    setSaving(true);
    const payload = {
      ...activityToDatabase({
        title: form.title.trim(), subject_id: form.subject_id || null,
        activity_type: form.activity_type, due_date: form.due_date || null,
        weight: form.weight ? Number(form.weight) : null, status: form.status,
        description: form.description.trim() || null,
      }),
    };
    let result;
    if (editing) {
      result = await supabase.from("atividades").update(payload).eq("id", editing.id).select().single();
    } else {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) { setFormError("Sua sessão expirou. Entre novamente para cadastrar uma atividade."); setSaving(false); return; }
      result = await supabase.from("atividades").insert({ ...payload, usuario_id: authData.user.id }).select().single();
    }
    if (result.error) {
      setFormError(`Não foi possível salvar: ${result.error.message}`);
      setSaving(false); return;
    }
    setModalOpen(false); setSaving(false);
    setNotice(editing ? "Atividade atualizada." : "Atividade adicionada.");
    window.setTimeout(() => setNotice(""), 3200);
    await loadData();
  }

  async function changeStatus(item: Activity, status: ActivityStatus) {
    if (!supabase || status === item.status) return;
    setUpdatingId(item.id);
    const { error } = await supabase.from("atividades").update({ status: statusToDatabase(status) }).eq("id", item.id);
    if (error) setNotice("Não foi possível atualizar o status.");
    else { setActivities((current) => current.map((activity) => activity.id === item.id ? { ...activity, status } : activity)); setNotice("Status atualizado."); }
    window.setTimeout(() => setNotice(""), 2800); setUpdatingId(null);
  }

  async function handleDelete(item: Activity) {
    if (!supabase || !window.confirm(`Deseja realmente excluir a atividade “${item.title}”?`)) return;
    setDeletingId(item.id);
    const { error } = await supabase.from("atividades").delete().eq("id", item.id);
    if (error) setNotice("Não foi possível excluir esta atividade.");
    else { setActivities((current) => current.filter((activity) => activity.id !== item.id)); setNotice("Atividade excluída."); }
    window.setTimeout(() => setNotice(""), 3000); setDeletingId(null);
  }

  return (
    <AppLayout>
      <div className="activities-page">
        <section className="activities-intro">
          <div>
            <p className="eyebrow">UM PASSO DE CADA VEZ</p>
            <h1>Atividades</h1>
            <p className="activities-description">Tudo o que você precisa fazer, organizado em um só lugar. Acompanhe seus prazos e avance no seu ritmo.</p>
          </div>
          <button className="primary-button" type="button" onClick={openCreate}><Icon name="plus" size={17} /> Nova atividade</button>
        </section>

        <section className="activity-stats" aria-label="Resumo das atividades">
          <article className="activity-stat"><div className="activity-stat-icon neutral"><Icon name="layers" size={18} /></div><div><span>Total de atividades</span><strong>{counts.total.toString().padStart(2, "0")}</strong></div></article>
          <article className="activity-stat"><div className="activity-stat-icon sand"><Icon name="clock" size={18} /></div><div><span>Pendentes</span><strong>{counts.pending.toString().padStart(2, "0")}</strong></div></article>
          <article className="activity-stat"><div className="activity-stat-icon blue"><Icon name="refresh" size={18} /></div><div><span>Em andamento</span><strong>{counts.progress.toString().padStart(2, "0")}</strong></div></article>
          <article className="activity-stat"><div className="activity-stat-icon sage"><Icon name="check-square" size={18} /></div><div><span>Concluídas</span><strong>{counts.completed.toString().padStart(2, "0")}</strong></div></article>
        </section>

        <section className="activity-toolbar" aria-label="Buscar e filtrar atividades">
          <label className="activity-search"><Icon name="search" size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar atividade ou disciplina..." aria-label="Buscar atividade ou disciplina" />{search && <button className="clear-search" type="button" onClick={() => setSearch("")} aria-label="Limpar busca"><Icon name="close" size={15} /></button>}</label>
          <label className="activity-filter"><Icon name="filter" size={16} /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filtrar por status"><option value="all">Todos os status</option><option value="pending">Pendentes</option><option value="in_progress">Em andamento</option><option value="completed">Concluídas</option></select></label>
          <label className="activity-filter"><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filtrar por tipo"><option value="all">Todos os tipos</option><option value="assignment">Trabalhos</option><option value="exam">Provas</option><option value="task">Tarefas</option></select></label>
          <label className="activity-filter subject-activity-filter"><select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)} aria-label="Filtrar por disciplina"><option value="all">Todas as disciplinas</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
        </section>

        <div className="activities-list-heading"><div><h2>Suas atividades</h2><p>{loading ? "Carregando atividades..." : `${filtered.length} ${filtered.length === 1 ? "atividade encontrada" : "atividades encontradas"}`}</p></div><span className="list-view-label"><Icon name="check-square" size={15} /> Lista organizada</span></div>

        {loading ? (
          <div className="subjects-state"><div className="loading-spinner" /><strong>Organizando suas atividades</strong><p>Isso leva só um instante.</p></div>
        ) : loadError ? (
          <div className="subjects-state error-state"><div className="state-icon"><Icon name="check-square" size={24} /></div><strong>Não conseguimos acessar suas atividades</strong><p>{loadError}</p><button className="secondary-button" type="button" onClick={() => void loadData()}><Icon name="refresh" size={15} /> Tentar novamente</button></div>
        ) : filtered.length === 0 ? (
          <div className="subjects-state"><div className="state-icon"><Icon name={search || statusFilter !== "all" || typeFilter !== "all" || subjectFilter !== "all" ? "search" : "check-square"} size={24} /></div><strong>{activities.length === 0 ? "Nenhuma atividade por aqui ainda" : "Nenhuma atividade encontrada"}</strong><p>{activities.length === 0 ? "Adicione provas, trabalhos e tarefas para acompanhar seus prazos sem deixar nada passar." : "Tente mudar sua busca ou ajustar os filtros selecionados."}</p>{activities.length === 0 ? <button className="primary-button" type="button" onClick={openCreate}><Icon name="plus" size={16} /> Adicionar primeira atividade</button> : <button className="secondary-button" type="button" onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); setSubjectFilter("all"); }}>Limpar filtros</button>}</div>
        ) : (
          <div className="activity-list">
            {filtered.map((item) => {
              const dueState = dateState(item.due_date, item.status);
              return <article className={`activity-row ${item.status === "completed" ? "is-completed" : ""}`} key={item.id}>
                <div className={`activity-type-mark ${item.activity_type}`}><Icon name={item.activity_type === "exam" ? "calendar" : item.activity_type === "task" ? "check-square" : "book"} size={18} /></div>
                <div className="activity-main"><div className="activity-title-line"><h3>{item.title}</h3><span className={`activity-type-tag ${item.activity_type}`}>{typeLabels[item.activity_type] ?? "Atividade"}</span></div><div className="activity-subline"><span>{item.subject_id ? subjectNames.get(item.subject_id) ?? "Disciplina não encontrada" : "Sem disciplina vinculada"}</span>{item.weight != null && <><i /> <span>Peso {Number(item.weight).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</span></>}</div>{item.description && <p className="activity-description-preview">{item.description}</p>}</div>
                <div className={`activity-due ${dueState}`}><Icon name="clock" size={14} /><div><small>Prazo</small><strong>{formatDate(item.due_date)}</strong>{dueState === "late" && <em>Atrasada</em>}{dueState === "soon" && <em>Próxima</em>}</div></div>
                <label className={`activity-status status-${item.status}`}><span className="status-dot" /><select value={item.status} disabled={updatingId === item.id} onChange={(event) => void changeStatus(item, event.target.value as ActivityStatus)} aria-label={`Status de ${item.title}`}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <div className="activity-actions"><button type="button" className="icon-button" onClick={() => openEdit(item)} title="Editar atividade" aria-label={`Editar ${item.title}`}><Icon name="edit" size={16} /></button><button type="button" className="icon-button danger-icon" onClick={() => void handleDelete(item)} disabled={deletingId === item.id} title="Excluir atividade" aria-label={`Excluir ${item.title}`}><Icon name="trash" size={16} /></button></div>
              </article>;
            })}
          </div>
        )}
        <footer className="subjects-footer"><span>STUDYTRACK</span><span>Organização também é uma forma de progresso.</span></footer>
      </div>

      {notice && <div className="toast-message" role="status">{notice}</div>}
      {modalOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
        <section className="subject-modal activity-modal" role="dialog" aria-modal="true" aria-labelledby="activity-modal-title">
          <div className="modal-heading"><div><p className="eyebrow">SUA ORGANIZAÇÃO</p><h2 id="activity-modal-title">{editing ? "Editar atividade" : "Nova atividade"}</h2><p>Registre o que precisa ser feito. Você pode atualizar o status quando quiser.</p></div><button type="button" className="modal-close" onClick={() => setModalOpen(false)} aria-label="Fechar"><Icon name="close" size={19} /></button></div>
          <form onSubmit={handleSubmit}>
            <label className="form-field full-field"><span>Nome da atividade <b>*</b></span><input autoFocus required maxLength={120} placeholder="Ex.: Entrega do projeto final" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
            <label className="form-field"><span>Disciplina</span><select value={form.subject_id} onChange={(event) => setForm({ ...form, subject_id: event.target.value })}><option value="">Sem disciplina</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
            <label className="form-field"><span>Tipo</span><select value={form.activity_type} onChange={(event) => setForm({ ...form, activity_type: event.target.value as ActivityType })}><option value="assignment">Trabalho</option><option value="exam">Prova</option><option value="task">Tarefa</option></select></label>
            <label className="form-field"><span>Prazo</span><input type="date" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} /></label>
            <label className="form-field"><span>Peso / valor</span><input type="number" min="0" max="1000" step="0.1" placeholder="Ex.: 2,0" value={form.weight} onChange={(event) => setForm({ ...form, weight: event.target.value })} /></label>
            <label className="form-field"><span>Status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ActivityStatus })}><option value="pending">Pendente</option><option value="in_progress">Em andamento</option><option value="completed">Concluída</option><option value="cancelled">Cancelada</option></select></label>
            <label className="form-field full-field"><span>Descrição / observações</span><textarea rows={3} maxLength={1000} placeholder="Anotações, orientações ou detalhes importantes..." value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}>{saving ? "Salvando..." : editing ? "Salvar alterações" : "Adicionar atividade"}</button></div>
          </form>
        </section>
      </div>}
    </AppLayout>
  );
}
