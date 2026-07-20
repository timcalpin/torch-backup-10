import { useState } from "react";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter, SectionLabel } from "@/components/common/Modal";
import { FormField, TextInput, TextArea, SelectInput } from "@/components/common/FormFields";

export function AddContentModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"Media" | "Literature">("Media");
  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard wide>
        <ModalHeader title="Add Content" onClose={onClose} />
        {/* Tab bar */}
        <div className="relative border-b border-[var(--app-border)] mb-[24px]">
          <div className="flex">
            {(["Media", "Literature"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-[20px] py-[12px] font-['Figtree'] text-[14px] cursor-pointer transition-colors relative ${
                  tab === t ? "font-semibold text-[#f37422]" : "font-medium text-[var(--app-muted)] hover:text-[var(--app-text)]"
                }`}
              >
                {t === "Media" ? "Media Content" : "Literature"}
                {tab === t && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f37422]" />}
              </button>
            ))}
          </div>
        </div>

        {tab === "Media" ? (
          <div className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[16px]">
              <SectionLabel label="Basic Info" />
              <FormField label="Title" required><TextInput placeholder="e.g. Healing Trauma Through Meditation" /></FormField>
              <div className="flex gap-[16px] flex-wrap">
                <div className="flex-1 min-w-[180px]"><FormField label="Creator"><TextInput placeholder="e.g. Dr. Sarah Chen" /></FormField></div>
                <div className="flex-1 min-w-[180px]"><FormField label="Content Type"><SelectInput options={["Audio", "Video", "Podcast", "Meditation", "Text"]} /></FormField></div>
              </div>
              <div className="flex gap-[16px] flex-wrap">
                <div className="flex-1 min-w-[180px]"><FormField label="Category"><SelectInput options={["Meditation", "Recovery", "Wellness", "Stress Relief", "Self Care"]} /></FormField></div>
                <div className="flex-1 min-w-[180px]"><FormField label="Difficulty Level"><SelectInput options={["Beginner", "Intermediate", "Advanced"]} /></FormField></div>
              </div>
              <div className="flex gap-[16px] flex-wrap">
                <div className="flex-1 min-w-[180px]"><FormField label="Topic (Optional)"><TextInput placeholder="e.g. Breathwork" /></FormField></div>
                <div className="flex-1 min-w-[180px]"><FormField label="Emotion (Optional)"><TextInput placeholder="e.g. Anxiety, Calm" /></FormField></div>
              </div>
            </div>
            <div className="flex flex-col gap-[16px]">
              <SectionLabel label="Media" />
              <FormField label="Media URL" required><TextInput placeholder="https://..." /></FormField>
              <div className="flex gap-[16px] flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <FormField label="Thumbnail">
                    <div className="relative bg-[var(--app-surface)] h-[80px] rounded-[10px] border border-dashed border-[#8a8073] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#f37422] transition-colors">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4V16M4 10H16" stroke="#F37422" strokeWidth="2" strokeLinecap="round" /></svg>
                      <span className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[12px]">Upload Thumbnail</span>
                    </div>
                  </FormField>
                </div>
                <div className="w-[160px]">
                  <FormField label="Duration">
                    <div className="flex gap-[8px] items-center">
                      <TextInput placeholder="15" />
                      <span className="font-['JetBrains_Mono'] text-[var(--app-muted)] text-[12px]">:</span>
                      <TextInput placeholder="00" />
                    </div>
                  </FormField>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-[16px]">
              <SectionLabel label="Details" />
              <FormField label="Description"><TextArea placeholder="Provide a brief overview..." rows={3} /></FormField>
              <div className="flex gap-[16px] flex-wrap">
                <div className="flex-1 min-w-[180px]"><FormField label="Status"><SelectInput options={["Draft", "Published", "Archived"]} /></FormField></div>
                <div className="flex-1 min-w-[180px]">
                  <FormField label="Featured Status">
                    <div className="relative bg-[var(--app-surface)] h-[44px] rounded-[10px]">
                      <div className="absolute inset-0 rounded-[10px] border border-[var(--app-border)] pointer-events-none" />
                      <div className="flex items-center justify-between px-[14px] h-full">
                        <span className="font-['Figtree'] font-normal text-[var(--app-text)] text-[14px]">Feature this content</span>
                        <div className="w-[36px] h-[20px] rounded-full bg-[var(--app-surface)] border border-[var(--app-border)] flex items-center px-[3px] cursor-pointer">
                          <div className="w-[14px] h-[14px] rounded-full bg-[#8a8073]" />
                        </div>
                      </div>
                    </div>
                  </FormField>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[16px]">
              <SectionLabel label="Literature Details" />
              <FormField label="Title" required><TextInput placeholder="e.g. The Science of Relapse Prevention" /></FormField>
              <div className="flex gap-[16px] flex-wrap">
                <div className="flex-1 min-w-[180px]"><FormField label="Category"><SelectInput options={["Recovery", "Spirituality", "Meditation", "Education", "Self Help"]} /></FormField></div>
                <div className="flex-1 min-w-[180px]">
                  <FormField label="Featured Status">
                    <div className="relative bg-[var(--app-surface)] h-[44px] rounded-[10px]">
                      <div className="absolute inset-0 rounded-[10px] border border-[var(--app-border)] pointer-events-none" />
                      <div className="flex items-center justify-between px-[14px] h-full">
                        <span className="font-['Figtree'] font-normal text-[var(--app-text)] text-[14px]">Feature this</span>
                        <div className="w-[36px] h-[20px] rounded-full bg-[var(--app-surface)] border border-[var(--app-border)] flex items-center px-[3px] cursor-pointer">
                          <div className="w-[14px] h-[14px] rounded-full bg-[#8a8073]" />
                        </div>
                      </div>
                    </div>
                  </FormField>
                </div>
              </div>
              <FormField label="Description (Optional)"><TextArea placeholder="Brief summary for the in-app literature library..." rows={3} /></FormField>
            </div>
            <div className="flex flex-col gap-[16px]">
              <SectionLabel label="Files" />
              <FormField label="PDF File" required>
                <div className="relative bg-[var(--app-surface)] h-[120px] rounded-[10px] border border-dashed border-[#8a8073] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#f37422] transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#F37422" strokeWidth="1.5" strokeLinecap="round" /><path d="M14 2v6h6M8 13h8M8 17h5" stroke="#F37422" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[12px]">Upload PDF File</p>
                  <p className="font-['Figtree'] font-normal text-[var(--app-muted)] text-[12px]">PDF only · Max 50MB</p>
                </div>
              </FormField>
              <FormField label="Thumbnail (Optional)">
                <div className="relative bg-[var(--app-surface)] h-[80px] rounded-[10px] border border-dashed border-[#8a8073] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#f37422] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4V16M4 10H16" stroke="#F37422" strokeWidth="2" strokeLinecap="round" /></svg>
                  <span className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[12px]">Upload Thumbnail</span>
                </div>
              </FormField>
            </div>
          </div>
        )}
        <ModalFooter onCancel={onClose} onConfirm={onClose} confirmLabel={tab === "Media" ? "Add Content" : "Add Literature"} />
      </ModalCard>
    </ModalOverlay>
  );
}
