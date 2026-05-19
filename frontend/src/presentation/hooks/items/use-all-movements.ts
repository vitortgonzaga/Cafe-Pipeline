import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { itemService } from "@/application/items";
import type { CafeItem } from "@/domain/items/cafe-item";
import type { StockMovement } from "@/domain/items/stock-movement";
import { itemKeys } from "./query-keys";

export interface UseAllMovementsResult {
  movements: StockMovement[];
  isLoading: boolean;
  isError: boolean;
}

export function useAllMovements(items: CafeItem[]): UseAllMovementsResult {
  const queries = useQueries({
    queries: items.map((item) => ({
      queryKey: itemKeys.movements(item.id),
      queryFn: () => itemService.listMovements(item.id),
    })),
  });

  const movements = useMemo<StockMovement[]>(() => {
    const merged = queries.flatMap((result, index) => {
      const data = result.data ?? [];
      const itemName = items[index]?.name;
      return data.map((movement) => ({ ...movement, itemName }));
    });
    return merged.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [queries, items]);

  return {
    movements,
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError),
  };
}
