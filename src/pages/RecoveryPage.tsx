import { useEffect, useState } from "react";
import { ArrowRight, Edit3 } from "lucide-react";
import { useParams } from "react-router-dom";
import { getUsersdetails } from "@/lib/users";
import type { Recoveryuser } from "@/types/users";

const moodClasses: Record<string, string> = {
  ELEVATED: "border-[#f37422] text-[#f37422] bg-[rgba(243,116,34,0.08)]",
  GOOD: "border-[#4ade80] text-[#4ade80] bg-[rgba(74,222,128,0.08)]",
  STABLE: "border-[#facc15] text-[#facc15] bg-[rgba(250,204,21,0.08)]",
  "LOW URGE": "border-[#4ade80] text-[#4ade80] bg-[rgba(74,222,128,0.08)]",
};

function Pill({
  children,
  orange = false,
}: {
  children: React.ReactNode;
  orange?: boolean;
}) {
  return (
    <span
      className={`rounded-full border px-[9px] py-[3px] font-['JetBrains_Mono'] text-[8px] font-bold ${
        orange
          ? "border-[#f37422] text-[#f37422]"
          : "border-[#4ade80] text-[#4ade80]"
      }`}
    >
      {children}
    </span>
  );
}

function Metric({
  label,
  value,
  orange = false,
}: {
  label: string;
  value: string;
  orange?: boolean;
}) {
  return (
    <div className="rounded-[6px] border border-[var(--app-border)] bg-[#090909] px-[10px] py-[10px]">
      <p className="font-['JetBrains_Mono'] text-[7px] uppercase text-[var(--app-muted)]">
        {label}
      </p>
      <p
        className={`mt-[5px] font-['Figtree'] text-[21px] font-bold leading-none ${
          orange ? "text-[#f37422]" : "text-[var(--app-text)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  dot,
}: {
  label: string;
  value: string;
  dot: string;
}) {
  return (
    <div className="relative flex-1 rounded-[10px] border border-[var(--app-border)] bg-[var(--app-surface)] px-[13px] py-[12px]">
      <div className="flex justify-between">
        <span className="font-['JetBrains_Mono'] text-[7px] uppercase text-[var(--app-muted)]">
          {label}
        </span>
        <span className={`h-[7px] w-[7px] rounded-full ${dot}`} />
      </div>
      <div className="mt-[12px] flex items-end justify-between">
        <span className="font-['Figtree'] text-[22px] font-bold text-[var(--app-text)]">
          {value}
          <small className="ml-[2px] text-[9px] font-normal text-[var(--app-muted)]">
            /10
          </small>
        </span>
        <svg viewBox="0 0 50 22" className="h-[22px] w-[50px]">
          <polyline
            points="1,19 12,14 23,5 34,10 44,3 50,5"
            fill="none"
            stroke="#f37422"
            strokeWidth="1.2"
          />
        </svg>
      </div>
    </div>
  );
}

function getSpectrumLabel(score: number | null) {
  if (score === null) return "NO DATA";
  if (score >= 70) return "ELEVATED";
  if (score >= 40) return "MODERATE";
  return "LOW";
}

function getSpectrumColor(score: number | null) {
  if (score === null) return "#a69e92";
  if (score >= 70) return "#f37422";
  if (score >= 40) return "#f59e0b";
  return "#4ade80";
}

function Gauge({ score }: { score: number | null }) {
  const safeScore = score === null ? 0 : Math.min(100, Math.max(0, score));
  const arcLength = 173;
  const filledLength = (safeScore / 100) * arcLength;
  const spectrumLabel = getSpectrumLabel(score);
  const spectrumColor = getSpectrumColor(score);

  return (
    <div className="flex h-full flex-col items-center justify-between px-[18px] py-[17px]">
      <div className="flex w-full justify-between">
        <span className="font-['JetBrains_Mono'] text-[7px] uppercase text-[var(--app-muted)]">
          Relapse spectrum
        </span>
        <span
          className="font-['JetBrains_Mono'] text-[7px] font-bold"
          style={{ color: spectrumColor }}
        >
          {score !== null ? `${Math.round(score)}/100` : "—"}
        </span>
      </div>

      <div className="relative h-[120px] w-[170px]">
        <svg viewBox="0 0 170 105" className="h-full w-full">
          <defs>
            <linearGradient id="recoveryGauge" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="55%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#4ade80" />
            </linearGradient>
          </defs>

          <path
            d="M30 82 A55 55 0 0 1 140 82"
            fill="none"
            stroke="#292929"
            strokeWidth="11"
            strokeLinecap="butt"
          />

          <path
            d="M30 82 A55 55 0 0 1 140 82"
            fill="none"
            stroke="url(#recoveryGauge)"
            strokeWidth="11"
            strokeLinecap="butt"
            strokeDasharray={`${filledLength} ${arcLength}`}
          />
        </svg>

        <div className="absolute inset-x-0 bottom-[7px] text-center">
          <div className="font-['Figtree'] text-[28px] font-bold leading-none text-[var(--app-text)]">
            {score !== null ? Math.round(score) : "—"}
          </div>
          <div
            className="mt-[3px] font-['JetBrains_Mono'] text-[7px] font-bold uppercase"
            style={{ color: spectrumColor }}
          >
            {spectrumLabel}
          </div>
        </div>
      </div>

      <p className="max-w-[235px] text-center font-['Figtree'] text-[9px] leading-[1.45] text-[var(--app-muted)]">
        Higher scores imply increased vulnerability. Immediate counseling
        check-in advised.
      </p>
    </div>
  );
}

function formatCheckInDate(date: string) {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function normalizeMood(mood: string | null) {
  if (!mood) return "—";

  const normalizedMood = mood.trim().toLowerCase();

  if (
    normalizedMood.includes("elevated") ||
    normalizedMood.includes("depressed") ||
    normalizedMood.includes("anxious") ||
    normalizedMood.includes("not feeling good")
  ) {
    return "ELEVATED";
  }

  if (
    normalizedMood.includes("low urge") ||
    normalizedMood.includes("low_urge")
  ) {
    return "LOW URGE";
  }

  if (normalizedMood.includes("stable")) return "STABLE";

  if (
    normalizedMood.includes("good") ||
    normalizedMood.includes("feeling good")
  ) {
    return "GOOD";
  }

  return normalizedMood.toUpperCase();
}

export function RecoveryPage() {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<Recoveryuser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError("User ID is missing.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadRecoveryUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getUsersdetails(userId);

        if (!cancelled) setUser(response);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load recovery profile.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadRecoveryUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-[#070707] text-[var(--app-muted)]">
        <span className="font-['JetBrains_Mono'] text-[10px] uppercase">
          Loading recovery profile...
        </span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-[#070707] text-[#ef4444]">
        <span className="font-['JetBrains_Mono'] text-[10px] uppercase">
          {error || "Unable to load recovery profile."}
        </span>
      </div>
    );
  }

  const initials = user.full_name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const relapseScore = user.relapse_spectrum?.score ?? null;

  return (
    <div className="min-h-full flex-1 overflow-y-auto bg-[#070707] text-[var(--app-text)]">
      <div className="flex max-w-[1400px] flex-col gap-[14px] p-[16px] lg:p-[18px]">
        <header>
          <div className="flex min-h-[62px] items-center justify-between">
            <div>
              <p className="font-['JetBrains_Mono'] text-[8px] font-bold uppercase text-[#F37422]">
                USERS &gt; RECOVERY PROFILE
              </p>
              <h1 className="mt-[4px] font-['Figtree'] text-[23px] font-bold">
                {user.full_name}
              </h1>
              <p className="mt-[6px] font-['JetBrains_Mono'] text-[8px] text-[var(--app-muted)]">
                {user.email} ·{" "}
                <span
                  className={
                    user.is_active ? "text-[#4ade80]" : "text-[#ef4444]"
                  }
                >
                  {user.is_active ? "ACTIVE" : "INACTIVE"}
                </span>{" "}
                · Assigned to {user.counselor || "Unassigned"}
              </p>
            </div>

            <button className="flex items-center gap-[6px] rounded-[8px] border border-[var(--app-border)] bg-[var(--app-surface)] px-[13px] py-[8px] font-['Figtree'] text-[10px] font-semibold hover:border-[#f37422]">
              <Edit3 size={12} />
              Edit Profile
            </button>
          </div>
        </header>

        <section className="grid gap-[8px] lg:grid-cols-[minmax(0,1fr)_285px]">
          <div className="rounded-lg border border-[#F4EDE314] bg-[#15110E] p-[17px]">
            <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-[15px]">
              <div className="flex items-center gap-[13px]">
                <div className="flex h-[45px] w-[45px] items-center justify-center rounded-[13px] bg-[#2a2824] font-['Figtree'] text-[14px] font-bold text-[#a69e92]">
                  {initials}
                </div>
                <div>
                  <p className="font-['Figtree'] text-[14px] font-bold text-[#f4ede3]">
                    {user.full_name}
                  </p>
                  <p className="mt-[3px] font-['JetBrains_Mono'] text-[8px] text-[var(--app-muted)]">
                    Primary: Alcohol
                  </p>
                </div>
              </div>

              <div className="flex gap-[7px]">
                <Pill>{user.is_active ? "ACTIVE" : "INACTIVE"}</Pill>
                {relapseScore !== null && relapseScore >= 50 && (
                  <Pill orange>ELEVATED RISK</Pill>
                )}
              </div>
            </div>

            <div className="mt-[17px] grid gap-[9px] sm:grid-cols-3">
              <Metric label="Days sober" value={`${user.days_sober}d`} orange />
              <Metric label="Current streak" value="—" />
              <Metric label="Check-in rate" value="—" orange />
            </div>

            <div className="mt-[15px] grid gap-[7px] sm:grid-cols-2">
              <div className="flex justify-between text-[10px] sm:justify-start sm:gap-[12px]">
                <span className="text-[var(--app-muted)]">Sobriety Date</span>
                <b className="font-medium text-[#f4ede3]">
                  {user.sobriety_date || "—"}
                </b>
              </div>

              <div className="flex justify-between text-[10px] sm:justify-end sm:gap-[12px]">
                <span className="text-[var(--app-muted)]">Counselor</span>
                <b className="font-medium text-[#f4ede3]">
                  {user.counselor || "Unassigned"}
                </b>
              </div>

              <div className="flex justify-between text-[10px] sm:justify-start sm:gap-[12px]">
                <span className="text-[var(--app-muted)]">Session Mode</span>
                <b className="font-medium text-[#f4ede3]">
                  {user.session_mode || "—"}
                </b>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#F4EDE314] bg-[#15110E]">
            <Gauge score={relapseScore} />
          </div>
        </section>

        <section>
          <div className="mb-[8px] flex items-center gap-[8px]">
            <span className="h-[15px] w-[2px] bg-[#F37422]" />
            <span className="font-['JetBrains_Mono'] text-[8px] uppercase text-[var(--app-muted)]">
              Domain health scores
            </span>
          </div>

          <div className="flex flex-col gap-[8px] md:flex-row">
            <ScoreCard label="Body" value="7.2" dot="bg-[#f37422]" />
            <ScoreCard label="Mind" value="6.8" dot="bg-[#facc15]" />
            <ScoreCard label="Spirit" value="8.1" dot="bg-[#4ade80]" />
            <ScoreCard label="Life" value="5.9" dot="bg-[#ef4444]" />
          </div>
        </section>

        <section className="rounded-lg border border-[#F4EDE314] bg-[#15110E]">
          <div className="flex items-center justify-between border-b border-[var(--app-border)] px-[17px] py-[14px]">
            <h2 className="font-['Figtree'] text-[13px] font-bold">
              Recent Check-Ins (Last 7 Days)
            </h2>

            <button className="flex items-center gap-[5px] font-['JetBrains_Mono'] text-[8px] font-bold uppercase text-[#f37422]">
              View chronology
              <ArrowRight size={11} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[70px_115px_75px_minmax(0,1fr)] border-b border-[var(--app-border)] px-[17px] py-[9px]">
                {["DATE", "MOOD / URGE", "SCORE", "NOTES SNIPPET"].map(
                  (heading) => (
                    <span
                      key={heading}
                      className="font-['JetBrains_Mono'] text-[7px] uppercase text-[var(--app-muted)]"
                    >
                      {heading}
                    </span>
                  ),
                )}
              </div>

              {user.checkins.length === 0 ? (
                <div className="px-[17px] py-[22px] text-center font-['JetBrains_Mono'] text-[8px] uppercase text-[var(--app-muted)]">
                  No completed check-ins
                </div>
              ) : (
                user.checkins.map((row) => {
                  const mood = normalizeMood(row.mood);

                  return (
                    <div
                      key={row.id}
                      className="grid grid-cols-[70px_115px_75px_minmax(0,1fr)] items-center border-b border-[var(--app-border)] px-[17px] py-[10px] last:border-b-0"
                    >
                      <span className="text-[10px]">
                        {formatCheckInDate(row.date)}
                      </span>

                      <span
                        className={`w-fit rounded-full border px-[8px] py-[2px] font-['JetBrains_Mono'] text-[7px] font-bold ${
                          moodClasses[mood] ||
                          "border-[var(--app-border)] text-[var(--app-muted)]"
                        }`}
                      >
                        • {mood}
                      </span>

                      <span className="font-['JetBrains_Mono'] text-[9px] font-bold">
                        —
                      </span>

                      <span className="truncate text-[9px] text-[var(--app-muted)]">
                        —
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default RecoveryPage;
