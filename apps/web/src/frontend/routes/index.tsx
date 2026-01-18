import { createFileRoute, Link } from "@tanstack/react-router";
import { useTeams } from "@/features/teams/api/use-teams";
import { useSession } from "@/lib/auth/client";
import "../index.css";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: session } = useSession();
  const { data: teams } = useTeams();
  const firstTeamId = teams?.[0]?.id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-[#e5e5e5] font-mono antialiased transition-colors">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="text-center mb-8 sm:mb-10 md:mb-12 text-xs text-gray-500 dark:text-[#a0a0a0]">
          Designed By --True Type - {new Date().getFullYear()}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-14 md:mb-16 text-xs text-gray-600 dark:text-[#a0a0a0]">
          <div>
            <div className="text-gray-400 dark:text-[#808080]">Built on Cloudflare</div>
            <div className="mt-1">All Right Reserved ©{new Date().getFullYear()}</div>
          </div>
          <div>
            <div className="text-gray-400 dark:text-[#808080]">Global Monitoring</div>
            <div className="mt-1">9+ Regions</div>
          </div>
          <div>
            <div className="text-gray-400 dark:text-[#808080]">Protocol Support</div>
            <div className="mt-1">HTTP, TCP, DNS</div>
          </div>
          <div>
            <div className="text-gray-400 dark:text-[#808080]">Pricing Tiers</div>
            <div className="mt-1">Free & Premium</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12 sm:mb-14 md:mb-16">
          <div className="flex gap-1 sm:gap-1.5">
            {"UPLIGHT".split("").map((letter, i) => (
              <div
                key={i}
                className="w-8 h-10 sm:w-10 sm:h-12 md:w-14 md:h-16 border border-gray-300 dark:border-[#404040] bg-gray-900 dark:bg-black flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold text-white"
              >
                {letter}
              </div>
            ))}
          </div>
          <span className="text-2xl sm:text-3xl md:text-4xl text-red-500 mx-1">*</span>
          <div className="flex gap-1 sm:gap-1.5">
            {"MONITOR".split("").map((letter, i) => (
              <div
                key={i}
                className="w-8 h-10 sm:w-10 sm:h-12 md:w-14 md:h-16 border border-gray-300 dark:border-[#404040] bg-gray-900 dark:bg-black flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold text-white"
              >
                {letter}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12 text-xs">
          <div>
            <div className="text-gray-400 dark:text-[#808080] mb-2">HTTP, TCP & DNS</div>
            <div className="text-gray-900 dark:text-[#e5e5e5]">
              Monitor websites, APIs, and any TCP service.
            </div>
          </div>
          <div>
            <div className="text-gray-400 dark:text-[#808080] mb-2">Multi Region</div>
            <div className="text-gray-900 dark:text-[#e5e5e5]">
              Monitor from 9+ global regions simultaneously.
            </div>
          </div>
          <div>
            <div className="text-gray-400 dark:text-[#808080] mb-2">Status Pages</div>
            <div className="text-gray-900 dark:text-[#e5e5e5]">
              Communicate incidents effectively with public status pages.
            </div>
          </div>
          <div>
            <div className="text-gray-400 dark:text-[#808080] mb-2">Incident Tracking</div>
            <div className="text-gray-900 dark:text-[#e5e5e5]">
              Automatic detection with full history and resolution tracking.
            </div>
          </div>
          <div>
            <div className="text-gray-400 dark:text-[#808080] mb-2">SSL & Domain</div>
            <div className="text-gray-900 dark:text-[#e5e5e5]">
              Get notified before certificates or domains expire.
            </div>
          </div>
          <div>
            <div className="text-gray-400 dark:text-[#808080] mb-2">Team Collaboration</div>
            <div className="text-gray-900 dark:text-[#e5e5e5]">
              Shared monitors, shared responsibility.
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 text-xs border-t border-gray-300 dark:border-[#404040] pt-6 sm:pt-8 mt-8 sm:mt-10 md:mt-12">
          <div className="flex-1">
            <div className="text-gray-400 dark:text-[#808080] mb-2">[]</div>
            <div className="space-y-1 text-gray-900 dark:text-[#e5e5e5]">
              <div>1 FREE 2 PREMIUM</div>
              <div>3 TEAMS 4 STATUS PAGES</div>
              <div>5 ALERTS</div>
            </div>
          </div>
          <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-300 dark:border-[#404040] pt-6 md:pt-0 md:pl-8">
            <div className="text-gray-400 dark:text-[#808080] mb-2">[]</div>
            <div className="space-y-1 text-gray-900 dark:text-[#e5e5e5]">
              <div>
                Uplight is a contemporary <span className="bg-yellow-200 dark:bg-yellow-600/30 px-1">monitoring</span> platform
              </div>
              <div>
                designed with precision, reliability, and clarity in mind.
              </div>
              <div className="text-gray-400 dark:text-[#808080] mt-2">. . . . . . . . .</div>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12 text-center">
          {session?.user && firstTeamId ? (
            <Link
              to="/$teamId/monitors"
              params={{ teamId: firstTeamId.toString() }}
              className="text-sm text-gray-900 dark:text-[#e5e5e5] hover:text-gray-700 dark:hover:text-white underline underline-offset-4"
            >
              Go to dashboard →
            </Link>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Link
                  to="/signup"
                  className="text-sm text-gray-900 dark:text-[#e5e5e5] hover:text-gray-700 dark:hover:text-white underline underline-offset-4"
                >
                  Get started
                </Link>
              </div>
              <div className="text-xs text-gray-500 dark:text-[#808080]">
                Free to start. No credit card required.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
