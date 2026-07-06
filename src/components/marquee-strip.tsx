"use client";

import { motion } from "framer-motion";
import {
  SiAnthropic,
  SiClaude,
  SiGooglegemini,
  SiHuggingface,
  SiLangchain,
  SiMistralai,
  SiOllama,
  SiOpenrouter,
  SiPerplexity,
  SiReplicate,
} from "@icons-pack/react-simple-icons";

const tools = [
  { name: "Claude", icon: SiClaude, glow: "from-amber-300/70 via-orange-300/40 to-yellow-300/20" },
  { name: "Anthropic", icon: SiAnthropic, glow: "from-stone-300/70 via-zinc-300/40 to-neutral-300/20" },
  { name: "Gemini", icon: SiGooglegemini, glow: "from-sky-300/70 via-indigo-300/40 to-blue-300/20" },
  { name: "Perplexity", icon: SiPerplexity, glow: "from-emerald-300/70 via-lime-300/35 to-yellow-300/20" },
  { name: "Hugging Face", icon: SiHuggingface, glow: "from-orange-300/70 via-amber-300/40 to-yellow-300/20" },
  { name: "LangChain", icon: SiLangchain, glow: "from-cyan-300/70 via-blue-300/40 to-indigo-300/20" },
  { name: "Mistral AI", icon: SiMistralai, glow: "from-rose-300/70 via-pink-300/40 to-fuchsia-300/20" },
  { name: "Ollama", icon: SiOllama, glow: "from-violet-300/70 via-purple-300/40 to-indigo-300/20" },
  { name: "OpenRouter", icon: SiOpenrouter, glow: "from-teal-300/70 via-cyan-300/40 to-sky-300/20" },
  { name: "Replicate", icon: SiReplicate, glow: "from-fuchsia-300/70 via-violet-300/40 to-indigo-300/20" },
] as const;

const items = [...tools, ...tools];

export function MarqueeStrip() {
  return (
    <section
      aria-label="Works with popular AI tools"
      className="relative overflow-hidden rounded-[1.75rem] border border-indigo-200/70 bg-gradient-to-br from-white/80 via-indigo-50/65 to-sky-50/60 px-4 py-4 shadow-[0_16px_50px_rgba(76,86,180,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-[#05060f]/95 dark:shadow-[0_18px_60px_rgba(3,7,20,0.5)] sm:px-5"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#f8f9ff] via-[#f8f9ff]/90 to-transparent dark:from-[#05060f] dark:via-[#05060f]/85" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#f8f9ff] via-[#f8f9ff]/90 to-transparent dark:from-[#05060f] dark:via-[#05060f]/85" />
      <motion.div
        className="flex w-max items-center gap-3"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 26, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
      >
        {items.map((tool, idx) => (
          <div
            key={`${tool.name}-${idx}`}
            className="group flex min-w-[11rem] items-center gap-3 rounded-2xl border border-indigo-200/75 bg-white/70 px-3.5 py-2.5 shadow-[0_6px_20px_rgba(99,102,241,0.08)] backdrop-blur-sm transition hover:border-indigo-300 hover:bg-white/90 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.08]"
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tool.glow} shadow-[0_0_22px_rgba(148,163,184,0.22)]`}>
              <tool.icon className="h-4 w-4 text-zinc-900 dark:text-white" size={16} />
            </div>
            <span className="text-sm font-medium tracking-[0.01em] text-zinc-700 transition group-hover:text-zinc-950 dark:text-zinc-200 dark:group-hover:text-white">
              {tool.name}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
