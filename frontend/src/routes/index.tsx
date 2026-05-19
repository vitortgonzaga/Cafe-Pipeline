import { createFileRoute } from "@tanstack/react-router";
import { PipelineCafePage } from "@/presentation/pages/pipeline-cafe-page";

export const Route = createFileRoute("/")({
  component: PipelineCafePage,
});
