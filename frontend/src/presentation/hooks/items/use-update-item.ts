import { useMutation, useQueryClient } from "@tanstack/react-query";
import { itemService } from "@/application/items";
import type { UpdateItemRequestDTO } from "@/data/items/dto/item-request.dto";
import { itemKeys } from "./query-keys";

export interface UpdateItemVariables {
  id: string;
  payload: UpdateItemRequestDTO;
}

export const useUpdateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateItemVariables) => itemService.update(id, payload),
    onSuccess: (item) => {
      void queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: itemKeys.detail(item.id) });
    },
  });
};
