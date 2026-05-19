import { useQuery } from "@tanstack/react-query";
import { itemService } from "@/application/items";
import { itemKeys } from "./query-keys";

export const useItem = (id: string | undefined) =>
  useQuery({
    queryKey: id ? itemKeys.detail(id) : [...itemKeys.details(), "noop"],
    queryFn: () => itemService.getById(id as string),
    enabled: Boolean(id),
  });
