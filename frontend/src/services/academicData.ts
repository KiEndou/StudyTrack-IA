export type UiActivityStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type UiActivityType = "assignment" | "exam" | "task";

export type ActivityRecord = {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  description?: string | null;
  activity_type: UiActivityType;
  due_date?: string | null;
  weight?: number | null;
  status: UiActivityStatus;
};

export function statusFromDatabase(value: unknown): UiActivityStatus {
  switch (String(value ?? "").toLowerCase()) {
    case "em_andamento": case "in_progress": return "in_progress";
    case "concluida": case "concluído": case "completed": return "completed";
    case "cancelada": case "cancelled": case "canceled": return "cancelled";
    default: return "pending";
  }
}

export function statusToDatabase(value: UiActivityStatus): string {
  return ({ pending: "pendente", in_progress: "em_andamento", completed: "concluida", cancelled: "cancelada" })[value];
}

export function typeFromDatabase(value: unknown): UiActivityType {
  const normalized = String(value ?? "").toLowerCase();
  if (["prova", "exam", "avaliação", "avaliacao"].includes(normalized)) return "exam";
  if (["tarefa", "task"].includes(normalized)) return "task";
  return "assignment";
}

export function typeToDatabase(value: UiActivityType): string {
  return ({ assignment: "trabalho", exam: "prova", task: "tarefa" })[value];
}

export function activityFromDatabase(row: Record<string, any>): ActivityRecord {
  return {
    id: row.id,
    user_id: row.usuario_id,
    subject_id: row.disciplina_id ?? null,
    title: row.titulo ?? "",
    description: row.descricao ?? null,
    activity_type: typeFromDatabase(row.tipo),
    due_date: row.data_entrega ?? null,
    weight: row.peso == null ? null : Number(row.peso),
    status: statusFromDatabase(row.status),
  };
}

export function activityToDatabase(input: {
  title: string;
  subject_id: string | null;
  activity_type: UiActivityType;
  due_date: string | null;
  weight: number | null;
  status: UiActivityStatus;
  description: string | null;
}) {
  return {
    titulo: input.title,
    disciplina_id: input.subject_id,
    tipo: typeToDatabase(input.activity_type),
    data_entrega: input.due_date,
    peso: input.weight,
    status: statusToDatabase(input.status),
    descricao: input.description,
  };
}

export function subjectFromDatabase(row: { id: string; nome: string }) {
  return { id: row.id, name: row.nome };
}
