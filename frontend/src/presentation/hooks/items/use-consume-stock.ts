import { useMutation, useQueryClient } from "@tanstack/react-query";
import { itemService } from "@/application/items";
import type { MovementOutRequestDTO } from "@/data/items/dto/movement-request.dto";
import { itemKeys } from "./query-keys";

export interface ConsumeStockVariables {
  id: string;
  payload: MovementOutRequestDTO;
}

export const useConsumeStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: ConsumeStockVariables) => itemService.consumeStock(id, payload),
    onSuccess: (item) => {
      void queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: itemKeys.detail(item.id) });
      void queryClient.invalidateQueries({ queryKey: itemKeys.movements(item.id) });
    },
  });
};
