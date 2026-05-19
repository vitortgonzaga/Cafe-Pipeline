import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  CATEGORIES,
  CRITICALITIES,
  IN_REASONS,
  OUT_REASONS,
  UNITS,
  categoryLabel,
  type CafeItem,
  type Category,
  type Criticality,
  type ItemStatus,
  type Unit,
} from "@/domain/items";
import type { CreateItemRequestDTO, UpdateItemRequestDTO } from "@/data/items/dto/item-request.dto";
import { HttpError } from "@/http";
import {
  useAddStock,
  useAllMovements,
  useConsumeStock,
  useCreateItem,
  useDeleteItem,
  useItems,
  useUpdateItem,
} from "@/presentation/hooks/items";

type Tab = "items" | "movements" | "reports";

type ItemFormState = {
  name: string;
  category: Category;
  quantity: number;
  minQuantity: number;
  unit: Unit;
  criticality: Criticality;
};

type MovementType = "IN" | "OUT";

type ToastState = { msg: string; kind: "ok" | "err" };

const emptyForm: ItemFormState = {
  name: "",
  category: "COFFEE",
  quantity: 0,
  minQuantity: 0,
  unit: "UNIT",
  criticality: "MEDIUM",
};

function validateForm(input: ItemFormState): string | null {
  if (!input.name.trim()) return "Nome não pode ser vazio.";
  if (input.quantity < 0) return "Quantidade não pode ser negativa.";
  if (input.minQuantity < 0) return "Estoque mínimo não pode ser negativo.";
  return null;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function PipelineCafePage() {
  const itemsQuery = useItems();
  const items = useMemo<CafeItem[]>(() => itemsQuery.data ?? [], [itemsQuery.data]);

  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const addStock = useAddStock();
  const consumeStock = useConsumeStock();

  const [tab, setTab] = useState<Tab>("items");
  const [filter, setFilter] = useState<Category | "ALL">("ALL");
  const [form, setForm] = useState<ItemFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [movItem, setMovItem] = useState<CafeItem | null>(null);
  const [movType, setMovType] = useState<MovementType>("IN");
  const [movQty, setMovQty] = useState(1);
  const [movReason, setMovReason] = useState("");
  const [movResp, setMovResp] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);

  const { movements, isLoading: isLoadingMovements } = useAllMovements(
    tab === "movements" ? items : [],
  );

  const notify = (msg: string, kind: "ok" | "err" = "ok") => {
    setToast({ msg, kind });
    window.setTimeout(() => setToast(null), 2800);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submitForm = async (event: FormEvent) => {
    event.preventDefault();
    const validation = validateForm(form);
    if (validation) {
      notify(validation, "err");
      return;
    }
    const payload: CreateItemRequestDTO | UpdateItemRequestDTO = {
      ...form,
      name: form.name.trim(),
    };

    try {
      if (editingId) {
        await updateItem.mutateAsync({ id: editingId, payload });
        notify(`Item "${payload.name}" atualizado.`);
      } else {
        await createItem.mutateAsync(payload);
        notify(`Item "${payload.name}" cadastrado.`);
      }
      resetForm();
    } catch (error) {
      notify(getErrorMessage(error, "Falha ao salvar item."), "err");
    }
  };

  const editItem = (item: CafeItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      unit: item.unit,
      criticality: item.criticality,
    });
    setTab("items");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeItem = async (item: CafeItem) => {
    if (!window.confirm("Remover este item do cardápio?")) return;
    try {
      await deleteItem.mutateAsync(item.id);
      notify(`Item "${item.name}" removido.`);
      if (editingId === item.id) resetForm();
    } catch (error) {
      notify(getErrorMessage(error, "Falha ao remover item."), "err");
    }
  };

  const openMov = (item: CafeItem, type: MovementType) => {
    setMovItem(item);
    setMovType(type);
    setMovQty(1);
    setMovReason("");
    setMovResp("");
  };

  const submitMov = async (event: FormEvent) => {
    event.preventDefault();
    if (!movItem) return;
    if (movQty <= 0) {
      notify("Quantidade deve ser maior que zero.", "err");
      return;
    }
    if (!movReason.trim()) {
      notify("Motivo é obrigatório.", "err");
      return;
    }
    if (!movResp.trim()) {
      notify("Responsável é obrigatório.", "err");
      return;
    }
    if (movType === "OUT" && movQty > movItem.quantity) {
      notify("Saída maior que o estoque disponível.", "err");
      return;
    }

    try {
      if (movType === "IN") {
        await addStock.mutateAsync({
          id: movItem.id,
          payload: {
            quantity: movQty,
            reason: movReason.trim(),
            responsible: movResp.trim(),
          },
        });
      } else {
        await consumeStock.mutateAsync({
          id: movItem.id,
          payload: {
            quantity: movQty,
            reason: movReason.trim(),
            responsible: movResp.trim(),
          },
        });
      }
      notify(`${movType === "IN" ? "Entrada" : "Saída"} registrada: ${movQty} × ${movItem.name}.`);
      setMovItem(null);
    } catch (error) {
      notify(getErrorMessage(error, "Falha ao registrar movimentação."), "err");
    }
  };

  const filtered = useMemo(
    () => (filter === "ALL" ? items : items.filter((i) => i.category === filter)),
    [items, filter],
  );

  const stats = useMemo(
    () => ({
      total: items.length,
      low: items.filter((i) => i.status === "LOW_STOCK").length,
      out: items.filter((i) => i.status === "OUT_OF_STOCK").length,
      movs: movements.length,
    }),
    [items, movements.length],
  );

  const isSavingItem = createItem.isPending || updateItem.isPending;
  const isSavingMov = addStock.isPending || consumeStock.isPending;
  const isLoading = itemsQuery.isLoading;
  const loadError = itemsQuery.error;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-[820px] mx-auto space-y-10">
        <header className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 bg-brass rounded-full flex items-center justify-center shadow-lg shadow-black/40">
            <svg
              className="w-7 h-7"
              style={{ color: "var(--espresso)" }}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8h13a4 4 0 010 8h-1M3 8v8a4 4 0 004 4h6a4 4 0 004-4M3 8V6a2 2 0 012-2h10a2 2 0 012 2v2M8 3v2M11 3v2M14 3v2"
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-cream">
            PIPELINE CAFÉ
          </h1>
          <p className="label-eyebrow">Especialidade em sobrevivência ao deploy</p>
        </header>

        {loadError && (
          <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg p-4 text-sm">
            Não foi possível carregar os itens do estoque. Verifique se o backend está rodando em{" "}
            <code>{import.meta.env.VITE_API_URL ?? "http://localhost:3001/api"}</code>.
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 py-6 border-y border-border">
          <Stat label="Itens" value={stats.total} />
          <Stat label="Low" value={stats.low} tone="warning" />
          <Stat label="Out" value={stats.out} tone="danger" />
          <Stat label="Mov" value={stats.movs} />
        </div>

        <nav className="flex justify-center space-x-10 md:space-x-12">
          {(
            [
              ["items", "Estoque"],
              ["movements", "Movimentações"],
              ["reports", "Relatórios"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`pb-2 px-1 text-xs md:text-sm font-semibold tracking-[0.15em] uppercase border-b-2 transition-all ${
                tab === key
                  ? "border-brass text-cream"
                  : "border-transparent text-brass opacity-60 hover:opacity-100"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === "items" && (
          <>
            <section className="bg-card rounded-xl p-8 shadow-2xl border border-border">
              <h2 className="text-xl font-semibold mb-8 text-cream flex items-center gap-3">
                <span className="w-1.5 h-6 bg-brass rounded-full" />
                {editingId ? "Editar item do cardápio" : "Novo grão no inventário"}
              </h2>

              <form onSubmit={submitForm} className="grid grid-cols-6 gap-5">
                <FormField label="Nome do item" span={3}>
                  <input
                    className="cf-input"
                    placeholder="ex: Café de Deploy"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </FormField>
                <FormField label="Categoria" span={2}>
                  <select
                    className="cf-input"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {categoryLabel(c)}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Unidade" span={1}>
                  <select
                    className="cf-input"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value as Unit })}
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Quantidade" span={2}>
                  <input
                    type="number"
                    min={0}
                    className="cf-input"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  />
                </FormField>
                <FormField label="Estoque Mínimo" span={2}>
                  <input
                    type="number"
                    min={0}
                    className="cf-input"
                    value={form.minQuantity}
                    onChange={(e) => setForm({ ...form, minQuantity: Number(e.target.value) })}
                  />
                </FormField>
                <FormField label="Criticidade" span={2}>
                  <select
                    className="cf-input"
                    value={form.criticality}
                    onChange={(e) =>
                      setForm({ ...form, criticality: e.target.value as Criticality })
                    }
                  >
                    {CRITICALITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </FormField>

                <div className="col-span-6 pt-3 flex gap-3">
                  <button
                    type="submit"
                    disabled={isSavingItem}
                    className="cf-btn-primary flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSavingItem
                      ? "Salvando..."
                      : editingId
                        ? "SALVAR ALTERAÇÕES"
                        : "ADICIONAR AO MENU"}
                  </button>
                  {editingId && (
                    <button type="button" onClick={resetForm} className="cf-btn-ghost">
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="space-y-4">
              <div className="flex justify-between items-center mb-2 flex-wrap gap-3">
                <h2 className="text-xl font-semibold text-cream">Menu de estoque</h2>
                <select
                  className="bg-transparent border-b border-border text-brass text-xs font-bold uppercase tracking-widest py-1 focus:outline-none cursor-pointer"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as Category | "ALL")}
                >
                  <option value="ALL">Todas as categorias</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {categoryLabel(c)}
                    </option>
                  ))}
                </select>
              </div>

              {isLoading ? (
                <div className="bg-card rounded-lg p-10 text-center border border-border">
                  <p className="text-brass opacity-70">Moendo os dados do estoque...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-card rounded-lg p-10 text-center border border-border">
                  <p className="text-brass opacity-70">
                    Nenhum item nesta categoria. Hora de torrar mais grãos ☕
                  </p>
                </div>
              ) : (
                filtered.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onIn={() => openMov(item, "IN")}
                    onOut={() => openMov(item, "OUT")}
                    onEdit={() => editItem(item)}
                    onRemove={() => removeItem(item)}
                  />
                ))
              )}
            </section>
          </>
        )}

        {tab === "movements" && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-cream">Histórico de movimentações</h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-brass label-eyebrow border-b border-border">
                    <th className="text-left px-4 py-3">Data</th>
                    <th className="text-left px-4 py-3">Tipo</th>
                    <th className="text-left px-4 py-3">Item</th>
                    <th className="text-left px-4 py-3">Qtd</th>
                    <th className="text-left px-4 py-3">Motivo</th>
                    <th className="text-left px-4 py-3">Barista</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr
                      key={m.id}
                      className="border-t border-border hover:bg-brass/5 transition-colors"
                    >
                      <td className="px-4 py-3 text-brass/80 whitespace-nowrap text-xs">
                        {m.createdAt.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase border ${
                            m.type === "IN"
                              ? "bg-success/10 border-success/30 text-success"
                              : "bg-danger/10 border-danger/30 text-danger"
                          }`}
                        >
                          {m.type === "IN" ? "Entrada" : "Saída"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-cream">{m.itemName ?? "—"}</td>
                      <td className="px-4 py-3 font-bold text-cream">{m.quantity}</td>
                      <td className="px-4 py-3 text-brass/80">{m.reason}</td>
                      <td className="px-4 py-3 text-brass/80">{m.responsible}</td>
                    </tr>
                  ))}
                  {!isLoadingMovements && movements.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-brass/60">
                        Nenhuma movimentação ainda. Pipeline calmo, café tranquilo ☕
                      </td>
                    </tr>
                  )}
                  {isLoadingMovements && movements.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-brass/60">
                        Filtrando o histórico do barista...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "reports" && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Report
              title="Estoque baixo"
              icon="⚠️"
              tone="warning"
              empty="Tudo nos conformes."
              items={items.filter((i) => i.status === "LOW_STOCK")}
            />
            <Report
              title="Itens zerados"
              icon="🚨"
              tone="danger"
              empty="Nenhum item zerado. Build verde 🟢"
              items={items.filter((i) => i.status === "OUT_OF_STOCK")}
            />
          </section>
        )}

        <footer className="pt-10 text-center label-eyebrow opacity-60">
          Established 2024 — Continuous Deployment Coffee Division
        </footer>
      </div>

      {movItem && (
        <Modal
          title={`${movType === "IN" ? "Entrada" : "Saída"} — ${movItem.name}`}
          onClose={() => setMovItem(null)}
        >
          <form onSubmit={submitMov} className="space-y-5">
            <div className="text-sm text-brass">
              Estoque atual:{" "}
              <span className="text-cream font-bold">
                {movItem.quantity} {movItem.unit}
              </span>
            </div>
            <FormField label="Quantidade">
              <input
                type="number"
                min={1}
                className="cf-input"
                value={movQty}
                onChange={(e) => setMovQty(Number(e.target.value))}
              />
            </FormField>
            <FormField label="Motivo">
              <select
                className="cf-input"
                value={movReason}
                onChange={(e) => setMovReason(e.target.value)}
              >
                <option value="">— selecione —</option>
                {(movType === "IN" ? IN_REASONS : OUT_REASONS).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Responsável">
              <input
                className="cf-input"
                value={movResp}
                onChange={(e) => setMovResp(e.target.value)}
                placeholder="ex.: @dev.ops"
              />
            </FormField>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSavingMov}
                className={`${
                  movType === "IN" ? "cf-btn-primary" : "cf-btn-danger"
                } flex-1 disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isSavingMov
                  ? "Registrando..."
                  : `Registrar ${movType === "IN" ? "entrada" : "saída"}`}
              </button>
              <button type="button" onClick={() => setMovItem(null)} className="cf-btn-ghost">
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg border text-sm shadow-2xl backdrop-blur ${
            toast.kind === "ok"
              ? "bg-success/10 border-success/30 text-success"
              : "bg-danger/10 border-danger/30 text-danger"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <style>{`
        .cf-input {
          width: 100%;
          background: var(--espresso);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0.7rem 0.9rem;
          color: var(--cream);
          font-family: var(--font-sans);
          font-size: 0.875rem;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .cf-input::placeholder { color: rgba(168, 116, 84, 0.45); }
        .cf-input:focus { border-color: var(--brass); box-shadow: 0 0 0 3px rgba(168, 116, 84, 0.18); }
        select.cf-input { appearance: none; background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a87454' stroke-width='2'><path d='M6 9l6 6 6-6'/></svg>"); background-repeat: no-repeat; background-position: right 0.75rem center; padding-right: 2rem; }

        .cf-btn-primary {
          background: var(--brass); color: var(--espresso);
          padding: 0.85rem 1.25rem; border-radius: 10px;
          font-family: var(--font-display); font-weight: 700;
          font-size: 0.75rem; letter-spacing: 0.18em; text-transform: uppercase;
          transition: all .2s; cursor: pointer;
          box-shadow: 0 4px 14px rgba(168, 116, 84, 0.25);
        }
        .cf-btn-primary:hover { background: var(--accent); transform: translateY(-1px); }
        .cf-btn-primary:active { transform: scale(0.99); }

        .cf-btn-danger {
          background: var(--danger); color: #fff;
          padding: 0.85rem 1.25rem; border-radius: 10px;
          font-family: var(--font-display); font-weight: 700;
          font-size: 0.75rem; letter-spacing: 0.18em; text-transform: uppercase;
          cursor: pointer;
        }
        .cf-btn-ghost {
          background: transparent; color: var(--brass);
          padding: 0.85rem 1.25rem; border-radius: 10px;
          border: 1px solid var(--border);
          font-size: 0.75rem; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 600;
          cursor: pointer;
        }
        .cf-btn-ghost:hover { color: var(--cream); border-color: var(--brass); }
      `}</style>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "warning" | "danger";
}) {
  const color =
    tone === "warning" ? "text-warning" : tone === "danger" ? "text-danger" : "text-cream";
  return (
    <div className="text-center">
      <span
        className={`block text-3xl font-bold ${color}`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="label-eyebrow">{label}</span>
    </div>
  );
}

function FormField({
  label,
  span,
  children,
}: {
  label: string;
  span?: number;
  children: ReactNode;
}) {
  const cls =
    span === 1
      ? "col-span-6 sm:col-span-1"
      : span === 2
        ? "col-span-6 sm:col-span-2"
        : span === 3
          ? "col-span-6 sm:col-span-3"
          : "col-span-6";
  return (
    <label className={`${cls} flex flex-col space-y-2`}>
      <span className="label-eyebrow">{label}</span>
      {children}
    </label>
  );
}

function StatusBadge({ status }: { status: ItemStatus }) {
  const map: Record<ItemStatus, { cls: string; label: string }> = {
    AVAILABLE: {
      cls: "bg-success/10 border-success/30 text-success",
      label: "Disponível",
    },
    LOW_STOCK: {
      cls: "bg-warning/10 border-warning/30 text-warning",
      label: "Estoque baixo",
    },
    OUT_OF_STOCK: {
      cls: "bg-danger/10 border-danger/30 text-danger",
      label: "Zerado",
    },
  };
  const { cls, label } = map[status];
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest border uppercase ${cls}`}
    >
      {label}
    </span>
  );
}

function ItemRow({
  item,
  onIn,
  onOut,
  onEdit,
  onRemove,
}: {
  item: CafeItem;
  onIn: () => void;
  onOut: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const borderColor =
    item.status === "OUT_OF_STOCK"
      ? "border-l-danger"
      : item.status === "LOW_STOCK"
        ? "border-l-warning"
        : "border-l-brass";
  const qtyColor =
    item.status === "OUT_OF_STOCK"
      ? "text-danger"
      : item.status === "LOW_STOCK"
        ? "text-warning"
        : "text-cream";

  return (
    <div
      className={`bg-card p-5 rounded-lg border-l-4 ${borderColor} flex items-center justify-between gap-4 hover:bg-secondary/60 transition-all group flex-wrap sm:flex-nowrap`}
      style={{
        borderTop: "1px solid var(--border)",
        borderRight: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex-1 min-w-[200px]">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-lg font-semibold text-cream">{item.name}</h3>
          <StatusBadge status={item.status} />
        </div>
        <div className="flex gap-4 mt-1.5 flex-wrap">
          <span className="label-eyebrow">{categoryLabel(item.category)}</span>
          <span className="label-eyebrow opacity-60">
            Mín: {item.minQuantity} {item.unit}
          </span>
          <span className="label-eyebrow opacity-60">Crit: {item.criticality}</span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="text-right">
          <div
            className={`text-3xl font-bold ${qtyColor}`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {String(item.quantity).padStart(2, "0")}
          </div>
          <div className="label-eyebrow">{item.unit}</div>
        </div>
        <div className="flex gap-1.5">
          <IconBtn title="Entrada" onClick={onIn} variant="brass">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </IconBtn>
          <IconBtn title="Saída" onClick={onOut} variant="danger">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
          </IconBtn>
          <IconBtn title="Editar" onClick={onEdit}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </IconBtn>
          <IconBtn title="Remover" onClick={onRemove}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M4 7h16M10 7V4a1 1 0 011-1h2a1 1 0 011 1v3"
            />
          </IconBtn>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  variant,
}: {
  children: ReactNode;
  onClick: () => void;
  title: string;
  variant?: "brass" | "danger";
}) {
  const hover =
    variant === "brass"
      ? "hover:bg-brass hover:text-[var(--espresso)]"
      : variant === "danger"
        ? "hover:bg-[var(--danger)] hover:text-white"
        : "hover:bg-secondary";
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-md bg-[var(--espresso)] text-brass border border-border transition-all ${hover}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {children}
      </svg>
    </button>
  );
}

function Report({
  title,
  icon,
  items,
  empty,
  tone,
}: {
  title: string;
  icon: string;
  items: CafeItem[];
  empty: string;
  tone: "warning" | "danger";
}) {
  const accent = tone === "warning" ? "border-l-warning" : "border-l-danger";
  return (
    <div className={`bg-card rounded-xl border border-border border-l-4 ${accent} p-6`}>
      <h3 className="text-base font-semibold mb-4 text-cream flex items-center gap-2">
        <span>{icon}</span> {title}
        <span className="label-eyebrow ml-auto">{items.length}</span>
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-brass opacity-70">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((i) => (
            <li
              key={i.id}
              className="flex items-center justify-between border-b border-border pb-3 last:border-0"
            >
              <div>
                <div className="font-medium text-cream">{i.name}</div>
                <div className="label-eyebrow opacity-70">{categoryLabel(i.category)}</div>
              </div>
              <div className="text-right">
                <div
                  className={`text-xl font-bold ${
                    tone === "warning" ? "text-warning" : "text-danger"
                  }`}
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {i.quantity} {i.unit}
                </div>
                <div className="label-eyebrow opacity-60">Mín {i.minQuantity}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3
            className="font-semibold text-cream text-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h3>
          <button onClick={onClose} className="text-brass hover:text-cream text-xl leading-none">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
