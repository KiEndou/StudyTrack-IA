import { FormEvent, useEffect, useRef, useState } from "react";
import { AppLayout, Icon } from "../components/AppLayout";
import { supabase } from "../services/supabase";
import { sendAiMessage, type AiChatMessage } from "../services/api";

type ChatMessage = AiChatMessage & { id: number };

type AcademicData = {
  context: string;
  subjectCount: number;
  activityCount: number;
};

const initialMessage: ChatMessage = {
  id: 0,
  role: "assistant",
  content:
    "Olá! Sou o Tutor StudyTrack. Posso explicar conteúdos, ajudar você a revisar para provas e organizar suas atividades. O que vamos estudar hoje?",
};

function formatDate(value: string | null): string {
  if (!value) return "Sem prazo definido";
  const parts = value.slice(0, 10).split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value;
}

function translateStatus(value: unknown): string {
  const status = String(value ?? "").toLowerCase();
  if (["concluida", "concluído", "completed"].includes(status)) return "Concluída";
  if (["em_andamento", "in_progress"].includes(status)) return "Em andamento";
  if (["cancelada", "cancelled", "canceled"].includes(status)) return "Cancelada";
  return "Pendente";
}

function translateType(value: unknown): string {
  const type = String(value ?? "").toLowerCase();
  if (["prova", "exam", "avaliação", "avaliacao"].includes(type)) return "Prova";
  if (["tarefa", "task"].includes(type)) return "Tarefa";
  return "Trabalho";
}

const suggestions = [
  "Me ajude a montar um plano de estudos.",
  "Explique um assunto de forma simples.",
  "Quais atividades devo priorizar?",
];

