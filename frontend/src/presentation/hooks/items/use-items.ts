import { useQuery } from "@tanstack/react-query";
import { itemService } from "@/application/items";
import { itemKeys } from "./query-keys";

export const useItems = () =>
  useQuery({
    queryKey: itemKeys.list(),
    queryFn: () => itemService.list(),
  });
