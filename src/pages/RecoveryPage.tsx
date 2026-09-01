import { useEffect, useState } from "react";
import { ArrowRight, Edit3 } from "lucide-react";
import { useParams } from "react-router-dom";
import { getUsersdetails } from "@/lib/users";
import type { Recoveryuser } from "@/types/users";

const moodClasses: Record<string, string> = {
  elevated:
    "border-[#f37422] text-[#f37422] bg-[rgba(243,116,34,0.08)]",

  good:
    "border-[#4ade80] text-[#4ade80] bg-[rgba(74,222,128,0.08)]",

  stable:
    "border-[#facc15] text-[#facc15] bg-[rgba(250,204,21,0.08)]",

  "low urge":
    "border-[#4ade80] text-[#4ade80] bg-[rgba(74,222,128,0.08)]",

  low:
    "border-[#ef4444] text-[#ef4444] bg-[rgba(239,68,68,0.08)]",
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
      className={`rounded-full border px-[10px] py-[4px] font-['JetBrains_Mono'] text-[10px] font-bold ${
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
    <div className="rounded-[8px] border border-[var(--app-border)] bg-[var(--app-surface)] px-[14px] py-[13px]">
      <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[var(--app-muted)]">
        {label}
      </p>

      <p
        className={`mt-[7px] font-['Figtree'] text-[28px] font-bold leading-none ${
          orange
            ? "text-[#f37422]"
            : "text-[var(--app-text)]"
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
    <div className="relative flex-1 rounded-[10px] border border-[var(--app-border)] bg-[var(--app-surface)] px-[17px] py-[15px]">
      <div className="flex justify-between items-center">
        <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[var(--app-muted)]">
          {label}
        </span>

        <span
          className={`h-[8px] w-[8px] rounded-full ${dot}`}
        />
      </div>

      <div className="mt-[14px] flex items-end justify-between">
        <span className="font-['Figtree'] text-[28px] font-bold leading-none text-[var(--app-text)]">
          {value}

          <small className="ml-[3px] text-[12px] font-normal text-[var(--app-muted)]">
            /10
          </small>
        </span>

        <svg
          viewBox="0 0 50 22"
          className="h-[22px] w-[50px]"
        >
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
  const safeScore =
    score === null
      ? 0
      : Math.min(100, Math.max(0, score));

  const arcLength = 173;
  const filledLength =
    (safeScore / 100) * arcLength;

  const spectrumLabel =
    getSpectrumLabel(score);

  const spectrumColor =
    getSpectrumColor(score);

  return (
    <div className="flex h-full flex-col items-center justify-between px-[22px] py-[20px]">

      <div className="flex w-full justify-between">
        <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[var(--app-muted)]">
          Relapse Spectrum
        </span>

        <span
          className="font-['JetBrains_Mono'] text-[10px] font-bold"
          style={{
            color: spectrumColor,
          }}
        >
          {score !== null
            ? `${Math.round(score)}/100`
            : "—"}
        </span>
      </div>

      <div className="relative h-[150px] w-[210px]">
        <svg
          viewBox="0 0 170 105"
          className="h-full w-full"
        >
          <defs>
            <linearGradient
              id="recoveryGauge"
              x1="0%"
              x2="100%"
            >
              <stop
                offset="0%"
                stopColor="#ef4444"
              />

              <stop
                offset="55%"
                stopColor="#f59e0b"
              />

              <stop
                offset="100%"
                stopColor="#4ade80"
              />
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

        <div className="absolute inset-x-0 bottom-[8px] text-center">

          <div className="font-['Figtree'] text-[36px] font-bold leading-none text-[var(--app-text)]">
            {score !== null
              ? Math.round(score)
              : "—"}
          </div>

          <div
            className="mt-[5px] font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-wider"
            style={{
              color: spectrumColor,
            }}
          >
            {spectrumLabel}
          </div>

        </div>
      </div>

      <p className="max-w-[260px] text-center font-['Figtree'] text-[13px] leading-[1.45] text-[var(--app-muted)]">
        Higher scores imply increased vulnerability.
        Immediate counseling check-in advised.
      </p>
    </div>
  );
}

function formatCheckInDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    },
  );
}

