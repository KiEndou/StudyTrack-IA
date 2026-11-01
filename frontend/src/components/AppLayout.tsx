import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type IconName = "grid" | "book" | "check-square" | "calendar" | "chart" | "sparkles" | "settings" | "chevron" | "menu" | "plus" | "search" | "filter" | "clock" | "user" | "more" | "close" | "trash" | "edit" | "layers" | "refresh" | "check-circle" | "shield" | "info" | "check" | "clipboard" | "target" | "activity" | "message" | "lightbulb" | "arrow-up";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" /><path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20" /><path d="M8 7h8M8 10h7" /></>,
    "check-square": <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="m7.5 12 3 3 6-6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 6-7" /></>,
    sparkles: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9z" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.9Z" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    filter: <><path d="M4 6h16M7 12h10m-7 6h4" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    trash: <><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" /></>,
    edit: <><path d="m4 16.5-.8 4.3 4.3-.8L19 8.5 15.5 5z" /><path d="m13.8 6.7 3.5 3.5" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2" /></>,
    "check-circle": <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16.5 9" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5h6a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 9 4.5ZM8.5 10h7M8.5 14h7M8.5 18h4" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    activity: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
    message: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6.5A7.5 7.5 0 1 1 20 11.5Z" /><path d="M8 11h8M8 14h5" /></>,
    lightbulb: <><path d="M9 18h6M10 22h4M8.2 14.5A7 7 0 1 1 15.8 14.5c-.9.7-1.3 1.5-1.5 2.5h-4.6c-.2-1-.6-1.8-1.5-2.5Z" /></>,
    "arrow-up": <path d="M12 19V5m-7 7 7-7 7 7" />,
  };

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

const navigation: { label: string; icon: IconName; path?: string; soon?: boolean }[] = [
  { label: "Visão geral", icon: "grid", path: "/" },
  { label: "Disciplinas", icon: "book", path: "/disciplinas" },
  { label: "Atividades", icon: "check-square", path: "/atividades" },
  { label: "Calendário", icon: "calendar", path: "/calendario" },
  { label: "Desempenho", icon: "chart", path: "/desempenho" },
  { label: "Tutor StudyTrack", icon: "message", path: "/tutor" },
  { label: "Meu perfil", icon: "user", path: "/perfil" },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.user_metadata?.nome || user?.email?.split("@")[0] || "Estudante";
  const avatar = displayName.trim().charAt(0).toUpperCase() || "E";

  async function handleSignOut() {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Não foi possível encerrar a sessão:", error);
    }
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">S</div>
          <div className="brand-copy">
            <strong>studytrack<span>.</span></strong>
            <small>Seu espaço de estudos</small>
          </div>
        </div>

        <div className="sidebar-section-label">MENU PRINCIPAL</div>
        <nav className="main-navigation" aria-label="Navegação principal">
          {navigation.map((item) => item.path ? (
            <NavLink key={item.label} to={item.path} end className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ) : (
            <div key={item.label} className="nav-item nav-item-disabled" aria-disabled="true" title="Esta página será construída em breve">
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.soon && <span className="nav-soon">EM BREVE</span>}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-section-label">PREFERÊNCIAS</div>
          <div className="nav-item nav-item-disabled" aria-disabled="true" title="Esta página será construída em breve">
            <Icon name="settings" />
            <span>Configurações</span>
          </div>
          <div className="sidebar-help-card">
            <div className="help-icon"><Icon name="sparkles" size={17} /></div>
            <strong>Estude no seu ritmo.</strong>
            <p>Organize suas tarefas e acompanhe sua evolução em um só lugar.</p>
          </div>
          <div className="sidebar-user">
            <NavLink to="/perfil" className="sidebar-user-link">
              <div className="user-avatar">{avatar}</div>
              <div className="user-copy"><strong>{displayName}</strong><span>{user?.email || "Minha conta"}</span></div>
            </NavLink>
            <button className="user-logout" type="button" onClick={handleSignOut} title="Sair da conta" aria-label="Sair da conta">↗</button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Meu espaço</span><Icon name="chevron" size={14} /><strong>{window.location.pathname.startsWith("/disciplinas") ? "Disciplinas" : window.location.pathname.startsWith("/atividades") ? "Atividades" : window.location.pathname.startsWith("/calendario") ? "Calendário" : window.location.pathname.startsWith("/desempenho") ? "Desempenho" : window.location.pathname.startsWith("/tutor") ? "Tutor StudyTrack" : window.location.pathname.startsWith("/perfil") ? "Meu perfil" : "Visão geral"}</strong></div>
          <div className="topbar-right">
            <span className="topbar-date">{new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</span>
            <div className="topbar-avatar">{avatar}</div>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

export { Icon };
