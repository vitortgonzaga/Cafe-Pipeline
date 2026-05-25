import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PipelineCafePage } from "./pipeline-cafe-page";
import {
  cafeItemFixture,
  lowStockItemFixture,
  outOfStockItemFixture,
  stockMovementFixture,
  stockMovementOutFixture,
} from "@/__test-utils__/fixtures";
import { HttpError } from "@/http";

const hooksMock = vi.hoisted(() => {
  const useItems = vi.fn();
  const useCreateItem = vi.fn();
  const useUpdateItem = vi.fn();
  const useDeleteItem = vi.fn();
  const useAddStock = vi.fn();
  const useConsumeStock = vi.fn();
  const useAllMovements = vi.fn();
  return {
    useItems,
    useCreateItem,
    useUpdateItem,
    useDeleteItem,
    useAddStock,
    useConsumeStock,
    useAllMovements,
  };
});

vi.mock("@/presentation/hooks/items", () => hooksMock);

function createMutationMock(mutateAsync = vi.fn().mockResolvedValue(cafeItemFixture)) {
  return { mutateAsync, isPending: false };
}

function setupDefaultMocks(
  items = [cafeItemFixture, lowStockItemFixture, outOfStockItemFixture],
) {
  hooksMock.useItems.mockReturnValue({
    data: items,
    isLoading: false,
    error: null,
  });
  hooksMock.useAllMovements.mockReturnValue({
    movements: [stockMovementFixture, stockMovementOutFixture],
    isLoading: false,
  });
  hooksMock.useCreateItem.mockReturnValue(createMutationMock());
  hooksMock.useUpdateItem.mockReturnValue(createMutationMock());
  hooksMock.useDeleteItem.mockReturnValue(createMutationMock());
  hooksMock.useAddStock.mockReturnValue(createMutationMock());
  hooksMock.useConsumeStock.mockReturnValue(createMutationMock());
}

function getItemFormSection() {
  return screen
    .getByRole("heading", { name: /novo grão no inventário|editar item do cardápio/i })
    .closest("section") as HTMLElement;
}

function getItemForm() {
  const form = within(getItemFormSection()).getByRole("button", {
    name: /adicionar ao menu|salvar alterações/i,
  }).closest("form") as HTMLFormElement;
  form.noValidate = true;
  return form;
}

async function fillItemName(user: ReturnType<typeof userEvent.setup>, name: string) {
  const input = within(getItemFormSection()).getByPlaceholderText(/café de deploy/i);
  await user.clear(input);
  await user.type(input, name);
}

function getItemRow(name: string) {
  const heading = screen.getByRole("heading", { level: 3, name });
  return heading.closest(".bg-card") as HTMLElement;
}

async function clickItemAction(
  user: ReturnType<typeof userEvent.setup>,
  itemName: string,
  actionTitle: string,
) {
  await user.click(within(getItemRow(itemName)).getByTitle(actionTitle));
}

function getMovementModal(itemName: string, type: "entrada" | "saída") {
  const title = type === "entrada" ? new RegExp(`entrada — ${itemName}`, "i") : new RegExp(`saída — ${itemName}`, "i");
  return screen.getByRole("heading", { name: title }).closest(".bg-card") as HTMLElement;
}

async function submitMovement(
  user: ReturnType<typeof userEvent.setup>,
  itemName: string,
  type: "entrada" | "saída",
  {
    reason = "Reposição semanal",
    responsible = "@dev.ops",
  }: { reason?: string; responsible?: string } = {},
) {
  const modal = getMovementModal(itemName, type);

  await user.selectOptions(within(modal).getByLabelText(/motivo/i), reason);
  await user.type(within(modal).getByLabelText(/responsável/i), responsible);
  await user.click(within(modal).getByRole("button", { name: /registrar/i }));
}

