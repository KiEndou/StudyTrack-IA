import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AppLayout, Icon } from "../components/AppLayout";
import { supabase } from "../services/supabase";

type Subject = {
  id: string;
  name: string;
  professor?: string | null;
};

type SubjectForm = {
  name: string;
  professor: string;
};

const emptyForm: SubjectForm = { name: "", professor: "" };
const accents = ["sage", "sand", "blue", "lilac", "rose"];

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

function getSubjectAccent(name: string) {
  const total = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return accents[total % accents.length];
}

export function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [form, setForm] = useState<SubjectForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSubjects = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    if (!supabase) {
      setSubjects([]);
      setLoadError("Configure as variáveis do Supabase no arquivo .env.local para carregar e salvar suas disciplinas.");
      setLoading(false);
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      setSubjects([]);
      setLoadError("Entre na sua conta para visualizar suas disciplinas.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("disciplinas")
      .select("id, nome, professor, cor")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao carregar disciplinas:", error);
      setSubjects([]);
      setLoadError("Não foi possível carregar as disciplinas. Confira a tabela 'disciplinas' e as políticas de acesso do Supabase.");
    } else {
      setSubjects((data ?? []).map((row) => ({
        id: row.id,
        name: row.nome,
        professor: row.professor,
      })) as Subject[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void loadSubjects(); }, [loadSubjects]);

  const filteredSubjects = useMemo(() => subjects.filter((subject) => {
    const matchesSearch = `${subject.name} ${subject.professor ?? ""}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"));
    return matchesSearch;
  }), [subjects, search]);

  function openCreateModal() {
    setEditingSubject(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(subject: Subject) {
    setEditingSubject(subject);
    setForm({
      name: subject.name ?? "",
      professor: subject.professor ?? "",
    });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const name = form.name.trim();
    if (!name) {
      setFormError("Informe o nome da disciplina.");
      return;
    }
    if (!supabase) {
      setFormError("O Supabase não está configurado neste ambiente.");
      return;
    }

    setSaving(true);
    // A tabela public.disciplinas usa os nomes de coluna em português.
    const payload = {
      nome: name,
      professor: form.professor.trim() || null,
      cor: getSubjectAccent(name),
    };

    let result;
    if (editingSubject) {
      result = await supabase.from("disciplinas").update(payload).eq("id", editingSubject.id).select().single();
    } else {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setFormError("Sua sessão expirou. Entre novamente para cadastrar uma disciplina.");
        setSaving(false);
        return;
      }
      result = await supabase.from("disciplinas").insert({ ...payload, usuario_id: authData.user.id }).select().single();
    }

    if (result.error) {
      console.error("Erro ao salvar disciplina:", result.error);
      setFormError(`Não foi possível salvar a disciplina: ${result.error.message}`);
      setSaving(false);
      return;
    }

    setModalOpen(false);
    setSaving(false);
    setNotice(editingSubject ? "Disciplina atualizada." : "Disciplina adicionada.");
    window.setTimeout(() => setNotice(""), 3200);
    await loadSubjects();
  }

  async function handleDelete(subject: Subject) {
    if (!supabase) return;
    const confirmed = window.confirm(`Deseja realmente excluir a disciplina “${subject.name}”?`);
    if (!confirmed) return;
    setDeletingId(subject.id);
    const { error } = await supabase.from("disciplinas").delete().eq("id", subject.id);
    if (error) {
      setNotice("Não foi possível excluir esta disciplina.");
    } else {
      setNotice("Disciplina excluída.");
      await loadSubjects();
    }
    window.setTimeout(() => setNotice(""), 3200);
    setDeletingId(null);
  }

  return (
    <AppLayout>
      <div className="subjects-page">
        <section className="subjects-intro">
          <div>
            <p className="eyebrow">ORGANIZE SUA VIDA ACADÊMICA</p>
            <h1>Disciplinas</h1>
            <p className="subjects-description">Todas as suas matérias em um só lugar. Acompanhe e organize cada etapa do semestre.</p>
          </div>
          <button className="primary-button" type="button" onClick={openCreateModal}>
            <Icon name="plus" size={17} />
            Adicionar disciplina
          </button>
        </section>

        <section className="subjects-overview" aria-label="Resumo das disciplinas">
          <div className="overview-icon"><Icon name="layers" size={20} /></div>
          <div className="overview-copy"><span>Suas disciplinas</span><strong>{subjects.length.toString().padStart(2, "0")}</strong></div>
          <div className="overview-divider" />
          <div className="overview-note"><span className="overview-note-dot" /> {subjects.length === 0 ? "Seu semestre começa por aqui" : `${subjects.length === 1 ? "1 matéria cadastrada" : `${subjects.length} matérias cadastradas`}`}</div>
        </section>

        <section className="subjects-toolbar" aria-label="Buscar e filtrar disciplinas">
          <label className="subject-search">
            <Icon name="search" size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar disciplina ou professor..." aria-label="Buscar disciplina ou professor" />
            {search && <button type="button" className="clear-search" onClick={() => setSearch("")} aria-label="Limpar busca"><Icon name="close" size={15} /></button>}
          </label>
        </section>

        <div className="subjects-list-heading">
          <div><h2>Minhas matérias</h2><p>{loading ? "Carregando suas disciplinas..." : `${filteredSubjects.length} ${filteredSubjects.length === 1 ? "disciplina encontrada" : "disciplinas encontradas"}`}</p></div>
          <span className="list-view-label"> <Icon name="layers" size={15} /> Visão em cartões</span>
        </div>

        {loading ? (
          <div className="subjects-state"><div className="loading-spinner" /><strong>Organizando suas disciplinas</strong><p>Isso leva só um instante.</p></div>
        ) : loadError ? (
          <div className="subjects-state error-state">
            <div className="state-icon"><Icon name="book" size={24} /></div>
            <strong>Não conseguimos acessar suas disciplinas</strong>
            <p>{loadError}</p>
            <button className="secondary-button" type="button" onClick={() => void loadSubjects()}><Icon name="refresh" size={15} /> Tentar novamente</button>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="subjects-state">
            <div className="state-icon"><Icon name={search ? "search" : "book"} size={24} /></div>
            <strong>{subjects.length === 0 ? "Nenhuma disciplina cadastrada ainda" : "Nenhuma disciplina encontrada"}</strong>
            <p>{subjects.length === 0 ? "Adicione suas matérias para manter professores, períodos e informações importantes organizados." : "Tente mudar sua busca ou selecionar outro período."}</p>
            {subjects.length === 0 ? <button className="primary-button" type="button" onClick={openCreateModal}><Icon name="plus" size={16} /> Adicionar primeira disciplina</button> : <button className="secondary-button" type="button" onClick={() => setSearch("")}>Limpar busca</button>}
          </div>
        ) : (
          <div className="subjects-grid">
            {filteredSubjects.map((subject) => (
              <article className="subject-card" key={subject.id}>
                <div className={`subject-card-accent ${getSubjectAccent(subject.name)}`} />
                <div className="subject-card-top">
                  <div className={`subject-monogram ${getSubjectAccent(subject.name)}`}>{getInitials(subject.name)}</div>
                  <div className="subject-actions">
                    <button type="button" className="icon-button" onClick={() => openEditModal(subject)} aria-label={`Editar ${subject.name}`} title="Editar disciplina"><Icon name="edit" size={16} /></button>
                    <button type="button" className="icon-button danger-icon" onClick={() => void handleDelete(subject)} disabled={deletingId === subject.id} aria-label={`Excluir ${subject.name}`} title="Excluir disciplina"><Icon name="trash" size={16} /></button>
                  </div>
                </div>
                <h3>{subject.name}</h3>
                <p className="subject-professor"><Icon name="user" size={15} /> {subject.professor || "Professor não informado"}</p>
              </article>
            ))}
          </div>
        )}

        <footer className="subjects-footer"><span>STUDYTRACK</span><span>Uma matéria de cada vez. Um passo de cada vez.</span></footer>
      </div>

      {notice && <div className="toast-message" role="status">{notice}</div>}

      {modalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <section className="subject-modal" role="dialog" aria-modal="true" aria-labelledby="subject-modal-title">
            <div className="modal-heading">
              <div><p className="eyebrow">SUA ORGANIZAÇÃO</p><h2 id="subject-modal-title">{editingSubject ? "Editar disciplina" : "Nova disciplina"}</h2><p>Preencha as informações que você já tiver. O restante pode ficar para depois.</p></div>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)} aria-label="Fechar"><Icon name="close" size={19} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <label className="form-field full-field"><span>Nome da disciplina <b>*</b></span><input autoFocus required maxLength={90} placeholder="Ex.: Programação para Web" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
              <label className="form-field"><span>Professor</span><input maxLength={90} placeholder="Nome do professor" value={form.professor} onChange={(event) => setForm({ ...form, professor: event.target.value })} /></label>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}>{saving ? "Salvando..." : editingSubject ? "Salvar alterações" : "Adicionar disciplina"}</button></div>
            </form>
          </section>
        </div>
      )}
    </AppLayout>
  );
}
