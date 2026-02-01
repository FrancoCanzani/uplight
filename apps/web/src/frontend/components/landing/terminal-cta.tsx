"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";

const commands = [
  { text: "npx create-uplight@latest", delay: 0 },
  { text: "cd uplight && bun run deploy", delay: 1000 },
];

export function TerminalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [typedText, setTypedText] = useState<string[]>(
    commands.map(() => "")
  );
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!isInView) return;

    let currentLine = 0;
    let currentChar = 0;
    let timeout: NodeJS.Timeout;

    const typeNextChar = () => {
      if (currentLine >= commands.length) {
        return;
      }

      const command = commands[currentLine];
      if (currentChar === 0) {
        setVisibleLines(currentLine + 1);
      }

      if (currentChar < command.text.length) {
        setTypedText((prev) => {
          const newText = [...prev];
          newText[currentLine] = command.text.slice(0, currentChar + 1);
          return newText;
        });
        currentChar++;
        timeout = setTimeout(typeNextChar, 25 + Math.random() * 25);
      } else {
        currentLine++;
        currentChar = 0;
        if (currentLine < commands.length) {
          timeout = setTimeout(
            typeNextChar,
            commands[currentLine].delay - commands[currentLine - 1].delay - 400
          );
        }
      }
    };

    timeout = setTimeout(typeNextChar, 500);

    return () => clearTimeout(timeout);
  }, [isInView]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="terminal-window rounded-lg overflow-hidden max-w-xl mx-auto"
    >
      <div className="terminal-header px-4 py-3 flex items-center gap-2">
        <div className="terminal-dot bg-red-500/80" />
        <div className="terminal-dot bg-yellow-500/80" />
        <div className="terminal-dot bg-green-500/80" />
        <span className="ml-2 text-xs text-white/40 font-mono">terminal</span>
      </div>

      <div className="p-4 font-mono text-sm">
        {commands.map((command, i) => (
          <div
            key={i}
            className={cn(
              "transition-opacity duration-200",
              i < visibleLines ? "opacity-100" : "opacity-0"
            )}
          >
            <span className="text-green-500">$</span>{" "}
            <span className="text-white/90">{typedText[i]}</span>
            {i === visibleLines - 1 &&
              typedText[i].length < command.text.length && (
                <span
                  className={cn(
                    "inline-block w-2 h-4 bg-white/80 ml-0.5 align-middle",
                    showCursor ? "opacity-100" : "opacity-0"
                  )}
                />
              )}
          </div>
        ))}

        {visibleLines === commands.length &&
          typedText[commands.length - 1] ===
            commands[commands.length - 1].text && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-3 pt-3 border-t border-white/10"
            >
              <span className="text-green-500">Deployed to</span>{" "}
              <span className="text-blue-400 underline">
                uplight.your-domain.workers.dev
              </span>
            </motion.div>
          )}
      </div>
    </motion.div>
  );
}
