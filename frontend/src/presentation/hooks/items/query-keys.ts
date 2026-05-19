export const itemKeys = {
  all: ["items"] as const,
  lists: () => [...itemKeys.all, "list"] as const,
  list: () => [...itemKeys.lists()] as const,
  details: () => [...itemKeys.all, "detail"] as const,
  detail: (id: string) => [...itemKeys.details(), id] as const,
  movements: (id: string) => [...itemKeys.detail(id), "movements"] as const,
};
