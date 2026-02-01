"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Star, GitFork, ExternalLink } from "lucide-react";

interface GitHubData {
  stars: number;
  forks: number;
}

function CloudflareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5088 16.8447c.1475-.5068.0908-.9707-.1553-1.2678-.2246-.2699-.5765-.4426-1.008-.4906l-8.4432-.1123c-.0591-.0001-.1182-.0206-.1587-.0613a.2033.2033 0 0 1-.0413-.1704c.0145-.0888.0847-.1573.1728-.1683l8.5182-.1124c.9843-.0645 2.0529-.8916 2.4195-1.8738l.4627-1.2378c.0289-.0767.0242-.1573-.0141-.2256a7.1308 7.1308 0 0 0-6.4389-4.0621c-3.5057 0-6.4629 2.5245-7.0675 5.8558-.3989-.2938-.8893-.4479-1.4201-.4033-1.0252.0863-1.8423.9181-1.9313 1.944-.0218.2508.0003.4954.0587.7248-1.4872.0885-2.6741 1.2924-2.7372 2.7947-.0066.1533.1152.2813.2682.2813h15.5765c.1364.0001.2566-.0892.2966-.222l.2393-.813z" />
      <path d="M19.4058 12.0137c-.0685 0-.1367.0019-.2047.0057-.0554.003-.0921.0537-.0823.1079l.2155 1.1914c.0862.4766.0482.9143-.1041 1.2365-.4916 1.0409-1.5135 1.3235-2.2741 1.3235H9.019c-.1527 0-.2861.1079-.3163.2571l-.3118 1.5482c-.0354.176.0943.3425.2756.3542l8.4864.1011c.4315.0515.7834.2209 1.008.4906.227.2972.2811.7609.1553 1.2678l-.0857.2897-.1531.5194c-.0223.075.0343.1498.1129.1498h2.1762c.8583 0 1.6242-.5683 1.8771-1.3952l.5728-1.8754c.0273-.088.0397-.1786.0371-.2695.0012-.0168.001-.0336.001-.0504 0-2.1207-1.7202-3.8408-3.8409-3.8408l.0001-.0002-.0002.0001z" />
    </svg>
  );
}

export function GitHubStats() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isInView) return;

    async function fetchGitHubData() {
      try {
        const repoRes = await fetch(
          "https://api.github.com/repos/francocanzani/uplight"
        );
        const repoData = await repoRes.json();

        setData({
          stars: repoData.stargazers_count || 0,
          forks: repoData.forks_count || 0,
        });
      } catch (error) {
        setData({
          stars: 0,
          forks: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchGitHubData();
  }, [isInView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="grid md:grid-cols-2 gap-px bg-border/50 ring-1 ring-border/50"
    >
      {/* GitHub Stats */}
      <div className="bg-background p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-full bg-surface ring-1 ring-border/50 flex items-center justify-center">
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium">Open Source</h3>
            <p className="text-sm text-muted-foreground">MIT Licensed</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Fully open source and self-hostable. No vendor lock-in, own your data,
          deploy anywhere.
        </p>

        <div className="flex items-center gap-6">
          {loading ? (
            <div className="flex gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-5 w-12 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <Star className="size-4 text-muted-foreground" />
                <span className="font-mono tabular-nums">{data?.stars || 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GitFork className="size-4 text-muted-foreground" />
                <span className="font-mono tabular-nums">{data?.forks || 0}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cloudflare Deploy */}
      <div className="bg-background p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-full bg-surface ring-1 ring-border/50 flex items-center justify-center">
            <CloudflareIcon className="size-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-medium">One-Click Deploy</h3>
            <p className="text-sm text-muted-foreground">Cloudflare Workers</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Deploy to Cloudflare Workers in seconds. Global edge network, no cold
          starts, generous free tier.
        </p>

        <a
          href="https://deploy.workers.cloudflare.com/?url=https://github.com/francocanzani/uplight"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm px-4 py-2 bg-foreground text-background hover:opacity-90 transition-opacity"
        >
          Deploy to Cloudflare
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    </motion.div>
  );
}
