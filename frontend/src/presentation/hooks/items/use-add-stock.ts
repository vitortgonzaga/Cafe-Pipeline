import { useMutation, useQueryClient } from "@tanstack/react-query";
import { itemService } from "@/application/items";
import type { MovementInRequestDTO } from "@/data/items/dto/movement-request.dto";
import { itemKeys } from "./query-keys";

export interface AddStockVariables {
  id: string;
  payload: MovementInRequestDTO;
}

export const useAddStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: AddStockVariables) => itemService.addStock(id, payload),
    onSuccess: (item) => {
      void queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: itemKeys.detail(item.id) });
      void queryClient.invalidateQueries({ queryKey: itemKeys.movements(item.id) });
    },
  });
};
