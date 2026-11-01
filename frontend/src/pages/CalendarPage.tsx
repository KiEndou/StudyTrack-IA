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

type CalendarFilter = "all" | ActivityType;
const emptyForm: ActivityForm = { title: "", subject_id: "", activity_type: "assignment", due_date: "", weight: "", status: "pending", description: "" };
const typeLabels: Record<ActivityType, string> = { assignment: "Trabalho", exam: "Prova", task: "Tarefa" };
const statusLabels: Record<ActivityStatus, string> = { pending: "Pendente", in_progress: "Em andamento", completed: "Concluída", cancelled: "Cancelada" };
const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function parseDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}
function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
}
function longDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(parseDate(value));
}
function shortDate(value?: string | null) {
  if (!value) return "Sem prazo";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(parseDate(value)).replace(" de ", " ");
}
function localToday() { return dateKey(new Date()); }

export function CalendarPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1, 12); });
  const [selectedDate, setSelectedDate] = useState(localToday);
  const [filter, setFilter] = useState<CalendarFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [form, setForm] = useState<ActivityForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true); setLoadError("");
    if (!supabase) {
      setActivities([]); setSubjects([]);
      setLoadError("Configure as variáveis do Supabase no arquivo .env para carregar o calendário.");
      setLoading(false); return;
    }
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      setActivities([]); setSubjects([]);
      setLoadError("Entre na sua conta para visualizar seu calendário acadêmico.");
      setLoading(false); return;
    }
    const [activityResult, subjectResult] = await Promise.all([
      supabase.from("atividades").select("*").not("data_entrega", "is", null).order("data_entrega", { ascending: true }),
      supabase.from("disciplinas").select("id, nome").order("nome", { ascending: true }),
    ]);
    if (activityResult.error) {
      setActivities([]);
      setLoadError(`Não foi possível carregar os compromissos: ${activityResult.error.message}`);
    } else setActivities((activityResult.data ?? []).map((row) => activityFromDatabase(row as Record<string, any>)));
    if (subjectResult.error) {
      setSubjects([]);
      setLoadError((current) => `${current ? `${current} ` : ""}Não foi possível carregar as disciplinas: ${subjectResult.error.message}`);
    } else setSubjects((subjectResult.data ?? []).map((row) => subjectFromDatabase(row as { id: string; nome: string })));
    setLoading(false);
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const subjectNames = useMemo(() => new Map(subjects.map((subject) => [subject.id, subject.name])), [subjects]);
  const filteredActivities = useMemo(() => activities.filter((item) => filter === "all" || item.activity_type === filter), [activities, filter]);
  const activitiesByDate = useMemo(() => {
    const map = new Map<string, Activity[]>();
    filteredActivities.forEach((item) => {
      if (!item.due_date) return;
      const key = item.due_date.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), item]);
    });
    return map;
  }, [filteredActivities]);

  const calendarDays = useMemo(() => {
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1, 12);
    const mondayOffset = (first.getDay() + 6) % 7;
    const start = new Date(first); start.setDate(first.getDate() - mondayOffset);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start); date.setDate(start.getDate() + index);
      return { date, key: dateKey(date), inMonth: date.getMonth() === visibleMonth.getMonth() };
    });
  }, [visibleMonth]);

  const selectedActivities = activitiesByDate.get(selectedDate) ?? [];
  const upcoming = useMemo(() => filteredActivities
    .filter((item) => item.due_date && item.due_date.slice(0, 10) >= localToday() && item.status !== "completed" && item.status !== "cancelled")
    .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""))
    .slice(0, 5), [filteredActivities]);
  const monthActivityCount = useMemo(() => calendarDays
    .filter((day) => day.inMonth)
    .reduce((sum, day) => sum + (activitiesByDate.get(day.key)?.length ?? 0), 0), [calendarDays, activitiesByDate]);

  function changeMonth(amount: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1, 12));
  }
  function goToday() {
    const today = new Date();
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1, 12));
    setSelectedDate(localToday());
  }
  function openCreate(date = selectedDate) {
    setEditing(null); setForm({ ...emptyForm, due_date: date }); setFormError(""); setModalOpen(true);
  }
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
    if (!form.title.trim()) { setFormError("Informe o título do compromisso."); return; }
    if (!form.due_date) { setFormError("Escolha uma data para exibir o compromisso no calendário."); return; }
    if (!supabase) { setFormError("O Supabase não está configurado neste ambiente."); return; }
    setSaving(true);
    const payload = {
      ...activityToDatabase({
        title: form.title.trim(), subject_id: form.subject_id || null, activity_type: form.activity_type,
        due_date: form.due_date, weight: form.weight ? Number(form.weight) : null,
        status: form.status, description: form.description.trim() || null,
      }),
    };
    let result;
    if (editing) result = await supabase.from("atividades").update(payload).eq("id", editing.id).select().single();
    else {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) { setFormError("Sua sessão expirou. Entre novamente para cadastrar um compromisso."); setSaving(false); return; }
      result = await supabase.from("atividades").insert({ ...payload, usuario_id: authData.user.id }).select().single();
    }
    if (result.error) { setFormError(`Não foi possível salvar: ${result.error.message}`); setSaving(false); return; }
    setSelectedDate(form.due_date); setVisibleMonth(parseDate(form.due_date)); setModalOpen(false); setSaving(false);
    setNotice(editing ? "Compromisso atualizado." : "Compromisso adicionado.");
    window.setTimeout(() => setNotice(""), 3000);
    await loadData();
  }
  async function changeStatus(item: Activity, status: ActivityStatus) {
    if (!supabase || status === item.status) return;
    const { error } = await supabase.from("atividades").update({ status: statusToDatabase(status) }).eq("id", item.id);
    if (error) setNotice("Não foi possível atualizar o status.");
    else { setActivities((current) => current.map((activity) => activity.id === item.id ? { ...activity, status } : activity)); setNotice("Status atualizado."); }
    window.setTimeout(() => setNotice(""), 2800);
  }

  return (
    <AppLayout>
      <div className="calendar-page">
        <section className="activities-intro calendar-intro">
          <div>
            <p className="eyebrow">SUA ROTINA EM UM SÓ LUGAR</p>
            <h1>Calendário</h1>
            <p className="activities-description">Visualize seus prazos, organize os compromissos e tenha uma ideia clara do que vem pela frente.</p>
          </div>
          <button className="primary-button" type="button" onClick={() => openCreate()}><Icon name="plus" size={17} /> Novo compromisso</button>
        </section>

        <section className="calendar-summary">
          <div className="calendar-summary-icon"><Icon name="calendar" size={20} /></div>
          <div className="calendar-summary-copy"><span>Compromissos neste mês</span><strong>{monthActivityCount.toString().padStart(2, "0")}</strong></div>
          <span className="calendar-summary-note"><i /> Datas com atividades aparecem destacadas no calendário.</span>
        </section>

        <div className="calendar-toolbar">
          <div className="calendar-month-controls">
            <button type="button" className="calendar-arrow" onClick={() => changeMonth(-1)} aria-label="Mês anterior"><Icon name="chevron" size={17} /></button>
            <h2>{monthLabel(visibleMonth)}</h2>
            <button type="button" className="calendar-arrow next" onClick={() => changeMonth(1)} aria-label="Próximo mês"><Icon name="chevron" size={17} /></button>
            <button type="button" className="calendar-today-button" onClick={goToday}>Hoje</button>
          </div>
          <div className="calendar-filters" aria-label="Filtrar compromissos">
            {(["all", "exam", "assignment", "task"] as CalendarFilter[]).map((value) => (
              <button key={value} type="button" className={`calendar-filter-chip ${filter === value ? "active" : ""} ${value}`} onClick={() => setFilter(value)}>
                <i />{value === "all" ? "Todos" : typeLabels[value]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="subjects-state"><div className="loading-spinner" /><strong>Preparando seu calendário</strong><p>Isso leva só um instante.</p></div>
        ) : loadError ? (
          <div className="subjects-state error-state"><div className="state-icon"><Icon name="calendar" size={24} /></div><strong>Não conseguimos acessar seu calendário</strong><p>{loadError}</p><button className="secondary-button" type="button" onClick={() => void loadData()}><Icon name="refresh" size={15} /> Tentar novamente</button></div>
        ) : (
          <div className="calendar-layout">
            <section className="calendar-card" aria-label="Calendário mensal">
              <div className="calendar-weekdays">{weekDays.map((day) => <span key={day}>{day}</span>)}</div>
              <div className="calendar-grid">
                {calendarDays.map(({ date, key, inMonth }) => {
                  const dayActivities = activitiesByDate.get(key) ?? [];
                  const isToday = key === localToday();
                  return <button key={key} type="button" onClick={() => { setSelectedDate(key); if (!inMonth) setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1, 12)); }} className={`calendar-day ${inMonth ? "" : "outside"} ${selectedDate === key ? "selected" : ""} ${isToday ? "today" : ""}`} aria-pressed={selectedDate === key}>
                    <span className="calendar-day-number">{date.getDate()}</span>
                    <span className="calendar-day-dots" aria-label={`${dayActivities.length} compromissos`}>
                      {dayActivities.slice(0, 3).map((item) => <i key={item.id} className={`${item.activity_type} ${item.status === "completed" ? "done" : ""}`} />)}
                      {dayActivities.length > 3 && <small>+{dayActivities.length - 3}</small>}
                    </span>
                    <span className="calendar-day-preview">{dayActivities.slice(0, 2).map((item) => <em key={item.id} className={item.activity_type}>{item.title}</em>)}</span>
                  </button>;
                })}
              </div>
              <div className="calendar-legend">
                <span><i className="exam" /> Prova</span><span><i className="assignment" /> Trabalho</span><span><i className="task" /> Tarefa</span>
              </div>
            </section>

            <aside className="calendar-side-column">
              <section className="calendar-selected-card">
                <div className="calendar-side-heading"><div><p className="eyebrow">DIA SELECIONADO</p><h3>{longDate(selectedDate)}</h3></div><button type="button" className="calendar-add-small" onClick={() => openCreate(selectedDate)} aria-label="Adicionar compromisso neste dia"><Icon name="plus" size={17} /></button></div>
                {selectedActivities.length === 0 ? (
                  <div className="calendar-day-empty"><div><Icon name="sparkles" size={20} /></div><strong>Dia livre por aqui</strong><p>Não há compromissos para esta data. Aproveite o espaço para colocar os estudos em dia ou descansar.</p><button type="button" className="calendar-text-button" onClick={() => openCreate(selectedDate)}>Adicionar compromisso <Icon name="chevron" size={13} /></button></div>
                ) : (
                  <div className="calendar-event-list">
                    {selectedActivities.map((item) => <article className="calendar-event" key={item.id}>
                      <span className={`calendar-event-mark ${item.activity_type}`} />
                      <div className="calendar-event-content"><div className="calendar-event-title"><strong>{item.title}</strong><span className={`calendar-event-type ${item.activity_type}`}>{typeLabels[item.activity_type]}</span></div><p>{item.subject_id ? subjectNames.get(item.subject_id) ?? "Disciplina não encontrada" : "Sem disciplina vinculada"}</p><label className={`calendar-event-status status-${item.status}`}><span className="status-dot" /><select value={item.status} onChange={(event) => void changeStatus(item, event.target.value as ActivityStatus)} aria-label={`Status de ${item.title}`}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button type="button" className="calendar-edit-link" onClick={() => openEdit(item)}>Editar detalhes</button></div>
                    </article>)}
                  </div>
                )}
              </section>

              <section className="calendar-upcoming-card">
                <div className="calendar-upcoming-heading"><div><p className="eyebrow">PARA NÃO ESQUECER</p><h3>Próximos compromissos</h3></div><Icon name="clock" size={17} /></div>
                {upcoming.length === 0 ? <div className="calendar-upcoming-empty">Tudo em dia! Não há compromissos pendentes com data definida.</div> : <div className="calendar-upcoming-list">{upcoming.map((item) => <button type="button" className="calendar-upcoming-item" key={item.id} onClick={() => { const key = item.due_date!.slice(0, 10); setSelectedDate(key); setVisibleMonth(parseDate(key)); }}><span className={`calendar-upcoming-date ${item.activity_type}`}><strong>{parseDate(item.due_date!).getDate()}</strong><small>{new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(parseDate(item.due_date!)).replace(".", "")}</small></span><span className="calendar-upcoming-copy"><strong>{item.title}</strong><small>{item.subject_id ? subjectNames.get(item.subject_id) ?? "Disciplina" : typeLabels[item.activity_type]}</small></span><Icon name="chevron" size={15} /></button>)}</div>}
              </section>
            </aside>
          </div>
        )}
        <footer className="subjects-footer"><span>STUDYTRACK</span><span>Um calendário organizado deixa a mente mais leve.</span></footer>
      </div>

      {notice && <div className="toast-message" role="status">{notice}</div>}
      {modalOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
        <section className="subject-modal activity-modal" role="dialog" aria-modal="true" aria-labelledby="calendar-modal-title">
          <div className="modal-heading"><div><p className="eyebrow">SUA ORGANIZAÇÃO</p><h2 id="calendar-modal-title">{editing ? "Editar compromisso" : "Novo compromisso"}</h2><p>Adicione uma prova, trabalho ou tarefa à sua agenda.</p></div><button type="button" className="modal-close" onClick={() => setModalOpen(false)} aria-label="Fechar"><Icon name="close" size={19} /></button></div>
          <form onSubmit={handleSubmit}>
            <label className="form-field full-field"><span>Nome do compromisso <b>*</b></span><input autoFocus required maxLength={120} placeholder="Ex.: Prova de programação" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
            <label className="form-field"><span>Disciplina</span><select value={form.subject_id} onChange={(event) => setForm({ ...form, subject_id: event.target.value })}><option value="">Sem disciplina</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
            <label className="form-field"><span>Tipo</span><select value={form.activity_type} onChange={(event) => setForm({ ...form, activity_type: event.target.value as ActivityType })}><option value="assignment">Trabalho</option><option value="exam">Prova</option><option value="task">Tarefa</option></select></label>
            <label className="form-field"><span>Data <b>*</b></span><input type="date" required value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} /></label>
            <label className="form-field"><span>Peso / valor</span><input type="number" min="0" max="1000" step="0.1" placeholder="Ex.: 2,0" value={form.weight} onChange={(event) => setForm({ ...form, weight: event.target.value })} /></label>
            <label className="form-field"><span>Status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ActivityStatus })}><option value="pending">Pendente</option><option value="in_progress">Em andamento</option><option value="completed">Concluída</option><option value="cancelled">Cancelada</option></select></label>
            <label className="form-field full-field"><span>Descrição / observações</span><textarea rows={3} maxLength={1000} placeholder="Anotações ou detalhes importantes..." value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}>{saving ? "Salvando..." : editing ? "Salvar alterações" : "Adicionar compromisso"}</button></div>
          </form>
        </section>
      </div>}
    </AppLayout>
  );
}
