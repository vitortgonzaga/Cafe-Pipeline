import { useMutation, useQueryClient } from "@tanstack/react-query";
import { itemService } from "@/application/items";
import type { CreateItemRequestDTO } from "@/data/items/dto/item-request.dto";
import { itemKeys } from "./query-keys";

export const useCreateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateItemRequestDTO) => itemService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
};
