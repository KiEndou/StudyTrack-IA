const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/$/, "");

export type AiChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AiChatResponse = {
  reply: string;
  model: string;
};

export async function checkApiHealth(): Promise<void> {
  const response = await fetch(`${apiUrl}/health`);
  if (!response.ok) throw new Error("API unavailable");
}

export async function sendAiMessage(
  message: string,
  history: AiChatMessage[] = [],
  academicContext = "",
): Promise<AiChatResponse> {
  const response = await fetch(`${apiUrl}/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      history,
      academic_context: academicContext,
    }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      typeof result?.detail === "string"
        ? result.detail
        : "Não foi possível conversar com o Tutor.";
    throw new Error(detail);
  }

  return result as AiChatResponse;
}