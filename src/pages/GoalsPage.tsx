// src/pages/GoalsPage.tsx

import { useEffect, useState } from "react";
import { Activity, Brain, Compass, Home, Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import {
  getPatientGoals,
  updatePatientGoals,
  type ApiGoalsResponse,
} from "@/lib/goals";
import { getUser } from "@/lib/users";
import { useAppContext } from "@/app/app-context";

interface GoalsStructure {
  body: string;
  mind: string;
  spirit: string;
  life: string;
  actions: Record<"body" | "mind" | "spirit" | "life", string[]>;
}

const EMPTY_GOALS: GoalsStructure = {
  body: "",
  mind: "",
  spirit: "",
  life: "",
  actions: { body: [""], mind: [""], spirit: [""], life: [""] },
};

const MAX_PERSONALIZED_GOAL_LENGTH = 60;

function cleanPatientName(name: string, email: string): string {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  if (!trimmedName || !trimmedEmail) return trimmedName;
  const escapedEmail = trimmedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return trimmedName.replace(new RegExp(`\\s*[<(]?${escapedEmail}\\s*[>)]?$`, "i"), "").trim();
}

const PILLAR_CONFIG = {
  body: {
    title: "Body",
    icon: Activity,
    borderColor: "border-[#f37422]/60 dark:border-[#f37422]",
    badgeBg: "bg-[#f37422]/10 dark:bg-[#f37422]/20",
    badgeText: "text-[#d95d0e] dark:text-[#f37422]",
    accentHex: "#f37422",
  },

  mind: {
    title: "Mind",
    icon: Brain,
    borderColor: "border-[#6b8ab0]/60 dark:border-[#6b8ab0]",
    badgeBg: "bg-[#6b8ab0]/10 dark:bg-[#6b8ab0]/20",
    badgeText: "text-[#4a698e] dark:text-[#6b8ab0]",
    accentHex: "#6b8ab0",
  },

  spirit: {
    title: "Spirit",
    icon: Compass,
    borderColor: "border-[#c084fc]/60 dark:border-[#c084fc]",
    badgeBg: "bg-[#c084fc]/10 dark:bg-[#c084fc]/20",
    badgeText: "text-[#9333ea] dark:text-[#c084fc]",
    accentHex: "#c084fc",
  },

  life: {
    title: "Life",
    icon: Home,
    borderColor: "border-[#eab308]/60 dark:border-[#facc15]",
    badgeBg: "bg-[#facc15]/15 dark:bg-[#facc15]/20",
    badgeText: "text-[#ca8a04] dark:text-[#facc15]",
    accentHex: "#ca8a04",
  },
};

export function GoalsPage({
  patientId: patientIdProp,
}: {
  patientId?: string;
}) {
  /**
   * We support both:
   *
   * 1. <GoalsPage patientId="..."/>
   *
   * 2. Route such as /goals/:patientId
   *
   * This prevents the page from depending on TreatmentPlan.
   */
  const params = useParams<{
    patientId?: string;
    userId?: string;
    id?: string;
  }>();

  const patientId =
    patientIdProp ||
    params.patientId ||
    params.userId ||
    params.id;
  const navigate = useNavigate();
  const { bumpDataRefreshVersion } = useAppContext();
  const [goals, setGoals] = useState<GoalsStructure>(EMPTY_GOALS);

  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientActive, setPatientActive] = useState(true);
  const [counselorName, setCounselorName] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  /**
   * Load goals for the selected patient.
   */
  useEffect(() => {
    if (!patientId) {
      setError("Patient ID is missing.");
      return;
    }

    let cancelled = false;

    // User identity is independent of whether any goals have been created.
    getUser(patientId)
      .then((user) => {
        if (!cancelled) {
          setPatientName(user.full_name || "");
          setPatientEmail(user.email || "");
          setPatientActive(user.is_active);
          setCounselorName(
            typeof user.counselor === "string"
              ? user.counselor
              : user.counselor?.full_name || user.counselor?.name || "",
          );
        }
      })
      .catch(() => {});

    setLoading(true);
    setError(null);

    getPatientGoals(patientId)
      .then((response: ApiGoalsResponse) => {
        if (cancelled) return;

        /**
         * Patient information
         */
        if (Array.isArray(response)) {
          // The goals endpoint returns one record per category. Patient details
          // are repeated on every record, so use the first record as metadata.
          const patient = response[0];
          setIsEditing(response.length === 0);
          if (patient?.patient_name) setPatientName(patient.patient_name);
          if (patient?.patient_email) setPatientEmail(patient.patient_email);

          const objectives = response.reduce<Record<string, string>>((result, goal) => {
            result[goal.category] = goal.objective || "";
            return result;
          }, {});

          const actions = response.reduce<Record<string, string[]>>((result, goal) => {
            result[goal.category] = Array.isArray(goal.actions) && goal.actions.length > 0 ? goal.actions : [""];
            return result;
          }, {});

          setGoals({
            body: objectives.body || "",
            mind: objectives.mind || "",
            spirit: objectives.recovery || objectives.spirit || "",
            life: objectives.life || "",
            actions: {
              body: actions.body || [""],
              mind: actions.mind || [""],
              spirit: actions.recovery || actions.spirit || [""],
              life: actions.life || [""],
            },
          });
          return;
        }

        if (response.patient_name) setPatientName(response.patient_name);
        if (response.patient_email) setPatientEmail(response.patient_email);
        setIsEditing(false);

        /**
         * Load actual database goals.
         *
         * Backend category:
         *
         * body
         * mind
         * recovery
         * life
         *
         * Admin UI category:
         *
         * Body
         * Mind
         * Spirit
         * Life
         */
        setGoals({
          body: response.body?.objective || "",
          mind: response.mind?.objective || "",
          spirit: response.recovery?.objective || response.spirit?.objective || "",
          life: response.life?.objective || "",
          actions: {
            body: response.body?.actions?.length ? response.body.actions : [""],
            mind: response.mind?.actions?.length ? response.mind.actions : [""],
            spirit: response.recovery?.actions?.length
              ? response.recovery.actions
              : response.spirit?.actions?.length
                ? response.spirit.actions
                : [""],
            life: response.life?.actions?.length ? response.life.actions : [""],
          },
        });
      })
      .catch((err) => {
        if (cancelled) return;

        setError(
          err instanceof ApiError
            ? err.message
            : "Failed to load goals."
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [patientId]);

  /**
   * Update one goal in local state.
   */
  const updateGoalObjective = (
    pillarKey: Exclude<keyof GoalsStructure, "actions">,
    value: string
  ) => {
    setGoals((prev) => ({
      ...prev,
      [pillarKey]: value,
    }));
  };

  const updateGoalAction = (pillarKey: keyof GoalsStructure["actions"], index: number, value: string) => {
    setGoals((prev) => ({
      ...prev,
      actions: {
        ...prev.actions,
        [pillarKey]: prev.actions[pillarKey].map((action, actionIndex) => actionIndex === index ? value : action),
      },
    }));
  };

  const addGoalAction = (pillarKey: keyof GoalsStructure["actions"]) => {
    setGoals((prev) => {
      const actions = prev.actions[pillarKey];
      return { ...prev, actions: { ...prev.actions, [pillarKey]: [...actions, ""] } };
    });
  };

  const removeGoalAction = (pillarKey: keyof GoalsStructure["actions"], index: number) => {
    setGoals((prev) => {
      const actions = prev.actions[pillarKey].filter((_, actionIndex) => actionIndex !== index);
      return { ...prev, actions: { ...prev.actions, [pillarKey]: actions.length ? actions : [""] } };
    });
  };

  /**
   * Save goals to UserGoal.
   */
  const handleSave = async () => {
    if (!patientId) {
      setError("Unable to save goals: patient ID is missing.");
      return;
    }

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await updatePatientGoals(patientId, {
        body: {
          objective: goals.body.trim(),
          actions: goals.actions.body.filter((action) => action.trim()),
        },

        mind: {
          objective: goals.mind.trim(),
          actions: goals.actions.mind.filter((action) => action.trim()),
        },

        // Spirit is the existing category consumed by the Flutter app.
        spirit: {
          objective: goals.spirit.trim(),
          actions: goals.actions.spirit.filter((action) => action.trim()),
        },

        life: {
          objective: goals.life.trim(),
          actions: goals.actions.life.filter((action) => action.trim()),
        },
      });

      setSaveSuccess(true);
      setIsEditing(false);
      bumpDataRefreshVersion();
      toast.success("Personalized goals saved successfully");
      window.setTimeout(() => navigate("/users"), 700);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to save goals."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-[32px]">
        <p className="font-['Figtree'] text-[var(--app-muted,#8a8073)] text-[14px]">
          Loading goals...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-[var(--app-bg,#f8f9fa)] dark:bg-[#0d0d0d] text-[var(--app-text,#1a1a1a)] dark:text-white transition-colors duration-200">
      <div className="max-w-[1200px] mx-auto p-[24px] lg:p-[32px] flex flex-col gap-[24px]">

        {/* Header */}
        <div className="flex flex-col gap-[8px]">

          <div className="flex items-center justify-between">

            <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#f37422]">
              USERS &gt; GOALS
            </span>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={isEditing}
              className="inline-flex items-center gap-[6px] rounded-[8px] bg-[#f37422] px-[14px] py-[8px] text-[13px] font-['Figtree'] font-semibold text-white shadow-[0_4px_12px_rgba(243,116,34,0.2)] transition-colors hover:bg-[#e5681e] cursor-pointer disabled:cursor-default disabled:opacity-40"
            >
              <Pencil size={14} />
              Edit
            </button>

          </div>

          <h1 className="font-['Figtree'] font-bold text-[28px] leading-tight text-[var(--app-text,#1a1a1a)] dark:text-white">
            {cleanPatientName(patientName, patientEmail) || "User Goals"}
          </h1>

          <p className="font-['Figtree'] text-[13px] text-[var(--app-muted,#8a8073)]">
            {patientEmail || "No patient email"} ·{" "}
            <span className={patientActive ? "text-emerald-500" : "text-red-500"}>
              {patientActive ? "Active" : "Inactive"}
            </span>{" "}· Assigned to {counselorName || "Unassigned"}
          </p>

        </div>

        {/* Error */}
        {error && (
          <p className="font-['Figtree'] text-[13px] text-red-500">
            {error}
          </p>
        )}

        {/* Success */}
        {saveSuccess && (
          <p className="font-['Figtree'] text-[13px] text-emerald-600 dark:text-green-400">
            Goals saved successfully!
          </p>
        )}

        {/* 4 Goal Cards */}
        {(Object.keys(PILLAR_CONFIG) as Array<
          keyof typeof PILLAR_CONFIG
        >).map((pillarKey) => {
          const config = PILLAR_CONFIG[pillarKey];

          const objectiveValue = goals[pillarKey];

          const IconComponent = config.icon;

          return (
            <div
              key={pillarKey}
              id={`goal-pillar-${pillarKey}`}
              className={`rounded-[12px] bg-[var(--app-surface,#ffffff)] dark:bg-[#141414] border ${config.borderColor} p-[20px] flex flex-col gap-[16px] transition-all shadow-sm dark:shadow-none`}
            >

              {/* Card Header */}
              <div className="flex items-center justify-between">

                <div className="flex items-center gap-[10px]">

                  <div
                    className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center"
                    style={{
                      backgroundColor: `${config.accentHex}1D`,
                    }}
                  >
                    <IconComponent
                      size={18}
                      color={config.accentHex}
                    />
                  </div>

                  <h2 className="font-['Figtree'] font-bold text-[18px] text-[var(--app-text,#1a1a1a)] dark:text-white">
                    {config.title}
                  </h2>

                </div>

                <span
                  className={`font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-wider px-[10px] py-[4px] rounded-[6px] ${config.badgeBg} ${config.badgeText}`}
                >
                  ACTIVE GOAL
                </span>

              </div>

              {/* Goal Objective */}
              <div className="flex flex-col gap-[6px]">

                <label className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-wider text-[var(--app-muted,#8a8073)]">
                  PERSONALIZED GOAL
                </label>

                <input
                  type="text"
                  value={objectiveValue}
                  maxLength={MAX_PERSONALIZED_GOAL_LENGTH}
                  onChange={(e) =>
                    updateGoalObjective(
                      pillarKey,
                      e.target.value
                    )
                  }
                  disabled={!isEditing}
                  placeholder="Enter goal objective..."
                  className="w-full h-[48px] bg-[var(--app-bg,#f9fafb)] dark:bg-[#1a1a1a] border border-[var(--app-border,#e5e7eb)] dark:border-[#2a2a2a] rounded-[8px] px-[16px] text-[13px] font-['Figtree'] text-[var(--app-text,#1a1a1a)] dark:text-white placeholder-[#9ca3af] dark:placeholder-[#525252] focus:outline-none focus:border-[var(--app-border-strong,#d1d5db)] dark:focus:border-[#404040] transition-colors"
                  />

                <p className="text-right font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted,#8a8073)]">
                  {objectiveValue.length}/{MAX_PERSONALIZED_GOAL_LENGTH}
                </p>

              </div>

              <div className="flex flex-col gap-[10px]">
                <label className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-wider text-[var(--app-muted,#8a8073)]">ACTION ITEMS</label>
                {goals.actions[pillarKey].map((action, index) => (
                  <div key={index} className="flex items-center gap-[10px]">
                    <span className="flex h-[40px] w-[32px] shrink-0 items-center justify-center rounded-[6px] border border-[var(--app-border,#e5e7eb)] bg-[var(--app-bg,#f9fafb)] font-['JetBrains_Mono'] text-[11px] text-[var(--app-muted,#8a8073)] dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">{index + 1}</span>
                    <input type="text" value={action} disabled={!isEditing} onChange={(event) => updateGoalAction(pillarKey, index, event.target.value)} placeholder="Enter action item..." className="h-[40px] flex-1 rounded-[6px] border border-[var(--app-border,#e5e7eb)] bg-[var(--app-bg,#f9fafb)] px-[14px] font-['Figtree'] text-[13px] outline-none transition-colors placeholder:text-[#9ca3af] focus:border-[#f37422] dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-white" />
                    {goals.actions[pillarKey].length > 1 && <button type="button" disabled={!isEditing} onClick={() => removeGoalAction(pillarKey, index)} className="px-[6px] text-[18px] text-[#f37422] hover:text-[#ff9a5c] disabled:opacity-40" aria-label="Delete action">×</button>}
                  </div>
                ))}
                <button type="button" disabled={!isEditing} onClick={() => addGoalAction(pillarKey)} className="inline-flex w-fit items-center gap-[6px] font-['Figtree'] text-[13px] font-semibold text-[#f37422] hover:text-[#ff9a5c] disabled:cursor-not-allowed disabled:opacity-40">+ Add Action</button>
              </div>

            </div>
          );
        })}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-[12px] pt-[12px] pb-[40px]">

          <button
            type="button"
            onClick={() => setIsEditing(false)}
            disabled={!isEditing}
            className="h-[42px] px-[24px] rounded-[8px] border border-[var(--app-border,#d1d5db)] dark:border-[#2a2a2a] bg-[var(--app-surface,#ffffff)] dark:bg-[#141414] hover:bg-[var(--app-hover,#f3f4f6)] dark:hover:bg-[#1f1f1f] font-['Figtree'] font-semibold text-[13px] text-[var(--app-text,#1a1a1a)] dark:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !patientId || !isEditing}
            className="h-[42px] px-[24px] rounded-[8px] bg-[#f37422] hover:bg-[#e06311] disabled:opacity-50 font-['Figtree'] font-semibold text-[13px] text-white transition-colors cursor-pointer shadow-sm"
          >
            {saving ? "Saving..." : "Save Goals"}
          </button>

        </div>

      </div>
    </div>
  );
}