export function RecoveryPage() {
  const { userId } =
    useParams<{ userId: string }>();

  const [user, setUser] =
    useState<Recoveryuser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError("User ID is missing.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadRecoveryUser =
      async () => {
        try {
          setLoading(true);
          setError(null);

          const response =
            await getUsersdetails(userId);

          if (!cancelled) {
            setUser(response);
          }
        } catch (err) {
          if (!cancelled) {
            setError(
              err instanceof Error
                ? err.message
                : "Unable to load recovery profile.",
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    loadRecoveryUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-[var(--app-bg)] text-[var(--app-muted)]">
        <span className="font-['JetBrains_Mono'] text-[12px] uppercase">
          Loading recovery profile...
        </span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-[var(--app-bg)] text-[#ef4444]">
        <span className="font-['JetBrains_Mono'] text-[12px] uppercase">
          {error ||
            "Unable to load recovery profile."}
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

  const relapseScore =
    user.relapse_spectrum?.score ?? null;

  return (
    <div className="min-h-full flex-1 overflow-y-auto bg-[var(--app-bg)] text-[var(--app-text)] transition-colors duration-200">

      <div className="mx-auto flex max-w-[1200px] flex-col gap-[24px] p-[24px] lg:p-[32px]">

        {/* HEADER */}

        <header>
  <div className="flex min-h-[72px] items-center justify-between">

    <div>
      {/* SAME STYLE AS TREATMENT PLAN / GOALS */}
       <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#f37422]">
              USERS &gt; RECOVRERY PROFILE
            </span>

      {/* FULL USER NAME */}
      <h1 className="mt-[5px] font-['Figtree'] text-[28px] font-bold leading-tight text-[var(--app-text)]">
        {user.full_name}
      </h1>

      {/* EMAIL + STATUS */}
      <p className="mt-[7px] font-['Figtree'] text-[13px] text-[var(--app-muted)]">
        {user.email}
        {" · "}
        <span
          className={
            user.is_active
              ? "text-[#4ade80]"
              : "text-[#ef4444]"
          }
        >
          {user.is_active
            ? "Active"
            : "Inactive"}
        </span>
        {" · Assigned to "}
        {user.counselor || "Unassigned"}
      </p>
    </div>



  </div>
</header>

        {/* PROFILE + RELAPSE */}

        <section className="grid gap-[16px] lg:grid-cols-[minmax(0,1fr)_300px]">

          {/* PROFILE CARD */}

          <div className="rounded-[12px] border border-[var(--app-border)] bg-[var(--app-surface)] p-[20px]">

            <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-[18px]">

              <div className="flex items-center gap-[14px]">

                <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[13px] bg-[var(--app-hover)] font-['Figtree'] text-[18px] font-bold text-[var(--app-muted)]">
                  {initials}
                </div>

                <div>

                  <p className="font-['Figtree'] text-[18px] font-bold text-[var(--app-text)]">
                    {user.full_name}
                  </p>

                  <p className="mt-[4px] font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[var(--app-muted)]">
                    Primary: Alcohol
                  </p>

                </div>

              </div>

              <div className="flex gap-[8px]">

                <Pill>
                  {user.is_active
                    ? "ACTIVE"
                    : "INACTIVE"}
                </Pill>

                {relapseScore !== null &&
                  relapseScore >= 50 && (
                    <Pill orange>
                      ELEVATED RISK
                    </Pill>
                  )}

              </div>

            </div>

            {/* METRICS */}

            <div className="mt-[20px] grid gap-[12px] sm:grid-cols-3">

              <Metric
                label="Days sober"
                value={`${user.days_sober}d`}
                orange
              />

              <Metric
                label="Current streak"
                value="—"
              />

              <Metric
                label="Check-in rate"
                value="—"
                orange
              />

            </div>

            {/* DETAILS */}

            <div className="mt-[20px] grid gap-[12px] sm:grid-cols-2">

              <div className="flex justify-between text-[13px] sm:justify-start sm:gap-[16px]">

                <span className="text-[var(--app-muted)]">
                  Sobriety Date
                </span>

                <b className="font-['Figtree'] font-medium text-[var(--app-text)]">
                  {user.sobriety_date || "—"}
                </b>

              </div>

              <div className="flex justify-between text-[13px] sm:justify-end sm:gap-[16px]">

                <span className="text-[var(--app-muted)]">
                  Counselor
                </span>

                <b className="font-['Figtree'] font-medium text-[var(--app-text)]">
                  {user.counselor ||
                    "Unassigned"}
                </b>

              </div>

              <div className="flex justify-between text-[13px] sm:justify-start sm:gap-[16px]">

                <span className="text-[var(--app-muted)]">
                  Session Mode
                </span>

                <b className="font-['Figtree'] font-medium text-[var(--app-text)]">
                  {user.session_mode || "—"}
                </b>

              </div>

            </div>

          </div>

          {/* RELAPSE SPECTRUM */}

          <div className="rounded-[12px] border border-[var(--app-border)] bg-[var(--app-surface)]">
            <Gauge score={relapseScore} />
          </div>

        </section>

        {/* DOMAIN HEALTH SCORES */}

        <section>

          <div className="mb-[10px] flex items-center gap-[9px]">

            <span className="h-[18px] w-[3px] bg-[#F37422]" />

            <span className="font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-wider text-[var(--app-muted)]">
              Domain Health Scores
            </span>

          </div>

          <div className="flex flex-col gap-[12px] md:flex-row">

            <ScoreCard
              label="Body"
              value="7.2"
              dot="bg-[#f37422]"
            />

            <ScoreCard
              label="Mind"
              value="6.8"
              dot="bg-[#facc15]"
            />

            <ScoreCard
              label="Spirit"
              value="8.1"
              dot="bg-[#4ade80]"
            />

            <ScoreCard
              label="Life"
              value="5.9"
              dot="bg-[#ef4444]"
            />

          </div>

        </section>

        {/* RECENT CHECK-INS */}

        <section className="rounded-[12px] border border-[var(--app-border)] bg-[var(--app-surface)]">

          <div className="flex items-center justify-between border-b border-[var(--app-border)] px-[20px] py-[16px]">

            <h2 className="font-['Figtree'] text-[18px] font-bold">
              Recent Check-Ins (Last 7 Days)
            </h2>

            <button className="flex items-center gap-[6px] font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-wider text-[#f37422]">
              View chronology
              <ArrowRight size={13} />
            </button>

          </div>

          <div className="overflow-x-auto">

            <div className="min-w-[900px]">

              {/* TABLE HEADER */}

              <div className="grid grid-cols-[90px_140px_90px_minmax(0,1fr)] border-b border-[var(--app-border)] px-[20px] py-[11px]">

                {[
                  "DATE",
                  "MOOD / URGE",
                  "SCORE",
                  "NOTES SNIPPET",
                ].map((heading) => (
                  <span
                    key={heading}
                    className="font-['JetBrains_Mono'] text-[9px] font-bold uppercase tracking-wider text-[var(--app-muted)]"
                  >
                    {heading}
                  </span>
                ))}

              </div>

              {/* TABLE ROWS */}

              {user.checkins.length === 0 ? (
                <div className="px-[20px] py-[28px] text-center font-['JetBrains_Mono'] text-[10px] uppercase text-[var(--app-muted)]">
                  No completed check-ins
                </div>
              ) : (
                user.checkins.map((row) => {
                const mood = row.mood?.label?.toLowerCase() ?? "—";

                  return (
                    <div
                      key={row.id}
                      className="grid grid-cols-[90px_140px_90px_minmax(0,1fr)] items-center border-b border-[var(--app-border)] px-[20px] py-[13px] last:border-b-0"
                    >

                      <span className="font-['Figtree'] text-[13px] text-[var(--app-text)]">
                        {formatCheckInDate(
                          row.date,
                        )}
                      </span>

                      <span
                        className={`w-fit rounded-full border px-[9px] py-[3px] font-['JetBrains_Mono'] text-[9px] font-bold ${
                          moodClasses[mood] ||
                          "border-[var(--app-border)] text-[var(--app-muted)]"
                        }`}
                      >
                        • {mood === "—" ? "—" : mood.toUpperCase()}
                      </span>

                      <span className="font-['JetBrains_Mono'] text-[11px] font-bold">
                        {row.mood?.score ?? "—"}/10
                      </span>

                      <span className="truncate font-['Figtree'] text-[13px] text-[var(--app-muted)]">
                        {row.notes_snippet || "—"}
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