
import { AppLayout, Icon } from "../components/AppLayout";
import { useTheme } from "../contexts/ThemeContext";

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <AppLayout>
      <div className="settings-page">
        <div className="settings-heading">
          <p className="eyebrow">PERSONALIZE SEU ESPAÇO</p>
          <h1>Configurações</h1>
          <p>Adapte o StudyTrack às suas preferências.</p>
        </div>

        <section className="settings-section">
          <div className="settings-section-heading">
            <Icon name="settings" size={19} />
            <div>
              <h2>Aparência</h2>
              <p>Personalize a aparência da plataforma.</p>
            </div>
          </div>

          <div className="settings-option">
            <div className="settings-option-info">
              <div className="settings-option-icon">
                <Icon name={isDark ? "moon" : "sun"} size={20} />
              </div>
              <div>
                <strong>Modo escuro</strong>
                <p>
                  {isDark
                    ? "O tema escuro está ativado."
                    : "Use cores mais escuras para estudar."}
                </p>
              </div>
            </div>

            <button
              type="button"
              className={`theme-toggle ${isDark ? "enabled" : ""}`}
              onClick={toggleTheme}
              role="switch"
              aria-checked={isDark}
              aria-label="Ativar ou desativar modo escuro"
            >
              <span />
            </button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