describe("PipelineCafePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultMocks();
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("renderização e estados da lista", () => {
    it("renderiza cabeçalho e estatísticas do estoque", () => {
      render(<PipelineCafePage />);

      expect(screen.getByRole("heading", { name: /pipeline café/i })).toBeInTheDocument();
      expect(within(screen.getByText("Itens").parentElement!).getByText("03")).toBeInTheDocument();
      expect(within(screen.getByText("Low").parentElement!).getByText("01")).toBeInTheDocument();
    });

    it("exibe erro quando falha ao carregar itens", () => {
      hooksMock.useItems.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error("offline"),
      });

      render(<PipelineCafePage />);

      expect(screen.getByText(/não foi possível carregar os itens/i)).toBeInTheDocument();
    });

    it("exibe loading enquanto carrega itens", () => {
      hooksMock.useItems.mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
      });

      render(<PipelineCafePage />);

      expect(screen.getByText(/moendo os dados do estoque/i)).toBeInTheDocument();
    });

    it("filtra itens por categoria e mostra estado vazio", async () => {
      const user = userEvent.setup();
      render(<PipelineCafePage />);

      await user.selectOptions(screen.getByDisplayValue(/todas as categorias/i), "DEPLOY");

      expect(screen.getByText(/nenhum item nesta categoria/i)).toBeInTheDocument();
    });
  });

  describe("formulário de item", () => {
    it("exibe erro de validação ao enviar formulário sem nome", async () => {
      const user = userEvent.setup();
      render(<PipelineCafePage />);

      await user.click(screen.getByRole("button", { name: /adicionar ao menu/i }));

      expect(await screen.findByText(/nome não pode ser vazio/i)).toBeInTheDocument();
    });

    it("valida quantidade negativa", async () => {
      const user = userEvent.setup();
      render(<PipelineCafePage />);

      await fillItemName(user, "Item inválido");
      const form = getItemForm();
      fireEvent.change(within(form).getByLabelText(/quantidade/i), { target: { value: "-1" } });
      fireEvent.submit(form);

      expect(await screen.findByText(/quantidade não pode ser negativa/i)).toBeInTheDocument();
    });

    it("valida estoque mínimo negativo", async () => {
      const user = userEvent.setup();
      render(<PipelineCafePage />);

      await fillItemName(user, "Item inválido");
      const form = getItemForm();
      fireEvent.change(within(form).getByLabelText(/estoque mínimo/i), { target: { value: "-1" } });
      fireEvent.submit(form);

      expect(await screen.findByText(/estoque mínimo não pode ser negativo/i)).toBeInTheDocument();
    });

    it("cadastra item quando formulário é válido", async () => {
      const user = userEvent.setup();
      const mutateAsync = vi.fn().mockResolvedValue(cafeItemFixture);
      hooksMock.useCreateItem.mockReturnValue({ mutateAsync, isPending: false });

      render(<PipelineCafePage />);

      await fillItemName(user, "Novo Grão");
      await user.selectOptions(screen.getByLabelText(/categoria/i), "SNACK");
      await user.selectOptions(screen.getByLabelText(/unidade/i), "KG");
      await user.type(screen.getByLabelText(/quantidade/i), "5");
      await user.type(screen.getByLabelText(/estoque mínimo/i), "2");
      await user.selectOptions(screen.getByLabelText(/criticidade/i), "HIGH");
      await user.click(screen.getByRole("button", { name: /adicionar ao menu/i }));

      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Novo Grão",
          category: "SNACK",
          unit: "KG",
          quantity: 5,
          minQuantity: 2,
          criticality: "HIGH",
        }),
      );
      expect(await screen.findByText(/cadastrado/i)).toBeInTheDocument();
    });

    it("atualiza item em modo edição", async () => {
      const user = userEvent.setup();
      const mutateAsync = vi.fn().mockResolvedValue(cafeItemFixture);
      hooksMock.useUpdateItem.mockReturnValue({ mutateAsync, isPending: false });

      render(<PipelineCafePage />);

      await clickItemAction(user, cafeItemFixture.name, "Editar");
      expect(screen.getByText(/editar item do cardápio/i)).toBeInTheDocument();

      await fillItemName(user, "Nome Editado");
      await user.click(screen.getByRole("button", { name: /salvar alterações/i }));

      expect(mutateAsync).toHaveBeenCalledWith({
        id: cafeItemFixture.id,
        payload: expect.objectContaining({ name: "Nome Editado" }),
      });
      expect(await screen.findByText(/atualizado/i)).toBeInTheDocument();
    });

    it("cancela edição e volta ao formulário de criação", async () => {
      const user = userEvent.setup();
      render(<PipelineCafePage />);

      await clickItemAction(user, cafeItemFixture.name, "Editar");
      await user.click(screen.getByRole("button", { name: /cancelar/i }));

      expect(screen.getByText(/novo grão no inventário/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /adicionar ao menu/i })).toBeInTheDocument();
    });

    it("exibe erro HttpError ao falhar ao salvar", async () => {
      const user = userEvent.setup();
      const mutateAsync = vi.fn().mockRejectedValue(new HttpError(400, "Payload inválido"));
      hooksMock.useCreateItem.mockReturnValue({ mutateAsync, isPending: false });

      render(<PipelineCafePage />);

      await fillItemName(user, "Falha");
      await user.click(screen.getByRole("button", { name: /adicionar ao menu/i }));

      expect(await screen.findByText(/payload inválido/i)).toBeInTheDocument();
    });

    it("exibe fallback genérico ao falhar ao salvar", async () => {
      const user = userEvent.setup();
      const mutateAsync = vi.fn().mockRejectedValue("erro desconhecido");
      hooksMock.useCreateItem.mockReturnValue({ mutateAsync, isPending: false });

      render(<PipelineCafePage />);

      await fillItemName(user, "Falha");
      await user.click(screen.getByRole("button", { name: /adicionar ao menu/i }));

      expect(await screen.findByText(/falha ao salvar item/i)).toBeInTheDocument();
    });
  });

  describe("ações no cardápio", () => {
    it("remove item após confirmação", async () => {
      const user = userEvent.setup();
      const mutateAsync = vi.fn().mockResolvedValue(undefined);
      hooksMock.useDeleteItem.mockReturnValue({ mutateAsync, isPending: false });
      vi.spyOn(window, "confirm").mockReturnValue(true);

      render(<PipelineCafePage />);

      await clickItemAction(user, cafeItemFixture.name, "Remover");

      expect(mutateAsync).toHaveBeenCalledWith(cafeItemFixture.id);
      expect(await screen.findByText(/removido/i)).toBeInTheDocument();
    });

    it("não remove item quando confirmação é cancelada", async () => {
      const user = userEvent.setup();
      const mutateAsync = vi.fn();
      hooksMock.useDeleteItem.mockReturnValue({ mutateAsync, isPending: false });
      vi.spyOn(window, "confirm").mockReturnValue(false);

      render(<PipelineCafePage />);

      await user.click(screen.getAllByTitle("Remover")[0]);

      expect(mutateAsync).not.toHaveBeenCalled();
    });

    it("exibe erro ao falhar remoção", async () => {
      const user = userEvent.setup();
      const mutateAsync = vi.fn().mockRejectedValue(new Error("delete failed"));
      hooksMock.useDeleteItem.mockReturnValue({ mutateAsync, isPending: false });
      vi.spyOn(window, "confirm").mockReturnValue(true);

      render(<PipelineCafePage />);

      await user.click(screen.getAllByTitle("Remover")[0]);

      expect(await screen.findByText(/delete failed/i)).toBeInTheDocument();
    });
  });

  describe("movimentações", () => {
    it("lista histórico com entradas e saídas", async () => {
      const user = userEvent.setup();
      render(<PipelineCafePage />);

      await user.click(screen.getByRole("button", { name: /movimentações/i }));

      expect(screen.getByText(/histórico de movimentações/i)).toBeInTheDocument();
      expect(screen.getByText("Entrada")).toBeInTheDocument();
      expect(screen.getByText("Saída")).toBeInTheDocument();
      expect(screen.getByText(stockMovementFixture.reason)).toBeInTheDocument();
    });

    it("mostra estado vazio de movimentações", async () => {
      const user = userEvent.setup();
      hooksMock.useAllMovements.mockReturnValue({ movements: [], isLoading: false });

      render(<PipelineCafePage />);
      await user.click(screen.getByRole("button", { name: /movimentações/i }));

      expect(screen.getByText(/nenhuma movimentação ainda/i)).toBeInTheDocument();
    });

    it("mostra loading de movimentações", async () => {
      const user = userEvent.setup();
      hooksMock.useAllMovements.mockReturnValue({ movements: [], isLoading: true });

      render(<PipelineCafePage />);
      await user.click(screen.getByRole("button", { name: /movimentações/i }));

      expect(screen.getByText(/filtrando o histórico/i)).toBeInTheDocument();
    });

    it("registra entrada de estoque no modal", async () => {
      const user = userEvent.setup();
      const mutateAsync = vi.fn().mockResolvedValue(cafeItemFixture);
      hooksMock.useAddStock.mockReturnValue({ mutateAsync, isPending: false });

      render(<PipelineCafePage />);
      await clickItemAction(user, cafeItemFixture.name, "Entrada");
      await submitMovement(user, cafeItemFixture.name, "entrada");

      expect(mutateAsync).toHaveBeenCalledWith({
        id: cafeItemFixture.id,
        payload: {
          quantity: 1,
          reason: "Reposição semanal",
          responsible: "@dev.ops",
        },
      });
      expect(await screen.findByText(/entrada registrada/i)).toBeInTheDocument();
    });

    it("registra saída de estoque no modal", async () => {
      const user = userEvent.setup();
      const mutateAsync = vi.fn().mockResolvedValue(cafeItemFixture);
      hooksMock.useConsumeStock.mockReturnValue({ mutateAsync, isPending: false });

      render(<PipelineCafePage />);
      await clickItemAction(user, cafeItemFixture.name, "Saída");
      expect(screen.getByText(/saída — café de deploy/i)).toBeInTheDocument();

      await submitMovement(user, cafeItemFixture.name, "saída", { reason: "Deploy em produção" });

      expect(mutateAsync).toHaveBeenCalledWith({
        id: cafeItemFixture.id,
        payload: {
          quantity: 1,
          reason: "Deploy em produção",
          responsible: "@dev.ops",
        },
      });
      expect(await screen.findByText(/saída registrada/i)).toBeInTheDocument();
    });

    it("valida campos obrigatórios do modal", async () => {
      const user = userEvent.setup();
      render(<PipelineCafePage />);

      await clickItemAction(user, cafeItemFixture.name, "Entrada");
      const modal = getMovementModal(cafeItemFixture.name, "entrada");
      const movForm = within(modal).getByRole("button", { name: /registrar entrada/i }).closest(
        "form",
      ) as HTMLFormElement;
      movForm.noValidate = true;
      const qtyInput = within(movForm).getByLabelText(/^quantidade$/i);

      fireEvent.change(qtyInput, { target: { value: "0" } });
      fireEvent.submit(movForm);
      expect(await screen.findByText(/quantidade deve ser maior que zero/i)).toBeInTheDocument();

      fireEvent.change(qtyInput, { target: { value: "1" } });
      fireEvent.submit(movForm);
      expect(await screen.findByText(/motivo é obrigatório/i)).toBeInTheDocument();

      await user.selectOptions(within(movForm).getByLabelText(/motivo/i), "Reposição semanal");
      fireEvent.submit(movForm);
      expect(await screen.findByText(/responsável é obrigatório/i)).toBeInTheDocument();
    });

    it("impede saída maior que estoque disponível", async () => {
      const user = userEvent.setup();
      render(<PipelineCafePage />);

      await clickItemAction(user, cafeItemFixture.name, "Saída");
      const modal = getMovementModal(cafeItemFixture.name, "saída");
      const qtyInput = within(modal).getByLabelText(/^quantidade$/i);
      await user.clear(qtyInput);
      await user.type(qtyInput, "999");
      await submitMovement(user, cafeItemFixture.name, "saída", { reason: "Deploy em produção" });

      expect(await screen.findByText(/saída maior que o estoque/i)).toBeInTheDocument();
    });

    it("fecha modal ao cancelar", async () => {
      const user = userEvent.setup();
      render(<PipelineCafePage />);

      await clickItemAction(user, cafeItemFixture.name, "Entrada");
      await user.click(screen.getByRole("button", { name: /cancelar/i }));

      expect(screen.queryByRole("heading", { name: /entrada — café de deploy/i })).not.toBeInTheDocument();
    });

    it("exibe erro ao falhar movimentação", async () => {
      const user = userEvent.setup();
      const mutateAsync = vi.fn().mockRejectedValue(new HttpError(500, "Mov falhou"));
      hooksMock.useAddStock.mockReturnValue({ mutateAsync, isPending: false });

      render(<PipelineCafePage />);
      await clickItemAction(user, cafeItemFixture.name, "Entrada");
      await submitMovement(user, cafeItemFixture.name, "entrada");

      expect(await screen.findByText(/mov falhou/i)).toBeInTheDocument();
    });
  });

  describe("relatórios", () => {
    it("exibe relatórios com itens críticos e mensagens vazias", async () => {
      const user = userEvent.setup();
      render(<PipelineCafePage />);

      await user.click(screen.getByRole("button", { name: /relatórios/i }));

      expect(screen.getByText(/estoque baixo/i)).toBeInTheDocument();
      expect(screen.getByText(lowStockItemFixture.name)).toBeInTheDocument();
      expect(screen.getByText(outOfStockItemFixture.name)).toBeInTheDocument();
      expect(screen.queryByText(/tudo nos conformes/i)).not.toBeInTheDocument();
    });

    it("mostra mensagem vazia quando não há alertas", async () => {
      const user = userEvent.setup();
      setupDefaultMocks([cafeItemFixture]);

      render(<PipelineCafePage />);
      await user.click(screen.getByRole("button", { name: /relatórios/i }));

      expect(screen.getByText(/tudo nos conformes/i)).toBeInTheDocument();
      expect(screen.getByText(/nenhum item zerado/i)).toBeInTheDocument();
    });
  });
});
