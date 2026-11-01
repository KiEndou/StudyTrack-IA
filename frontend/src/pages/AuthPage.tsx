import { FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabase";

type Mode = "login" | "signup" | "forgot";

export function AuthPage() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (loading) return <div className="auth-loading">Carregando sua conta...</div>;
  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!supabase) {
      setError("O Supabase ainda não está configurado. Confira o arquivo .env.local.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { nome: name.trim(), curso: course.trim() || null },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (authError) throw authError;
        if (data.session) {
          setMessage("Conta criada! Estamos preparando seu espaço de estudos.");
        } else {
          setMessage("Cadastro iniciado! Verifique seu e-mail para confirmar a conta antes de entrar.");
        }
      } else if (mode === "forgot") {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/redefinir-senha`,
        });
        if (authError) throw authError;
        setMessage("Se esse e-mail estiver cadastrado, você receberá um link para redefinir sua senha.");
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) throw authError;
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível concluir a operação. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "signup" ? "Crie sua conta" : mode === "forgot" ? "Recuperar senha" : "Bem-vindo de volta";
  const subtitle = mode === "signup"
    ? "Comece a organizar sua rotina acadêmica."
    : mode === "forgot"
      ? "Enviaremos um link para o seu e-mail."
      : "Entre para continuar de onde parou.";

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="Apresentação do StudyTrack">
        <div className="auth-brand"><span className="auth-brand-mark">S</span><span>studytrack<span className="auth-brand-dot">.</span></span></div>
        <div className="auth-visual-copy">
          <span className="auth-kicker">SEU ESPAÇO DE ESTUDOS</span>
          <h1>Uma rotina mais leve.<br />Um caminho mais claro.</h1>
          <p>Organize disciplinas, acompanhe atividades e enxergue sua evolução em um só lugar.</p>
          <div className="auth-decoration" aria-hidden="true">
            <div className="auth-decoration-card auth-decoration-card-back"><span></span><span></span><span></span></div>
            <div className="auth-decoration-card auth-decoration-card-front"><div className="auth-decoration-check">✓</div><div><strong>Seu progresso</strong><small>Um passo de cada vez.</small></div><div className="auth-decoration-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
          </div>
        </div>
        <span className="auth-visual-footer">ESTUDE NO SEU RITMO.</span>
      </section>

      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand"><span className="auth-brand-mark">S</span><strong>studytrack<span className="auth-brand-dot">.</span></strong></div>
          <div className="auth-heading"><span className="auth-kicker">{mode === "signup" ? "VAMOS COMEÇAR" : mode === "forgot" ? "ACESSO À CONTA" : "OLÁ NOVAMENTE"}</span><h2>{title}</h2><p>{subtitle}</p></div>
          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && <>
              <label htmlFor="auth-name">Nome completo</label>
              <input id="auth-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Como podemos te chamar?" required />
              <label htmlFor="auth-course">Curso <span>(opcional)</span></label>
              <input id="auth-course" value={course} onChange={(event) => setCourse(event.target.value)} placeholder="Ex.: Análise e Desenvolvimento de Sistemas" />
            </>}
            <label htmlFor="auth-email">E-mail</label>
            <input id="auth-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" required />
            {mode !== "forgot" && <>
              <label htmlFor="auth-password">Senha</label>
              <input id="auth-password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === "signup" ? "Crie uma senha (mín. 6 caracteres)" : "Digite sua senha"} minLength={6} required />
            </>}
            {mode === "login" && <div className="auth-forgot-row"><button type="button" className="auth-text-button" onClick={() => { setMode("forgot"); setError(""); setMessage(""); }}>Esqueceu a senha?</button></div>}
            {error && <div className="auth-alert auth-alert-error" role="alert">{error}</div>}
            {message && <div className="auth-alert auth-alert-success" role="status">{message}</div>}
            <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Aguarde..." : mode === "signup" ? "Criar minha conta" : mode === "forgot" ? "Enviar link de recuperação" : "Entrar"}<span aria-hidden="true">→</span></button>
          </form>
          <div className="auth-switch">
            {mode === "login" ? <>Ainda não tem uma conta? <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }}>Criar conta</button></> : mode === "signup" ? <>Já tem uma conta? <button onClick={() => { setMode("login"); setError(""); setMessage(""); }}>Fazer login</button></> : <>Lembrou sua senha? <button onClick={() => { setMode("login"); setError(""); setMessage(""); }}>Voltar ao login</button></>}
          </div>
          <p className="auth-privacy">Seus dados acadêmicos ficam associados à sua conta.</p>
        </div>
      </section>
    </main>
  );
}

export function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    if (!supabase) { setError("O Supabase não está configurado."); return; }
    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setMessage("Senha atualizada com sucesso. Você já pode entrar com a nova senha.");
      setPassword("");
      setConfirm("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível atualizar sua senha.");
    } finally { setBusy(false); }
  }

  return (
    <main className="auth-page auth-reset-page">
      <section className="auth-form-side auth-reset-side">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand"><span className="auth-brand-mark">S</span><strong>studytrack<span className="auth-brand-dot">.</span></strong></div>
          <div className="auth-heading"><span className="auth-kicker">SEGURANÇA DA CONTA</span><h2>Defina uma nova senha</h2><p>Escolha uma senha segura para sua conta.</p></div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="new-password">Nova senha</label><input id="new-password" type="password" minLength={6} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <label htmlFor="confirm-password">Confirme a nova senha</label><input id="confirm-password" type="password" minLength={6} autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required />
            {error && <div className="auth-alert auth-alert-error" role="alert">{error}</div>}
            {message && <div className="auth-alert auth-alert-success" role="status">{message}</div>}
            <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Salvando..." : "Atualizar senha"}<span aria-hidden="true">→</span></button>
          </form>
          <div className="auth-switch"><Link to="/login">Voltar ao login</Link></div>
        </div>
      </section>
    </main>
  );
}
