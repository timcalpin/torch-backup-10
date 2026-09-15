import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { GhostBtn, PrimaryBtn } from "@/components/common/Buttons";
import { FormField, TextInput, TextArea, SelectInput } from "@/components/common/FormFields";
import { ApiError } from "@/lib/api";
import {
  getIntakeScript,
  updateIntakeScript,
  publishIntakeScript,
  INTAKE_STEP_TYPES,
  SKIP_IF_OPERATORS,
  type IntakeScriptDetail,
  type IntakeScriptStep,
  type SkipIf,
  type SkipIfOperator,
} from "@/lib/intakeScripts";

function emptyStep(section: number): IntakeScriptStep {
  return {
    key: "",
    type: "open",
    section,
    section_title: "",
    prompt: "",
    options: null,
    scale_labels: null,
    has_deceased_follow_up: false,
    skip_if: null,
    parser_note: "",
  };
}

const SKIP_IF_NEEDS_VALUE: Record<SkipIfOperator, boolean> = {
  equals: true,
  not_equals: true,
  multi_select_contains: true,
  multi_select_not_contains: true,
  multi_select_any: false,
  multi_select_empty: false,
};

function StepCard({
  step,
  index,
  expanded,
  onToggle,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  step: IntakeScriptStep;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (next: IntakeScriptStep) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const skipIf = step.skip_if ?? null;

  const setSkipIf = (next: Partial<SkipIf> | null) => {
    if (next === null) {
      onChange({ ...step, skip_if: null });
      return;
    }
    const merged: SkipIf = { op: "equals", key: "", ...skipIf, ...next };
    onChange({ ...step, skip_if: merged });
  };

  return (
    <div className="rounded-[10px] border border-[var(--app-border)] bg-[var(--app-surface)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-[10px] px-[16px] py-[12px] text-left"
      >
        <div className="flex min-w-0 items-center gap-[10px]">
          <span className="font-['JetBrains_Mono'] text-[10px] text-[var(--app-muted)]">#{index + 1}</span>
          <span className="font-['JetBrains_Mono'] text-[10px] font-bold uppercase text-[#f37422]">{step.type}</span>
          <span className="truncate font-['Figtree'] text-[13px] text-[var(--app-text)]">
            {step.key || "(no key set)"} — {step.prompt.slice(0, 70) || "(empty prompt)"}
          </span>
          {step.parser_note && (
            <span className="rounded-full bg-[rgba(244,196,0,0.14)] px-[7px] py-[2px] font-['JetBrains_Mono'] text-[8px] font-bold text-[#f4c400]">
              NEEDS REVIEW
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={14} className="shrink-0 text-[var(--app-muted)]" /> : <ChevronDown size={14} className="shrink-0 text-[var(--app-muted)]" />}
      </button>

      {expanded && (
        <div className="flex flex-col gap-[14px] border-t border-[var(--app-border)] px-[16px] py-[16px]">
          <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
            <FormField label="Key" required>
              <TextInput
                placeholder="e.g. substance_of_choice"
                value={step.key}
                onChange={(value) => onChange({ ...step, key: value })}
              />
            </FormField>
            <FormField label="Type" required>
              <SelectInput
                options={[...INTAKE_STEP_TYPES]}
                value={step.type}
                onChange={(value) => onChange({ ...step, type: value as IntakeScriptStep["type"] })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
            <FormField label="Section">
              <TextInput
                type="number"
                value={String(step.section)}
                onChange={(value) => onChange({ ...step, section: Number(value) || 0 })}
              />
            </FormField>
            <FormField label="Section Title">
              <TextInput
                placeholder="e.g. Substance Use"
                value={step.section_title ?? ""}
                onChange={(value) => onChange({ ...step, section_title: value })}
              />
            </FormField>
          </div>

          <FormField label="Prompt">
            <TextArea
              rows={3}
              placeholder="Use {{key}} to reference a prior answer, e.g. {{substance_of_choice}}"
              value={step.prompt}
              onChange={(value) => onChange({ ...step, prompt: value })}
            />
          </FormField>

          {step.type === "multiSelect" && (
            <FormField label="Options (one per line)">
              <TextArea
                rows={4}
                placeholder={"Alcohol\nMarijuana\nOther"}
                value={(step.options ?? []).join("\n")}
                onChange={(value) =>
                  onChange({
                    ...step,
                    options: value.split("\n").map((line) => line.trim()).filter(Boolean),
                  })
                }
              />
            </FormField>
          )}

          {step.type === "scale" && (
            <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
              <FormField label="Low-end Label">
                <TextInput
                  placeholder="e.g. POOR DIET"
                  value={step.scale_labels?.low ?? ""}
                  onChange={(value) => onChange({ ...step, scale_labels: { ...step.scale_labels, low: value } })}
                />
              </FormField>
              <FormField label="High-end Label">
                <TextInput
                  placeholder="e.g. GOOD DIET"
                  value={step.scale_labels?.high ?? ""}
                  onChange={(value) => onChange({ ...step, scale_labels: { ...step.scale_labels, high: value } })}
                />
              </FormField>
            </div>
          )}

          <div className="flex flex-col gap-[8px] rounded-[8px] border border-[var(--app-border)] bg-[var(--app-bg)] p-[12px]">
            <div className="flex items-center justify-between">
              <span className="font-['JetBrains_Mono'] text-[10px] font-bold uppercase text-[var(--app-muted)]">Skip Condition</span>
              {skipIf && (
                <button type="button" onClick={() => setSkipIf(null)} className="font-['Figtree'] text-[11px] text-[#f37422] hover:underline">
                  Clear
                </button>
              )}
            </div>
            {!skipIf ? (
              <button
                type="button"
                onClick={() => setSkipIf({ op: "equals", key: "" })}
                className="w-fit font-['Figtree'] text-[12px] text-[#f37422] hover:underline"
              >
                + Add skip condition
              </button>
            ) : (
              <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-3">
                <SelectInput
                  options={[...SKIP_IF_OPERATORS]}
                  value={skipIf.op}
                  onChange={(value) => setSkipIf({ op: value as SkipIfOperator })}
                />
                <TextInput
                  placeholder="prior step key"
                  value={skipIf.key}
                  onChange={(value) => setSkipIf({ key: value })}
                />
                {SKIP_IF_NEEDS_VALUE[skipIf.op] && (
                  <TextInput
                    placeholder="value (e.g. Other, true, false)"
                    value={skipIf.value == null ? "" : String(skipIf.value)}
                    onChange={(value) => setSkipIf({ value })}
                  />
                )}
              </div>
            )}
          </div>

          {step.parser_note && (
            <FormField label="Parser note (from the uploaded .docx — review, then clear)">
              <TextArea
                rows={2}
                value={step.parser_note}
                onChange={(value) => onChange({ ...step, parser_note: value })}
              />
            </FormField>
          )}

          <div className="flex items-center justify-between border-t border-[var(--app-border)] pt-[12px]">
            <div className="flex items-center gap-[6px]">
              <button type="button" onClick={onMoveUp} disabled={isFirst} className="rounded-[6px] border border-[var(--app-border)] px-[8px] py-[4px] text-[var(--app-muted)] hover:text-[var(--app-text)] disabled:opacity-30">
                <ChevronUp size={13} />
              </button>
              <button type="button" onClick={onMoveDown} disabled={isLast} className="rounded-[6px] border border-[var(--app-border)] px-[8px] py-[4px] text-[var(--app-muted)] hover:text-[var(--app-text)] disabled:opacity-30">
                <ChevronDown size={13} />
              </button>
            </div>
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-[6px] font-['Figtree'] text-[12px] font-semibold text-red-500 hover:underline"
            >
              <Trash2 size={13} /> Delete step
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function IntakeScriptEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<IntakeScriptDetail | null>(null);
  const [steps, setSteps] = useState<IntakeScriptStep[]>([]);
  const [versionLabel, setVersionLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getIntakeScript(id)
      .then((response) => {
        if (cancelled) return;
        setDetail(response);
        setSteps(response.steps);
        setVersionLabel(response.version_label);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Unable to load this intake script.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const isLive = detail?.status === "live";
  const reviewCount = useMemo(() => steps.filter((s) => s.parser_note).length, [steps]);

  const updateStep = (index: number, next: IntakeScriptStep) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? next : s)));
  };

  const deleteStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
    setExpandedIndex(null);
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    setSteps((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const addStep = () => {
    const lastSection = steps.length ? steps[steps.length - 1].section : 0;
    setSteps((prev) => [...prev, emptyStep(lastSection)]);
    setExpandedIndex(steps.length);
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateIntakeScript(id, { version_label: versionLabel, steps });
      setDetail(updated);
      setSteps(updated.steps);
      setSavedAt(Date.now());
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!id) return;
    setPublishing(true);
    setSaveError(null);
    try {
      await handleSave();
      const updated = await publishIntakeScript(id);
      setDetail(updated);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Unable to publish this version.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return <div className="flex-1 p-[32px] font-['Figtree'] text-[13px] text-[var(--app-muted)]">Loading intake script…</div>;
  }
  if (error || !detail) {
    return <div className="flex-1 p-[32px] font-['Figtree'] text-[13px] text-red-500">{error ?? "Script not found."}</div>;
  }

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-[var(--app-bg)]">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[18px]">
        <button
          onClick={() => navigate("/intake-scripts")}
          className="flex w-fit items-center gap-[5px] font-['Figtree'] text-[11px] text-[var(--app-muted)] hover:text-[#f37422]"
        >
          <ArrowLeft size={12} /> Back to Intake Scripts
        </button>

        <PageHeader
          eyebrow={`INTAKE SCRIPT · ${detail.status.toUpperCase()} · ${steps.length} STEPS`}
          title={`Review — ${detail.version_label}`}
        >
          <GhostBtn label={saving ? "Saving…" : "Save Draft"} onClick={handleSave} disabled={saving || isLive} />
          {!isLive && (
            <PrimaryBtn
              label={publishing ? "Publishing…" : "Make Live"}
              onClick={handlePublish}
              disabled={publishing || steps.length === 0}
            />
          )}
        </PageHeader>

        {isLive && (
          <div className="rounded-[10px] border border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.08)] px-[14px] py-[10px] font-['Figtree'] text-[12px] text-[#4ade80]">
            This version is live — it's what new intakes fetch right now. It can't be edited in place; upload a
            new version to make further changes.
          </div>
        )}

        {reviewCount > 0 && (
          <div className="rounded-[10px] border border-[rgba(244,196,0,0.35)] bg-[rgba(244,196,0,0.08)] px-[14px] py-[10px] font-['Figtree'] text-[12px] text-[#f4c400]">
            {reviewCount} step{reviewCount === 1 ? "" : "s"} have a note from the .docx parser (usually
            conditional/branching logic it couldn't safely guess) — expand and review each one before making
            this version live.
          </div>
        )}

        {saveError && <p className="font-['Figtree'] text-[13px] text-red-500">{saveError}</p>}
        {savedAt && !saveError && (
          <p className="font-['Figtree'] text-[12px] text-[var(--app-muted)]">Draft saved.</p>
        )}

        <div className="rounded-[10px] border border-[var(--app-border)] bg-[var(--app-surface)] p-[16px]">
          <FormField label="Version Label">
            <TextInput value={versionLabel} onChange={setVersionLabel} />
          </FormField>
        </div>

        <div className="flex flex-col gap-[8px]">
          {steps.map((step, index) => (
            <StepCard
              key={index}
              step={step}
              index={index}
              expanded={expandedIndex === index}
              onToggle={() => setExpandedIndex((cur) => (cur === index ? null : index))}
              onChange={(next) => updateStep(index, next)}
              onDelete={() => deleteStep(index)}
              onMoveUp={() => moveStep(index, -1)}
              onMoveDown={() => moveStep(index, 1)}
              isFirst={index === 0}
              isLast={index === steps.length - 1}
            />
          ))}

          {steps.length === 0 && (
            <div className="rounded-[10px] border border-dashed border-[var(--app-border)] py-[32px] text-center font-['Figtree'] text-[13px] text-[var(--app-muted)]">
              No steps yet.
            </div>
          )}
        </div>

        {!isLive && (
          <button
            type="button"
            onClick={addStep}
            className="flex w-fit items-center gap-[6px] rounded-[8px] border border-dashed border-[var(--app-border-strong)] px-[14px] py-[10px] font-['Figtree'] text-[12px] font-semibold text-[#f37422] hover:bg-[rgba(243,116,34,0.06)]"
          >
            <Plus size={14} /> Add step
          </button>
        )}
      </div>
    </div>
  );
}

export default IntakeScriptEditorPage;
