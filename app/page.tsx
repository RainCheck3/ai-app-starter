import {
  ArrowRight,
  CheckCircle2,
  Code2,
  PanelsTopLeft,
  Rocket,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const focusAreas = [
  {
    title: "Product shell",
    description:
      "Routes, metadata, styling, and UI primitives are ready to shape.",
    icon: PanelsTopLeft,
    accent: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  {
    title: "AI-friendly",
    description:
      "Repository guidance keeps agent work scoped, readable, and repeatable.",
    icon: Sparkles,
    accent: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  {
    title: "Launch-minded",
    description:
      "Quality checks and lean defaults keep experiments easy to promote.",
    icon: Rocket,
    accent: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
];

const projectChecklist = [
  "Rename app metadata and package name",
  "Add project-specific environment variables",
  "Choose auth, storage, analytics, and AI services only when needed",
  "Run pnpm check before sharing or deploying",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-border pb-5">
          <div className="flex items-center gap-3 text-sm font-medium">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Code2 className="size-4" aria-hidden="true" />
            </span>
            Web App Starter
          </div>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <CheckCircle2
              className="size-4 text-emerald-600"
              aria-hidden="true"
            />
            Ready for a new product idea
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              Lean Next.js template
            </p>
            <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
              Start with the pieces every serious experiment needs.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              A quiet foundation for dashboards, SaaS ideas, internal tools,
              landing pages, and AI-powered web apps.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="#project-checklist">
                  Review checklist
                  <ArrowRight data-icon="inline-end" className="size-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a
                  href="https://nextjs.org/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Next.js docs
                </a>
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {focusAreas.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-md border border-border bg-card p-5 text-card-foreground shadow-sm"
                >
                  <div className="flex gap-4">
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-md ${item.accent}`}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-base font-semibold">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <section
          id="project-checklist"
          className="border-t border-border py-8"
          aria-labelledby="project-checklist-title"
        >
          <div className="grid gap-6 lg:grid-cols-[0.7fr_1fr]">
            <div>
              <h2
                id="project-checklist-title"
                className="text-xl font-semibold"
              >
                New project checklist
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                A short pass before the template becomes a specific product.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {projectChecklist.map((item) => (
                <li
                  key={item}
                  className="flex min-h-16 items-start gap-3 rounded-md border border-border bg-card p-4 text-sm leading-6 text-card-foreground"
                >
                  <CheckCircle2
                    className="mt-1 size-4 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </section>
    </main>
  );
}
