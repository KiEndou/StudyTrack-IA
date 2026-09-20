// Configura a comunicação entre o frontend e a API FastAPI.
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Verifica se o backend está acessível antes de exibir o status no dashboard.
export async function checkApiHealth(): Promise<void> {
  // Faz uma chamada ao endpoint de saúde publicado pelo backend.
  const response = await fetch(`${apiUrl}/health`);
  // Converte respostas HTTP de erro em uma rejeição tratada pela página.
  if (!response.ok) throw new Error("API unavailable");
}