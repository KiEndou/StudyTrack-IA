// Inicializa o cliente Supabase usado futuramente para autenticação e dados.
import { createClient } from "@supabase/supabase-js";

// As credenciais são lidas das variáveis VITE_* e não ficam escritas no código.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mantém o cliente desativado quando o ambiente ainda não foi configurado.
export const supabase =
  supabaseUrl && supabaseAnonKey
    // A chave anônima é apropriada para uso no frontend com as regras do Supabase.
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
