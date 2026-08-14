import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Activity,
  Brain,
  Compass,
  Home,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react";

import { useAppContext } from "@/app/app-context";
import { ApiError } from "@/lib/api";
import { getUser } from "@/lib/users";

import {
  getTreatmentPlan,
  getTreatmentPlanForPatient,
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

/**
 * Default treatment plan structure.
 *
 * Every pillar starts with ONE action field.
 * The user must fill that action before
 * another action can be added.
 */
const DEFAULT_STRUCTURE: TreatmentPlanStructure = {
  clientOverview: "",

  body: {
    objective: "",
    actions: [""],
  },

  mind: {
    objective: "",
    actions: [""],
  },

  spirit: {
    objective: "",
    actions: [""],
  },

  life: {
    objective: "",
    actions: [""],
  },
};

const PILLAR_CONFIG = {
  body: {
    title: "Body",
    icon: Activity,
    borderColor:
      "border-[#f37422]/60 dark:border-[#f37422]",
    badgeBg:
      "bg-[#f37422]/10 dark:bg-[#f37422]/20",
    badgeText:
      "text-[#d95d0e] dark:text-[#f37422]",
    accentHex: "#f37422",
  },

  mind: {
    title: "Mind",
    icon: Brain,
    borderColor:
      "border-[#6b8ab0]/60 dark:border-[#6b8ab0]",
    badgeBg:
      "bg-[#6b8ab0]/10 dark:bg-[#6b8ab0]/20",
    badgeText:
      "text-[#4a698e] dark:text-[#6b8ab0]",
    accentHex: "#6b8ab0",
  },

  spirit: {
    title: "Spirit",
    icon: Compass,
    borderColor:
      "border-[#c084fc]/60 dark:border-[#c084fc]",
    badgeBg:
      "bg-[#c084fc]/10 dark:bg-[#c084fc]/20",
    badgeText:
      "text-[#9333ea] dark:text-[#c084fc]",
    accentHex: "#c084fc",
  },

  life: {
    title: "Life",
    icon: Home,
    borderColor:
      "border-[#eab308]/60 dark:border-[#facc15]",
    badgeBg:
      "bg-[#facc15]/15 dark:bg-[#facc15]/20",
    badgeText:
      "text-[#ca8a04] dark:text-[#facc15]",
    accentHex: "#ca8a04",
  },
};

interface TreatmentPlansPageProps {
  patientId?: string | number;
  planId?: string;
}

/**
 * Normalize a pillar coming from the backend.
 *
 * Important:
 * If the backend returns:
 *
 * actions: []
 *
 * we still want the UI to show Action 1.
 *
 * Also protects against old/invalid data.
 */
function normalizePillar(
  pillar: Partial<PillarData> | null | undefined
): PillarData {
  const actions = Array.isArray(pillar?.actions)
    ? pillar.actions.filter(
        (action): action is string =>
          typeof action === "string"
      )
    : [];

  return {
    objective:
      typeof pillar?.objective === "string"
        ? pillar.objective
        : "",

    actions:
      actions.length > 0
        ? actions
        : [""],
  };
}

export function TreatmentPlansPage({
  patientId,
  planId: initialPlanId,
}: TreatmentPlansPageProps) {
  const params = useParams<{
    userId?: string;
  }>();

  const selectedPatientId =
    patientId || params.userId;

  const [currentPlanId, setCurrentPlanId] =
    useState<string | undefined>(
      initialPlanId
    );

  const {
    bumpTreatmentPlansVersion,
  } = useAppContext();

  const [plan, setPlan] =
    useState<ApiTreatmentPlan | null>(null);

  // Patient information loaded from the user API.
  const [patientName, setPatientName] =
    useState("");

  const [patientEmail, setPatientEmail] =
    useState("");

  const [structure, setStructure] =
    useState<TreatmentPlanStructure>(
      DEFAULT_STRUCTURE
    );

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [saveSuccess, setSaveSuccess] =
    useState(false);

  /**
   * IMPORTANT:
   *
   * The user's full_name is the source of truth
   * for the display name.
   *
   * plan.patient_name is only used as fallback.
   */
  const displayPatientName = (
    patientName ||
    plan?.patient_name ||
    ""
  ).trim();

  /**
   * Email is kept completely separate
   * from the name.
   */
  const displayPatientEmail = (
    patientEmail ||
    plan?.patient_email ||
    ""
  ).trim();

  /**
   * Load actual user information.
   *
   * user.full_name -> patientName
   * user.email     -> patientEmail
   */
  useEffect(() => {
    if (!selectedPatientId) {
      return;
    }

    let cancelled = false;

    getUser(String(selectedPatientId))
      .then((user) => {
        if (cancelled) {
          return;
        }

        setPatientName(
          user.full_name || ""
        );

        setPatientEmail(
          user.email || ""
        );
      })
      .catch((err) => {
        console.error(
          "Failed to load patient information:",
          err
        );
      });

    return () => {
      cancelled = true;
    };
  }, [selectedPatientId]);

  /**
   * Sync prop changes to state if
   * initialPlanId changes.
   */
  useEffect(() => {
    setCurrentPlanId(initialPlanId);
  }, [
    initialPlanId,
    selectedPatientId,
  ]);

  /**
   * Load treatment plan.
   */
  useEffect(() => {
    if (
      !currentPlanId &&
      !selectedPatientId
    ) {
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    const request = initialPlanId
      ? getTreatmentPlan(initialPlanId)
      : getTreatmentPlanForPatient(
          String(selectedPatientId)
        );

    request
      .then((res) => {
        if (cancelled) {
          return;
        }

        if (!res) {
          setPlan(null);
          setCurrentPlanId(undefined);
          setStructure(DEFAULT_STRUCTURE);
          return;
        }

        setPlan(res);
        setCurrentPlanId(res.id);

        if (res.goals_and_milestones) {
          try {
            const parsed = JSON.parse(
              res.goals_and_milestones
            );

            setStructure({
              clientOverview:
                typeof parsed.clientOverview ===
                "string"
                  ? parsed.clientOverview
                  : "",

              body: normalizePillar(
                parsed.body
              ),

              mind: normalizePillar(
                parsed.mind
              ),

              spirit: normalizePillar(
                parsed.spirit
              ),

              life: normalizePillar(
                parsed.life
              ),
            });
          } catch {
            setStructure((prev) => ({
              ...prev,
              clientOverview:
                res.goals_and_milestones ||
                "",
            }));
          }
        } else {
          setStructure(DEFAULT_STRUCTURE);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Failed to load treatment plan."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    initialPlanId,
    selectedPatientId,
  ]);

  /**
   * Update pillar data.
   */
  const updatePillar = (
    pillarKey: keyof Omit<
      TreatmentPlanStructure,
      "clientOverview"
    >,
    field:
      | "objective"
      | "actions",
    value: string,
    actionIndex?: number
  ) => {
    setStructure((prev) => {
      const currentPillar = {
        ...prev[pillarKey],
        actions: [
          ...prev[pillarKey].actions,
        ],
      };

      if (field === "objective") {
        currentPillar.objective =
          value;
      }

      if (
        field === "actions" &&
        typeof actionIndex === "number"
      ) {
        currentPillar.actions[
          actionIndex
        ] = value;
      }

      return {
        ...prev,
        [pillarKey]: currentPillar,
      };
    });
  };

  /**
   * Check whether another action can be added.
   *
   * Rules:
   *
   * Action 1 empty
   *    -> cannot add Action 2
   *
   * Action 1 filled
   *    -> can add Action 2
   *
   * Action 2 empty
   *    -> cannot add Action 3
   *
   * Action 2 filled
   *    -> can add Action 3
   */
  const canAddAction = (
    pillarKey: keyof Omit<
      TreatmentPlanStructure,
      "clientOverview"
    >
  ) => {
    const actions =
      structure[pillarKey].actions;

    if (actions.length === 0) {
      return true;
    }

    const lastAction =
      actions[actions.length - 1];

    return lastAction.trim().length > 0;
  };

  /**
   * Add action item.
   *
   * IMPORTANT:
   * A new empty action is only created when
   * the previous action has text.
   */
  const addActionItem = (
    pillarKey: keyof Omit<
      TreatmentPlanStructure,
      "clientOverview"
    >
  ) => {
    setStructure((prev) => {
      const currentActions =
        prev[pillarKey].actions;

      const lastAction =
        currentActions[
          currentActions.length - 1
        ] || "";

      // Do not add another action if
      // the current action is empty.
      if (!lastAction.trim()) {
        return prev;
      }

      return {
        ...prev,

        [pillarKey]: {
          ...prev[pillarKey],

          actions: [
            ...currentActions,
            "",
          ],
        },
      };
    });
  };

  /**
   * Remove action item.
   *
   * We never allow a pillar to have
   * zero action inputs.
   */
  const removeActionItem = (
    pillarKey: keyof Omit<
      TreatmentPlanStructure,
      "clientOverview"
    >,
    index: number
  ) => {
    setStructure((prev) => {
      const currentActions =
        prev[pillarKey].actions;

      const newActions =
        currentActions.filter(
          (_, i) => i !== index
        );

      return {
        ...prev,

        [pillarKey]: {
          ...prev[pillarKey],

          actions:
            newActions.length > 0
              ? newActions
              : [""],
        },
      };
    });
  };

  /**
   * Validate the treatment plan before save.
   *
   * This prevents saving a plan where
   * one of the added action fields is empty.
   */
  const validateTreatmentPlan = () => {
    const pillars: Array<
      keyof Omit<
        TreatmentPlanStructure,
        "clientOverview"
      >
    > = [
      "body",
      "mind",
      "spirit",
      "life",
    ];

    for (const pillarKey of pillars) {
      const actions =
        structure[pillarKey].actions;

      const emptyActionIndex =
        actions.findIndex(
          (action) =>
            !action.trim()
        );

      if (emptyActionIndex !== -1) {
        const pillarTitle =
          PILLAR_CONFIG[pillarKey]
            .title;

        setError(
          `Please complete Action ${
            emptyActionIndex + 1
          } in ${pillarTitle} before saving.`
        );

        return false;
      }
    }

    return true;
  };

  /**
   * Save treatment plan.
   */
  const handleSave = async () => {
    setError(null);
    setSaveSuccess(false);

    /**
     * Validate before sending anything
     * to the backend.
     */
    if (!validateTreatmentPlan()) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        goals_and_milestones:
          JSON.stringify(structure),
      };

      if (currentPlanId) {
        // UPDATE existing treatment plan.
        const updated =
          await updateTreatmentPlan(
            currentPlanId,
            payload
          );

        setPlan(updated);
      } else {
        // CREATE new treatment plan.
        if (!selectedPatientId) {
          throw new Error(
            "Unable to create treatment plan: Patient ID is missing."
          );
        }

        const created =
          await createTreatmentPlan({
            patient:
              String(selectedPatientId),
            ...payload,
          });

        setPlan(created);

        setCurrentPlanId(
          String(created.id)
        );
      }

      bumpTreatmentPlansVersion();

      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(
        "Treatment plan save error:",
        err
      );

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
        <p className="font-['Figtree'] text-[var(--app-muted,#8a8073)] text-[14px]">
          Loading treatment plan...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-[var(--app-bg,#f8f9fa)] dark:bg-[#0d0d0d] text-[var(--app-text,#1a1a1a)] dark:text-white transition-colors duration-200">

      <div className="max-w-[1200px] mx-auto p-[24px] lg:p-[32px] flex flex-col gap-[24px]">

        {/* HEADER */}

        <div className="flex flex-col gap-[8px]">

          <div className="flex items-center justify-between">

            <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#f37422]">
              USERS &gt; TREATMENT PLAN
            </span>

            <button
              type="button"
              onClick={() =>
                window.history.back()
              }
              className="inline-flex items-center gap-[6px] text-[13px] font-['Figtree'] text-[var(--app-muted,#8a8073)] hover:text-[var(--app-text,#1a1a1a)] dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              Back to User Directory
            </button>

          </div>

          {/* ACTUAL FULL NAME */}

          <h1 className="font-['Figtree'] font-bold text-[28px] leading-tight text-[var(--app-text,#1a1a1a)] dark:text-white">
            {displayPatientName}
          </h1>

          {/* EMAIL / STATUS / COUNSELOR */}

          <p className="font-['Figtree'] text-[13px] text-[var(--app-muted,#8a8073)]">

            {displayPatientEmail ||
              "No patient email"}

            {" · "}

            <span className="capitalize">
              {plan?.status || "draft"}
            </span>

            {" · Assigned to "}

            {plan?.counselor_name ||
              "Unassigned"}

          </p>

        </div>

        {/* ERROR */}

        {error && (
          <p className="font-['Figtree'] text-[13px] text-red-500">
            {error}
          </p>
        )}

        {/* SUCCESS */}

        {saveSuccess && (
          <p className="font-['Figtree'] text-[13px] text-emerald-600 dark:text-green-400">
            Treatment plan saved successfully!
          </p>
        )}

        {/* CLIENT OVERVIEW */}

        <div className="rounded-[12px] bg-[var(--app-surface,#ffffff)] dark:bg-[#141414] border border-[var(--app-border,#e5e7eb)] dark:border-[#262626] p-[20px] flex flex-col gap-[10px] shadow-sm dark:shadow-none">

          <label className="font-['JetBrains_Mono'] text-[10px] uppercase font-bold tracking-wider text-[var(--app-muted,#8a8073)]">
            CLIENT OVERVIEW
          </label>

          <textarea
            value={
              structure.clientOverview
            }
            onChange={(e) =>
              setStructure({
                ...structure,
                clientOverview:
                  e.target.value,
              })
            }
            placeholder="Enter client overview notes..."
            rows={3}
            className="w-full bg-[var(--app-bg,#f9fafb)] dark:bg-[#1a1a1a] border border-[var(--app-border,#e5e7eb)] dark:border-[#2a2a2a] rounded-[8px] p-[14px] text-[13px] font-['Figtree'] text-[var(--app-text,#1a1a1a)] dark:text-white placeholder-[#9ca3af] dark:placeholder-[#525252] focus:outline-none focus:border-[#f37422] transition-colors resize-none"
          />

        </div>

        {/* 4 PILLARS */}

        {(Object.keys(
          PILLAR_CONFIG
        ) as Array<
          keyof typeof PILLAR_CONFIG
        >).map((pillarKey) => {

          const config =
            PILLAR_CONFIG[pillarKey];

          const pillarData =
            structure[pillarKey];

          const IconComponent =
            config.icon;

          const activeActionCount =
            pillarData.actions.filter(
              (action) =>
                action.trim().length > 0
            ).length;

          const isAddActionEnabled =
            canAddAction(pillarKey);

          return (
            <div
              key={pillarKey}
              className={`rounded-[12px] bg-[var(--app-surface,#ffffff)] dark:bg-[#141414] border ${config.borderColor} p-[20px] flex flex-col gap-[18px] transition-all shadow-sm dark:shadow-none`}
            >

              {/* PILLAR HEADER */}

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-[10px]">

                  <div
                    className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center"
                    style={{
                      backgroundColor:
                        `${config.accentHex}1D`,
                    }}
                  >
                    <IconComponent
                      size={18}
                      color={
                        config.accentHex
                      }
                    />
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

              {/* OBJECTIVE */}

              <div className="flex flex-col gap-[6px]">

                <label className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-wider text-[var(--app-muted,#8a8073)]">
                  OBJECTIVE
                </label>

                <input
                  type="text"
                  value={
                    pillarData.objective
                  }
                  onChange={(e) =>
                    updatePillar(
                      pillarKey,
                      "objective",
                      e.target.value
                    )
                  }
                  placeholder="Enter objective..."
                  className="w-full h-[44px] bg-[var(--app-bg,#f9fafb)] dark:bg-[#1a1a1a] border border-[var(--app-border,#e5e7eb)] dark:border-[#2a2a2a] rounded-[8px] px-[14px] text-[13px] font-['Figtree'] text-[var(--app-text,#1a1a1a)] dark:text-white placeholder-[#9ca3af] dark:placeholder-[#525252] focus:outline-none focus:border-[var(--app-border-strong,#d1d5db)] dark:focus:border-[#404040] transition-colors"
                />

              </div>

              {/* ACTION ITEMS */}

              <div className="flex flex-col gap-[10px]">

                <label className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-wider text-[var(--app-muted,#8a8073)]">
                  ACTION ITEMS
                </label>

                {pillarData.actions.map(
                  (action, idx) => (

                    <div
                      key={idx}
                      className="flex items-center gap-[10px]"
                    >

                      {/* ACTION NUMBER */}

                      <div className="w-[32px] h-[40px] bg-[var(--app-bg,#f9fafb)] dark:bg-[#1a1a1a] border border-[var(--app-border,#e5e7eb)] dark:border-[#2a2a2a] rounded-[6px] flex items-center justify-center font-['JetBrains_Mono'] text-[11px] text-[var(--app-muted,#8a8073)] flex-shrink-0">
                        {idx + 1}
                      </div>

                      {/* ACTION INPUT */}

                      <input
                        type="text"
                        value={action}
                        onChange={(e) =>
                          updatePillar(
                            pillarKey,
                            "actions",
                            e.target.value,
                            idx
                          )
                        }
                        placeholder="Enter action item..."
                        className={`flex-1 h-[40px] bg-[var(--app-bg,#f9fafb)] dark:bg-[#1a1a1a] border rounded-[6px] px-[14px] text-[13px] font-['Figtree'] text-[var(--app-text,#1a1a1a)] dark:text-white placeholder-[#9ca3af] dark:placeholder-[#525252] focus:outline-none transition-colors ${
                          !action.trim() &&
                          idx <
                            pillarData
                              .actions
                              .length -
                              1
                            ? "border-red-500 focus:border-red-500"
                            : "border-[var(--app-border,#e5e7eb)] dark:border-[#2a2a2a] focus:border-[var(--app-border-strong,#d1d5db)] dark:focus:border-[#404040]"
                        }`}
                      />

                      {/* DELETE */}

                      {pillarData.actions
                        .length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeActionItem(
                              pillarKey,
                              idx
                            )
                          }
                          className="p-[8px] text-[var(--app-muted,#8a8073)] hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete action"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      )}

                    </div>

                  )
                )}

                {/* ADD ACTION */}

                <button
                  type="button"
                  onClick={() =>
                    addActionItem(
                      pillarKey
                    )
                  }
                  disabled={
                    !isAddActionEnabled
                  }
                  className={`w-fit inline-flex items-center gap-[6px] font-['Figtree'] font-semibold text-[13px] mt-[4px] transition-colors ${
                    isAddActionEnabled
                      ? `${config.badgeText} cursor-pointer hover:underline`
                      : "text-[var(--app-muted,#8a8073)] opacity-40 cursor-not-allowed"
                  }`}
                >
                  <Plus size={14} />
                  Add Action
                </button>

              </div>

            </div>
          );
        })}

        {/* FOOTER */}

        <div className="flex items-center justify-end gap-[12px] pt-[12px] pb-[40px]">

          <button
            type="button"
            onClick={() =>
              window.history.back()
            }
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
            {saving
              ? "Saving..."
              : "Save Treatment Plan"}
          </button>

        </div>

      </div>
    </div>
  );
}