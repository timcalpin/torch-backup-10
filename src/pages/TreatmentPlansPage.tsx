import { useEffect, useState } from "react";
import { Activity, Brain, Compass, Home, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useAppContext } from "@/app/app-context";
import { ApiError } from "@/lib/api";
import {
  getTreatmentPlan,
  updateTreatmentPlan,
  createTreatmentPlan,
  type ApiTreatmentPlan,
} from "@/lib/treatmentPlans";

interface PillarData {
  objective: string;
  actions: string[];
}

interface TreatmentPlanStructure {
  clientOverview: string;
  body: PillarData;
  mind: PillarData;
  spirit: PillarData;
  life: PillarData;
}

const DEFAULT_STRUCTURE: TreatmentPlanStructure = {
  clientOverview: "",
  body: { objective: "", actions: [""] },
  mind: { objective: "", actions: [""] },
  spirit: { objective: "", actions: [""] },
  life: { objective: "", actions: [""] },
};

// Config for pillar visual themes & adaptive light/dark badges
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

interface TreatmentPlansPageProps {
  patientId?: string | number;
  planId?: string;
}

export function TreatmentPlansPage({ patientId, planId: initialPlanId }: TreatmentPlansPageProps) {
  // Track current plan ID locally so it can seamlessly transition from CREATE -> UPDATE on first save
  const [currentPlanId, setCurrentPlanId] = useState<string | undefined>(initialPlanId);

  const { bumpTreatmentPlansVersion } = useAppContext();

  const [plan, setPlan] = useState<ApiTreatmentPlan | null>(null);
  const [structure, setStructure] = useState<TreatmentPlanStructure>(DEFAULT_STRUCTURE);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync prop changes to state if initialPlanId changes
  useEffect(() => {
    setCurrentPlanId(initialPlanId);
  }, [initialPlanId]);

  // Parse server goals string or initialize default schema
  useEffect(() => {
    if (!currentPlanId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getTreatmentPlan(currentPlanId)
      .then((res) => {
        if (cancelled) return;
        setPlan(res);
        if (res.goals_and_milestones) {
          try {
            const parsed = JSON.parse(res.goals_and_milestones);
            setStructure({
              clientOverview: parsed.clientOverview || "",
              body: parsed.body || { objective: "", actions: [""] },
              mind: parsed.mind || { objective: "", actions: [""] },
              spirit: parsed.spirit || { objective: "", actions: [""] },
              life: parsed.life || { objective: "", actions: [""] },
            });
          } catch {
            setStructure((prev) => ({
              ...prev,
              clientOverview: res.goals_and_milestones || "",
            }));
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load treatment plan.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentPlanId]);

  const updatePillar = (
    pillarKey: keyof Omit<TreatmentPlanStructure, "clientOverview">,
    field: "objective" | "actions",
    value: any,
    actionIndex?: number
  ) => {
    setStructure((prev) => {
      const currentPillar = { ...prev[pillarKey] };

      if (field === "objective") {
        currentPillar.objective = value;
      } else if (field === "actions" && typeof actionIndex === "number") {
        const newActions = [...currentPillar.actions];
        newActions[actionIndex] = value;
        currentPillar.actions = newActions;
      }

      return { ...prev, [pillarKey]: currentPillar };
    });
  };

  const addActionItem = (pillarKey: keyof Omit<TreatmentPlanStructure, "clientOverview">) => {
    setStructure((prev) => ({
      ...prev,
      [pillarKey]: {
        ...prev[pillarKey],
        actions: [...prev[pillarKey].actions, ""],
      },
    }));
  };

  const removeActionItem = (
    pillarKey: keyof Omit<TreatmentPlanStructure, "clientOverview">,
    index: number
  ) => {
    setStructure((prev) => ({
      ...prev,
      [pillarKey]: {
        ...prev[pillarKey],
        actions: prev[pillarKey].actions.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const payload = {
        goals_and_milestones: JSON.stringify(structure),
      };

      if (currentPlanId) {
        // UPDATE Existing Plan
        const updated = await updateTreatmentPlan(currentPlanId, payload);
        setPlan(updated);
      } else {
        // CREATE New Plan
        if (!patientId) {
          throw new Error("Unable to create treatment plan: Patient ID is missing.");
        }

        const created = await createTreatmentPlan({
          patient: patientId,
          ...payload,
        });

        // Store returned plan and set ID to transition page into Edit Mode
        setPlan(created);
        setCurrentPlanId(String(created.id));
      }

      bumpTreatmentPlansVersion();
      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Treatment plan save error:", err);

      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Failed to save treatment plan."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-[32px]">
        <p className="font-['Figtree'] text-[var(--app-muted,#8a8073)] text-[14px]">Loading treatment plan...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-[var(--app-bg,#f8f9fa)] dark:bg-[#0d0d0d] text-[var(--app-text,#1a1a1a)] dark:text-white transition-colors duration-200">
      <div className="max-w-[1200px] mx-auto p-[24px] lg:p-[32px] flex flex-col gap-[24px]">

        {/* Dynamic Navigation Breadcrumb Header */}
        <div className="flex flex-col gap-[8px]">
          <div className="flex items-center justify-between">
            <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#f37422]">
              USERS &gt; TREATMENT PLAN
            </span>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-[6px] text-[13px] font-['Figtree'] text-[var(--app-muted,#8a8073)] hover:text-[var(--app-text,#1a1a1a)] dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to User Directory
            </button>
          </div>

          <h1 className="font-['Figtree'] font-bold text-[28px] leading-tight text-[var(--app-text,#1a1a1a)] dark:text-white">
            {plan?.patient_name || (currentPlanId ? "Treatment Plan" : "New Treatment Plan")}
          </h1>

          <p className="font-['Figtree'] text-[13px] text-[var(--app-muted,#8a8073)]">
            {plan?.patient_email || "No patient email"} ·{" "}
            <span className="capitalize">
              {plan?.status || "draft"}
            </span>{" "}
            · Assigned to{" "}
            {plan?.counselor_name || "Unassigned"}
          </p>
        </div>

        {error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        {saveSuccess && (
          <p className="font-['Figtree'] text-[13px] text-emerald-600 dark:text-green-400">Treatment plan saved successfully!</p>
        )}

        {/* Client Overview Card */}
        <div className="rounded-[12px] bg-[var(--app-surface,#ffffff)] dark:bg-[#141414] border border-[var(--app-border,#e5e7eb)] dark:border-[#262626] p-[20px] flex flex-col gap-[10px] shadow-sm dark:shadow-none">
          <label className="font-['JetBrains_Mono'] text-[10px] uppercase font-bold tracking-wider text-[var(--app-muted,#8a8073)]">
            CLIENT OVERVIEW
          </label>
          <textarea
            value={structure.clientOverview}
            onChange={(e) => setStructure({ ...structure, clientOverview: e.target.value })}
            placeholder="Enter client overview notes..."
            rows={3}
            className="w-full bg-[var(--app-bg,#f9fafb)] dark:bg-[#1a1a1a] border border-[var(--app-border,#e5e7eb)] dark:border-[#2a2a2a] rounded-[8px] p-[14px] text-[13px] font-['Figtree'] text-[var(--app-text,#1a1a1a)] dark:text-white placeholder-[#9ca3af] dark:placeholder-[#525252] focus:outline-none focus:border-[#f37422] transition-colors resize-none"
          />
        </div>

        {/* 4 Pillars Section */}
        {(Object.keys(PILLAR_CONFIG) as Array<keyof typeof PILLAR_CONFIG>).map((pillarKey) => {
          const config = PILLAR_CONFIG[pillarKey];
          const pillarData = structure[pillarKey];
          const IconComponent = config.icon;
          const activeActionCount = pillarData.actions.filter((a) => a.trim().length > 0).length;

          return (
            <div
              key={pillarKey}
              className={`rounded-[12px] bg-[var(--app-surface,#ffffff)] dark:bg-[#141414] border ${config.borderColor} p-[20px] flex flex-col gap-[18px] transition-all shadow-sm dark:shadow-none`}
            >
              {/* Pillar Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[10px]">
                  <div
                    className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center"
                    style={{ backgroundColor: `${config.accentHex}1D` }}
                  >
                    <IconComponent size={18} color={config.accentHex} />
                  </div>
                  <h2 className="font-['Figtree'] font-bold text-[18px] text-[var(--app-text,#1a1a1a)] dark:text-white">
                    {config.title}
                  </h2>
                </div>

                <span
                  className={`font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-wider px-[10px] py-[4px] rounded-[6px] ${config.badgeBg} ${config.badgeText}`}
                >
                  {activeActionCount} ACTIONS
                </span>
              </div>

              {/* Objective Input */}
              <div className="flex flex-col gap-[6px]">
                <label className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-wider text-[var(--app-muted,#8a8073)]">
                  OBJECTIVE
                </label>
                <input
                  type="text"
                  value={pillarData.objective}
                  onChange={(e) => updatePillar(pillarKey, "objective", e.target.value)}
                  placeholder="Enter objective..."
                  className="w-full h-[44px] bg-[var(--app-bg,#f9fafb)] dark:bg-[#1a1a1a] border border-[var(--app-border,#e5e7eb)] dark:border-[#2a2a2a] rounded-[8px] px-[14px] text-[13px] font-['Figtree'] text-[var(--app-text,#1a1a1a)] dark:text-white placeholder-[#9ca3af] dark:placeholder-[#525252] focus:outline-none focus:border-[var(--app-border-strong,#d1d5db)] dark:focus:border-[#404040] transition-colors"
                />
              </div>

              {/* Action Items List */}
              <div className="flex flex-col gap-[10px]">
                <label className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-wider text-[var(--app-muted,#8a8073)]">
                  ACTION ITEMS
                </label>

                {pillarData.actions.map((action, idx) => (
                  <div key={idx} className="flex items-center gap-[10px]">
                    <div className="w-[32px] h-[40px] bg-[var(--app-bg,#f9fafb)] dark:bg-[#1a1a1a] border border-[var(--app-border,#e5e7eb)] dark:border-[#2a2a2a] rounded-[6px] flex items-center justify-center font-['JetBrains_Mono'] text-[11px] text-[var(--app-muted,#8a8073)] flex-shrink-0">
                      {idx + 1}
                    </div>

                    <input
                      type="text"
                      value={action}
                      onChange={(e) => updatePillar(pillarKey, "actions", e.target.value, idx)}
                      placeholder="Enter action item..."
                      className="flex-1 h-[40px] bg-[var(--app-bg,#f9fafb)] dark:bg-[#1a1a1a] border border-[var(--app-border,#e5e7eb)] dark:border-[#2a2a2a] rounded-[6px] px-[14px] text-[13px] font-['Figtree'] text-[var(--app-text,#1a1a1a)] dark:text-white placeholder-[#9ca3af] dark:placeholder-[#525252] focus:outline-none focus:border-[var(--app-border-strong,#d1d5db)] dark:focus:border-[#404040] transition-colors"
                    />

                    {pillarData.actions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeActionItem(pillarKey, idx)}
                        className="p-[8px] text-[var(--app-muted,#8a8073)] hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete action"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addActionItem(pillarKey)}
                  className={`w-fit inline-flex items-center gap-[6px] font-['Figtree'] font-semibold text-[13px] mt-[4px] cursor-pointer hover:underline ${config.badgeText}`}
                >
                  <Plus size={14} /> Add Action
                </button>
              </div>
            </div>
          );
        })}

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-[12px] pt-[12px] pb-[40px]">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="h-[42px] px-[24px] rounded-[8px] border border-[var(--app-border,#d1d5db)] dark:border-[#2a2a2a] bg-[var(--app-surface,#ffffff)] dark:bg-[#141414] hover:bg-[var(--app-hover,#f3f4f6)] dark:hover:bg-[#1f1f1f] font-['Figtree'] font-semibold text-[13px] text-[var(--app-text,#1a1a1a)] dark:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-[42px] px-[24px] rounded-[8px] bg-[#1a1a1a] dark:bg-white hover:bg-[#333333] dark:hover:bg-[#e5e5e5] disabled:opacity-50 font-['Figtree'] font-semibold text-[13px] text-white dark:text-black transition-colors cursor-pointer shadow-sm"
          >
            {saving ? "Saving..." : "Save Treatment Plan"}
          </button>
        </div>

      </div>
    </div>
  );
}