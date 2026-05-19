import { CATEGORY_VALUES, CRITICALITY_VALUES, UNIT_VALUES, type Category } from "./enums";

export const CATEGORIES = CATEGORY_VALUES;
export const UNITS = UNIT_VALUES;
export const CRITICALITIES = CRITICALITY_VALUES;

export const OUT_REASONS = [
  "Build quebrou",
  "Deploy em produção",
  "Teste de integração falhou",
  "Rollback emergencial",
  "Pipeline demorou demais",
  "Code review extenso",
  "Cobertura de testes abaixo de 90%",
] as const;

export const IN_REASONS = [
  "Reposição semanal",
  "Compra emergencial",
  "Ajuste de inventário",
  "Doação do time de SRE",
] as const;

const CATEGORY_LABELS: Record<Category, string> = {
  COFFEE: "☕ Coffee",
  SNACK: "🥐 Snack",
  ENERGY_DRINK: "⚡ Energy",
  TESTING: "🧪 Testing",
  DEPLOY: "🚀 Deploy",
  ROLLBACK: "↩️ Rollback",
  HOTFIX: "🔥 Hotfix",
};

export function categoryLabel(category: Category): string {
  return CATEGORY_LABELS[category];
}
