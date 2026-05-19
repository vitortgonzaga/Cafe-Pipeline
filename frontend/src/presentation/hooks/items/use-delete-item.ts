import { useMutation, useQueryClient } from "@tanstack/react-query";
import { itemService } from "@/application/items";
import { itemKeys } from "./query-keys";

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => itemService.remove(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      queryClient.removeQueries({ queryKey: itemKeys.detail(id) });
    },
  });
};
