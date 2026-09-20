// Declarações de tipos fornecidas pelo Vite para import.meta.env.
/// <reference types="vite/client" />

// Lista as variáveis de ambiente usadas pelo frontend.
type ImportMetaEnv = {
  readonly VITE_API_URL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
};

// Informa ao TypeScript que import.meta possui as variáveis tipadas acima.
type ImportMeta = {
  readonly env: ImportMetaEnv;
};
