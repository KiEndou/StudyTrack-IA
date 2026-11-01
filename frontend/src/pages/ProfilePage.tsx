import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppLayout, Icon } from "../components/AppLayout";
import { supabase } from "../services/supabase";

type ProfileData = {
  fullName: string;
  email: string;
  course: string;
  institution: string;
  semester: string;
  bio: string;
};

const STORAGE_KEY = "studytrack.profile.v1";
const emptyProfile: ProfileData = {
  fullName: "",
  email: "",
  course: "",
  institution: "",
  semester: "",
  bio: "",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "ST";
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join("");
}

export function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [draft, setDraft] = useState<ProfileData>(emptyProfile);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      let extras: Partial<ProfileData> = {};
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) extras = JSON.parse(stored) as Partial<ProfileData>;
      } catch { /* Mantém os campos locais vazios se o armazenamento estiver inválido. */ }

      if (supabase) {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData.user;
        if (user) {
          const { data } = await supabase.from("usuarios").select("nome, curso").eq("id", user.id).maybeSingle();
          if (!active) return;
          setProfile({
            ...emptyProfile,
            ...extras,
            fullName: data?.nome || user.user_metadata?.nome || extras.fullName || "",
            email: user.email || "",
            course: data?.curso || user.user_metadata?.curso || extras.course || "",
          });
          setLoaded(true);
          return;
        }
      }
      if (active) { setProfile({ ...emptyProfile, ...extras }); setLoaded(true); }
    }
    void loadProfile();
    return () => { active = false; };
  }, []);

  const avatarInitials = useMemo(() => initials(profile.fullName), [profile.fullName]);

  function openEditor() {
    setDraft(profile);
    setEditing(true);
  }

  function updateDraft(field: keyof ProfileData, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextProfile = {
      ...draft,
      fullName: draft.fullName.trim(), email: draft.email.trim(), course: draft.course.trim(),
      institution: draft.institution.trim(), semester: draft.semester.trim(), bio: draft.bio.trim(),
    };
    if (!supabase) { setNotice("Supabase não está configurado."); return; }
    setSaving(true);
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) { setNotice("Sua sessão expirou. Entre novamente."); setSaving(false); return; }
    const { error } = await supabase.from("usuarios").update({ nome: nextProfile.fullName || null, curso: nextProfile.course || null }).eq("id", authData.user.id);
    if (error) {
      setNotice(`Não foi possível salvar o perfil: ${error.message}`);
      setSaving(false);
      return;
    }
    await supabase.auth.updateUser({ data: { nome: nextProfile.fullName, curso: nextProfile.course } });
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ institution: nextProfile.institution, semester: nextProfile.semester, bio: nextProfile.bio }));
    } catch { /* Os campos adicionais continuam na tela nesta sessão. */ }
    setProfile(nextProfile);
    setNotice("Nome e curso sincronizados com sua conta. Os demais campos ficam salvos neste dispositivo.");
    setSaving(false); setEditing(false);
    window.setTimeout(() => setNotice(""), 4500);
  }

  const displayName = profile.fullName || "Estudante";

  return (
    <AppLayout>
      <div className="profile-page">
        <section className="profile-intro">
          <div>
            <p className="eyebrow">SUA CONTA</p>
            <h1>Meu perfil</h1>
            <p className="profile-description">Suas informações em um só lugar. Mantenha seus dados acadêmicos organizados.</p>
          </div>
          <button className="primary-button" type="button" onClick={openEditor}>
            <Icon name="edit" size={16} />
            Editar perfil
          </button>
        </section>

        {notice && <div className="profile-notice" role="status"><Icon name="check-circle" size={16} />{notice}</div>}

        <section className="profile-hero-card">
          <div className="profile-avatar-large">{avatarInitials}</div>
          <div className="profile-hero-copy">
            <span className="profile-status"><i /> Perfil do estudante</span>
            <h2>{displayName}</h2>
            <p>{profile.course || "Curso ainda não informado"}{profile.semester ? ` · ${profile.semester}` : ""}</p>
          </div>
          <div className="profile-hero-side">
            <span className="profile-member-label">STUDYTRACK IA</span>
            <span className="profile-member-note">Seu espaço de estudos</span>
          </div>
        </section>

        <div className="profile-content-grid">
          <section className="profile-panel profile-personal-panel">
            <div className="profile-panel-heading">
              <div className="profile-panel-icon"><Icon name="user" size={18} /></div>
              <div><h2>Informações pessoais</h2><p>Como você aparece no StudyTrack.</p></div>
            </div>
            <div className="profile-details-list">
              <div className="profile-detail-row"><span>Nome completo</span><strong>{profile.fullName || "Não informado"}</strong></div>
              <div className="profile-detail-row"><span>E-mail</span><strong>{profile.email || "Aguardando conexão da conta"}</strong></div>
              <div className="profile-detail-row"><span>Sobre mim</span><strong className="profile-detail-bio">{profile.bio || "Adicione uma breve apresentação sobre você."}</strong></div>
            </div>
            <button type="button" className="profile-inline-action" onClick={openEditor}>Atualizar informações <Icon name="chevron" size={14} /></button>
          </section>

          <section className="profile-panel">
            <div className="profile-panel-heading">
              <div className="profile-panel-icon academic"><Icon name="book" size={18} /></div>
              <div><h2>Informações acadêmicas</h2><p>Detalhes da sua jornada de estudos.</p></div>
            </div>
            <div className="profile-academic-grid">
              <div className="profile-academic-item"><span>Curso</span><strong>{profile.course || "Não informado"}</strong></div>
              <div className="profile-academic-item"><span>Instituição</span><strong>{profile.institution || "Não informada"}</strong></div>
              <div className="profile-academic-item"><span>Período</span><strong>{profile.semester || "Não informado"}</strong></div>
            </div>
            <button type="button" className="profile-inline-action" onClick={openEditor}>Editar dados acadêmicos <Icon name="chevron" size={14} /></button>
          </section>
        </div>

        <section className="profile-account-card">
          <div className="profile-account-icon"><Icon name="shield" size={19} /></div>
          <div className="profile-account-copy"><h2>Conta e segurança</h2><p>Sua conta está conectada ao Supabase. Nome e curso são sincronizados com seu perfil acadêmico.</p></div>
          <span className="profile-pending-label">Conectado</span>
        </section>

        {!loaded && <div className="profile-loading"><span className="loading-spinner" />Carregando perfil...</div>}

        {editing && (
          <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(false); }}>
            <section className="modal-card profile-edit-modal" role="dialog" aria-modal="true" aria-labelledby="profile-edit-title">
              <div className="modal-heading">
                <div><p className="eyebrow">PERSONALIZE SUA CONTA</p><h2 id="profile-edit-title">Editar perfil</h2><p>Preencha apenas as informações que quiser compartilhar.</p></div>
                <button type="button" className="icon-button" onClick={() => setEditing(false)} aria-label="Fechar"><Icon name="close" size={18} /></button>
              </div>
              <form onSubmit={handleSubmit} className="profile-edit-form">
                <label>Nome completo<input value={draft.fullName} onChange={(event) => updateDraft("fullName", event.target.value)} placeholder="Como devemos chamar você?" maxLength={100} /></label>
                <label>E-mail<input type="email" value={draft.email} disabled maxLength={160} /></label>
                <div className="profile-form-two-columns">
                  <label>Curso<input value={draft.course} onChange={(event) => updateDraft("course", event.target.value)} placeholder="Ex.: Análise e Desenvolvimento de Sistemas" maxLength={100} /></label>
                  <label>Período<input value={draft.semester} onChange={(event) => updateDraft("semester", event.target.value)} placeholder="Ex.: 3º período" maxLength={40} /></label>
                </div>
                <label>Instituição<input value={draft.institution} onChange={(event) => updateDraft("institution", event.target.value)} placeholder="Nome da faculdade ou universidade" maxLength={120} /></label>
                <label>Sobre mim<textarea value={draft.bio} onChange={(event) => updateDraft("bio", event.target.value)} placeholder="Conte um pouco sobre sua jornada acadêmica..." rows={3} maxLength={240} /></label>
                <p className="profile-local-note"><Icon name="info" size={14} /> Nome e curso são sincronizados com o Supabase. Instituição, período e apresentação ficam salvos neste dispositivo, pois ainda não existem colunas para eles no banco.</p>
                <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setEditing(false)}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}><Icon name="check" size={16} />{saving ? "Salvando..." : "Salvar alterações"}</button></div>
              </form>
            </section>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
