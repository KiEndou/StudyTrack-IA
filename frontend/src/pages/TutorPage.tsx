import { AppLayout, Icon } from "../components/AppLayout";

export function TutorPage() {
  return (
    <AppLayout>
      <div className="tutor-page">
        <section className="tutor-intro">
          <div><p className="eyebrow">APOIO PARA SUA JORNADA</p><h1>Tutor StudyTrack</h1><p className="tutor-description">Um espaço para tirar dúvidas, revisar conteúdos e receber apoio nos estudos.</p></div>
          <span className="tutor-status"><i /> Em preparação</span>
        </section>
        <section className="tutor-welcome-card">
          <div className="tutor-orbit"><div className="tutor-orbit-inner"><Icon name="sparkles" size={29} /></div><span /><span /><span /></div>
          <div className="tutor-welcome-copy"><span className="tutor-kicker">SEU FUTURO PARCEIRO DE ESTUDOS</span><h2>Aprender fica mais leve quando você tem com quem conversar.</h2><p>O Tutor StudyTrack está sendo preparado para ajudar você a compreender assuntos, organizar ideias e avançar nos estudos, no seu ritmo.</p><div className="tutor-feature-list"><span><Icon name="message" size={15} /> Conversas e dúvidas</span><span><Icon name="book" size={15} /> Apoio nos conteúdos</span><span><Icon name="lightbulb" size={15} /> Ideias e explicações</span></div></div>
        </section>
        <section className="tutor-chat-shell" aria-label="Área de conversa com o Tutor StudyTrack">
          <div className="tutor-chat-heading"><div className="tutor-chat-avatar"><Icon name="sparkles" size={17} /></div><div><strong>Tutor StudyTrack</strong><span>Assistente de estudos</span></div><span className="tutor-coming-soon">EM BREVE</span></div>
          <div className="tutor-chat-body"><div className="tutor-message-avatar"><Icon name="sparkles" size={18} /></div><div className="tutor-message-content"><span>Tutor StudyTrack</span><p>Oi! Estou quase pronto para acompanhar seus estudos. Em breve, você poderá conversar comigo por aqui.</p><small>Prévia da experiência</small></div></div>
          <div className="tutor-composer"><input type="text" placeholder="A conversa estará disponível em breve..." disabled aria-label="Mensagem desabilitada até a integração do tutor" /><button type="button" disabled aria-label="Enviar mensagem"><Icon name="arrow-up" size={17} /></button></div>
          <p className="tutor-disclaimer"><Icon name="info" size={13} /> A integração com a inteligência artificial será adicionada em uma etapa futura do projeto.</p>
        </section>
      </div>
    </AppLayout>
  );
}
