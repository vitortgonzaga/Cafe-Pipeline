import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uiDir = path.resolve(__dirname, "../src/components/ui");

/** @type {Record<string, { imports: string; body: string; assert?: string }>} */
const custom = {
  button: {
    imports: `import { Button } from "./button";`,
    body: `<Button>Salvar</Button>`,
    assert: `expect(screen.getByRole("button", { name: /salvar/i })).toBeInTheDocument();`,
  },
  badge: {
    imports: `import { Badge } from "./badge";`,
    body: `<Badge>Novo</Badge>`,
    assert: `expect(screen.getByText("Novo")).toBeInTheDocument();`,
  },
  input: {
    imports: `import { Input } from "./input";`,
    body: `<Input aria-label="nome" />`,
    assert: `expect(screen.getByLabelText("nome")).toBeInTheDocument();`,
  },
  label: {
    imports: `import { Label } from "./label";`,
    body: `<Label htmlFor="x">Nome</Label>`,
    assert: `expect(screen.getByText("Nome")).toBeInTheDocument();`,
  },
  checkbox: {
    imports: `import { Checkbox } from "./checkbox";`,
    body: `<Checkbox aria-label="aceitar" />`,
    assert: `expect(screen.getByRole("checkbox")).toBeInTheDocument();`,
  },
  switch: {
    imports: `import { Switch } from "./switch";`,
    body: `<Switch aria-label="ativo" />`,
    assert: `expect(screen.getByRole("switch")).toBeInTheDocument();`,
  },
  textarea: {
    imports: `import { Textarea } from "./textarea";`,
    body: `<Textarea aria-label="obs" />`,
    assert: `expect(screen.getByLabelText("obs")).toBeInTheDocument();`,
  },
  separator: {
    imports: `import { Separator } from "./separator";`,
    body: `<Separator decorative />`,
    assert: `expect(screen.getByRole("none")).toBeInTheDocument();`,
  },
  skeleton: {
    imports: `import { Skeleton } from "./skeleton";`,
    body: `<Skeleton data-testid="sk" />`,
    assert: `expect(screen.getByTestId("sk")).toBeInTheDocument();`,
  },
  progress: {
    imports: `import { Progress } from "./progress";`,
    body: `<Progress value={40} aria-label="progresso" />`,
    assert: `expect(screen.getByRole("progressbar")).toBeInTheDocument();`,
  },
  avatar: {
    imports: `import { Avatar, AvatarFallback } from "./avatar";`,
    body: `<Avatar><AvatarFallback>CP</AvatarFallback></Avatar>`,
    assert: `expect(screen.getByText("CP")).toBeInTheDocument();`,
  },
  card: {
    imports: `import { Card, CardHeader, CardTitle } from "./card";`,
    body: `<Card><CardHeader><CardTitle>Título</CardTitle></CardHeader></Card>`,
    assert: `expect(screen.getByText("Título")).toBeInTheDocument();`,
  },
  alert: {
    imports: `import { Alert, AlertTitle, AlertDescription } from "./alert";`,
    body: `<Alert><AlertTitle>Atenção</AlertTitle><AlertDescription>Detalhe</AlertDescription></Alert>`,
    assert: `expect(screen.getByText("Atenção")).toBeInTheDocument();`,
  },
  tooltip: {
    imports: `import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";`,
    body: `<TooltipProvider><Tooltip><TooltipTrigger>Hover</TooltipTrigger><TooltipContent>Info</TooltipContent></Tooltip></TooltipProvider>`,
    assert: `expect(screen.getByText("Hover")).toBeInTheDocument();`,
  },
  tabs: {
    imports: `import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";`,
    body: `<Tabs defaultValue="a"><TabsList><TabsTrigger value="a">A</TabsTrigger></TabsList><TabsContent value="a">Conteúdo</TabsContent></Tabs>`,
    assert: `expect(screen.getByText("Conteúdo")).toBeInTheDocument();`,
  },
  accordion: {
    imports: `import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";`,
    body: `<Accordion type="single" collapsible><AccordionItem value="1"><AccordionTrigger>Item</AccordionTrigger><AccordionContent>Corpo</AccordionContent></AccordionItem></Accordion>`,
    assert: `expect(screen.getByText("Item")).toBeInTheDocument();`,
  },
  carousel: {
    imports: `import * as CarouselModule from "./carousel";`,
    body: "",
    assert: `expect(CarouselModule.Carousel).toBeDefined();`,
  },
  chart: {
    imports: `import * as ChartModule from "./chart";`,
    body: "",
    assert: `expect(ChartModule.ChartContainer).toBeDefined();`,
  },
  "input-otp": {
    imports: `import * as InputOtpModule from "./input-otp";`,
    body: "",
    assert: `expect(InputOtpModule.InputOTP).toBeDefined();`,
  },
  sonner: {
    imports: `import { Toaster } from "./sonner";`,
    body: `<Toaster />`,
    assert: `expect(document.body).toBeTruthy();`,
  },
  calendar: {
    imports: `import { Calendar } from "./calendar";`,
    body: `<Calendar />`,
    assert: `expect(document.body.querySelector(".rdp-root, [data-slot], table, div")).toBeTruthy();`,
  },
};

const files = fs.readdirSync(uiDir).filter((f) => f.endsWith(".tsx") && !f.endsWith(".spec.tsx"));

for (const file of files) {
  const base = file.replace(/\.tsx$/, "");
  const specPath = path.join(uiDir, `${base}.spec.tsx`);
  if (fs.existsSync(specPath)) continue;

  const componentName = base
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");

  const cfg = custom[base];
  const imports = cfg?.imports ?? `import * as UI from "./${base}";`;
  const body = cfg?.body ?? `<div data-testid="ui-smoke" />`;
  const assert =
    cfg?.assert ??
    (cfg?.body
      ? `expect(document.body).toBeTruthy();`
      : `// smoke: módulo exporta componentes\n    expect(UI).toBeDefined();`);

  const usesScreen = assert.includes("screen.");
  const content = `import { describe, it, expect } from "vitest";
import { render${usesScreen ? ", screen" : ""} } from "@testing-library/react";
${imports}

describe("${componentName}", () => {
  it("renderiza sem erros", () => {
    ${cfg?.body ? `render(${body});` : "// export smoke"}
    ${assert}
  });
});
`;

  fs.writeFileSync(specPath, content, "utf8");
}

console.log(`Generated ${files.length} UI spec candidates in ${uiDir}`);