export function TutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingContext, setLoadingContext] = useState(true);
  const [academicData, setAcademicData] = useState<AcademicData>({
    context: "", subjectCount: 0, activityCount: 0,
  });
  const [contextError, setContextError] = useState("");
  const [chatError, setChatError] = useState("");
  const nextId = useRef(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function loadAcademicContext() {
      if (!supabase) {
        setContextError("O Supabase não está configurado. O tutor poderá responder dúvidas gerais.");
        setLoadingContext(false);
        return;
      }

      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          setContextError("Não foi possível identificar sua conta para carregar os dados acadêmicos.");
          return;
        }

        const userId = authData.user.id;
        const [subjectsResult, activitiesResult] = await Promise.all([
          supabase.from("disciplinas").select("id, nome, professor")
            .eq("usuario_id", userId).order("nome", { ascending: true }),
          supabase.from("atividades")
            .select("titulo, descricao, tipo, data_entrega, peso, status, disciplina_id")
            .eq("usuario_id", userId)
            .order("data_entrega", { ascending: true, nullsFirst: false }),
        ]);

        if (subjectsResult.error) throw subjectsResult.error;
        if (activitiesResult.error) throw activitiesResult.error;

        const subjects = subjectsResult.data ?? [];
        const activities = activitiesResult.data ?? [];
        const subjectNames = new Map(subjects.map((subject) => [subject.id, subject.nome]));

        const subjectContext = subjects.length
          ? subjects.map((subject) =>
              `- ${subject.nome}${subject.professor ? ` (Professor: ${subject.professor})` : ""}`
            ).join("\\n")
          : "Nenhuma disciplina cadastrada.";

        const activityContext = activities.length
          ? activities.slice(0, 40).map((activity) => {
              const subjectName = activity.disciplina_id
                ? subjectNames.get(activity.disciplina_id) ?? "Disciplina não identificada"
                : "Sem disciplina vinculada";
              return [
                `- ${activity.titulo}`,
                `  Disciplina: ${subjectName}`,
                `  Tipo: ${translateType(activity.tipo)}`,
                `  Status: ${translateStatus(activity.status)}`,
                `  Prazo: ${formatDate(activity.data_entrega)}`,
                activity.peso != null ? `  Peso: ${activity.peso}` : "",
                activity.descricao ? `  Descrição: ${activity.descricao}` : "",
              ].filter(Boolean).join("\\n");
            }).join("\\n")
          : "Nenhuma atividade cadastrada.";

        const context = [
          "DISCIPLINAS DO ESTUDANTE:", subjectContext, "",
          "ATIVIDADES DO ESTUDANTE:", activityContext,
          activities.length > 40 ? "\\nObservação: existem mais atividades cadastradas; foram enviadas as 40 primeiras por prazo." : "",
        ].join("\\n").slice(0, 7500);

        setAcademicData({ context, subjectCount: subjects.length, activityCount: activities.length });
      } catch (error) {
        console.error("Erro ao carregar contexto acadêmico:", error);
        setContextError("Não foi possível carregar suas disciplinas e atividades. Você ainda pode conversar sobre assuntos gerais.");
      } finally {
        setLoadingContext(false);
      }
    }

    void loadAcademicContext();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    setInput("");
    setChatError("");
    setSending(true);

    const history = messages.map(({ role, content: messageContent }) => ({
      role, content: messageContent,
    }));
    const userMessage: ChatMessage = { id: nextId.current++, role: "user", content };
    setMessages((previous) => [...previous, userMessage]);

    try {
      const response = await sendAiMessage(content, history, academicData.context);
      setMessages((previous) => [
        ...previous,
        { id: nextId.current++, role: "assistant", content: response.reply },
      ]);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "Não foi possível enviar sua mensagem.");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function useSuggestion(value: string) {
    setInput(value);
    inputRef.current?.focus();
  }

  return (
    <AppLayout>
      <div className="tutor-page tutor-page-redesign">
        <section className="tutor-intro">
          <div>
            <p className="eyebrow">SEU ASSISTENTE DE ESTUDOS</p>
            <h1>Tutor StudyTrack</h1>
            <p className="tutor-description">
              Tire dúvidas, revise matérias e organize sua rotina acadêmica em uma conversa.
            </p>
          </div>
          <span className="tutor-status"><i /> Assistente</span>
        </section>

        <section className="tutor-chat-shell tutor-chat-large" aria-label="Conversa com o Tutor StudyTrack">
          <header className="tutor-chat-heading">
            <div className="tutor-chat-avatar"><Icon name="sparkles" size={19} /></div>
            <div className="tutor-chat-title">
              <strong>Tutor StudyTrack</strong>
              <span>Seu parceiro de aprendizagem</span>
            </div>
            <div className="tutor-context-pill">
              {loadingContext ? "Carregando contexto..." : `${academicData.subjectCount} disciplinas · ${academicData.activityCount} atividades`}
            </div>
          </header>

          <div className="tutor-chat-body tutor-chat-body-large" aria-live="polite">
            {messages.map((message) => (
              <article
                className={`tutor-message ${message.role === "user" ? "user-message" : ""}`}
                key={message.id}
              >
                {message.role === "assistant" && (
                  <div className="tutor-message-avatar"><Icon name="sparkles" size={17} /></div>
                )}
                <div className="tutor-message-content">
                  <span>{message.role === "assistant" ? "Tutor StudyTrack" : "Você"}</span>
                  <p>{message.content}</p>
                </div>
              </article>
            ))}

            {sending && (
              <article className="tutor-message">
                <div className="tutor-message-avatar"><Icon name="sparkles" size={17} /></div>
                <div className="tutor-message-content">
                  <span>Tutor StudyTrack</span>
                  <p className="tutor-typing">Pensando na melhor resposta...</p>
                </div>
              </article>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && (
            <div className="tutor-suggestions">
              <span>Você pode começar perguntando:</span>
              <div>
                {suggestions.map((suggestion) => (
                  <button type="button" key={suggestion} onClick={() => useSuggestion(suggestion)}>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(contextError || chatError) && (
            <div className="tutor-alert" role="status">
              <Icon name="info" size={15} />
              <span>{chatError || contextError}</span>
            </div>
          )}

          <form className="tutor-composer tutor-composer-large" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              rows={2}
              placeholder="Escreva sua mensagem para o tutor..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              disabled={sending}
              aria-label="Mensagem para o tutor"
            />
            <button type="submit" disabled={sending || !input.trim()} aria-label="Enviar mensagem">
              {sending ? <span className="tutor-send-loader" /> : <Icon name="arrow-up" size={19} />}
            </button>
          </form>
          <p className="tutor-disclaimer tutor-disclaimer-large">
            <Icon name="info" size={13} />
            Seus dados acadêmicos são usados como contexto. O tutor não cadastra nem altera atividades.
          </p>
        </section>
      </div>
    </AppLayout>
  );
}
