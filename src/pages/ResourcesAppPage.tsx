import { useState } from "react";
import { useAppContext } from "@/app/app-context";
import { PageHeader } from "@/components/common/PageHeader";
import { GhostBtn, PrimaryBtn } from "@/components/common/Buttons";
import { MetricCard } from "@/components/common/MetricCard";
import { TableCard, TableHead, TableRow } from "@/components/common/Table";
import { StatusPill } from "@/components/common/StatusPill";
import { Toggle } from "@/components/common/Toggle";
import { ActionBtn } from "@/components/common/ActionBtn";
import { FilterIcon, EditIcon, MicIcon, VideoIcon, BookIcon, SparklesIcon, FileIcon } from "@/components/icons";

const CONTENT_ITEMS = [
  { id: 1, title: "Healing Addiction — Tara Brach", creator: "Tara Brach", type: "Meditation", category: "meditation", difficulty: "Intermediate", duration: "38 min", status: "ACTIVE" as const, featured: true, plays: 2847 },
  { id: 2, title: "Guided Meditation for Cravings", creator: "Dr. Chen", type: "Meditation", category: "self_care", difficulty: "Beginner", duration: "12 min", status: "ACTIVE" as const, featured: false, plays: 1204 },
  { id: 3, title: "15 Minute Meditation For Anxiety", creator: "Sarah K.", type: "Audio", category: "stress_relief", difficulty: "Beginner", duration: "15 min", status: "ACTIVE" as const, featured: false, plays: 987 },
  { id: 4, title: "Understanding Relapse Patterns", creator: "Dr. Metz", type: "Video", category: "recovery", difficulty: "Intermediate", duration: "22 min", status: "ACTIVE" as const, featured: true, plays: 1543 },
  { id: 5, title: "Morning Sobriety Affirmations", creator: "Maria L.", type: "Audio", category: "self_care", difficulty: "Beginner", duration: "8 min", status: "ACTIVE" as const, featured: false, plays: 756 },
];

const LITERATURE_ITEMS = [
  { id: 1, title: "Alcoholics Anonymous (Big Book)", category: "Recovery", featured: true, uploaded: "Jun 12, 2025" },
  { id: 2, title: "Twelve Steps and Twelve Traditions", category: "Recovery", featured: false, uploaded: "Jun 10, 2025" },
  { id: 3, title: "The Power of Now", category: "Spirituality", featured: true, uploaded: "Jun 8, 2025" },
  { id: 4, title: "Mindfulness in Plain English", category: "Meditation", featured: true, uploaded: "Jun 5, 2025" },
  { id: 5, title: "In the Realm of Hungry Ghosts", category: "Education", featured: false, uploaded: "Jun 2, 2025" },
];

const CONTENT_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Meditation: { bg: "rgba(243,116,34,0.15)", color: "#f37422" },
  Audio: { bg: "rgba(107,138,176,0.15)", color: "#6b8ab0" },
  Video: { bg: "rgba(74,222,128,0.15)", color: "#4ade80" },
  Podcast: { bg: "rgba(163,115,143,0.15)", color: "#a3738f" },
  Text: { bg: "rgba(183,163,110,0.15)", color: "#b7a36e" },
};

const CONTENT_TABS = ["All", "Audio", "Video", "Podcast", "Meditation", "Text", "Literature"];

export function ResourcesAppPage() {
  const { setModal } = useAppContext();
  const [activeTab, setActiveTab] = useState("All");

  const isLiterature = activeTab === "Literature";
  const filteredContent = isLiterature
    ? []
    : CONTENT_ITEMS.filter((c) => activeTab === "All" || c.type === activeTab);

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        <PageHeader eyebrow="CONTENT · 142 ITEMS · 6 CATEGORIES · 12K PLAYS THIS WEEK" title="In-App Resources">
          <GhostBtn label="Filter" icon={<FilterIcon />} />
          <GhostBtn label="Export" />
          <PrimaryBtn label="+ Add Content" onClick={() => setModal("add-content")} />
        </PageHeader>

        <div className="flex gap-[10px] flex-wrap">
          <MetricCard label="TOTAL CONTENT" value="142" delta="↑ +8% vs last month" deltaColor="#4ade80" accentColor="#f37422" />
          <MetricCard label="TOTAL PLAYS" value="12,401" delta="↑ +12% vs last month" deltaColor="#4ade80" accentColor="#4ade80" />
          <MetricCard label="AVG COMPLETION" value="68%" delta="↑ +4% vs last month" deltaColor="#4ade80" accentColor="#6b8ab0" />
          <MetricCard label="PUBLISHED" value="98" delta="↑ +2% vs last month" deltaColor="#4ade80" accentColor="#facc15" />
        </div>

        <TableCard>
          {/* Type tabs */}
          <div className="px-[18px] py-[12px] border-b border-[var(--app-border)]">
            <div className="flex items-center gap-[4px] flex-wrap">
              {CONTENT_TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] font-['Figtree'] text-[12px] cursor-pointer transition-all ${
                    activeTab === t
                      ? "bg-[rgba(243,116,34,0.15)] text-[#f37422] font-bold border border-[rgba(243,116,34,0.3)]"
                      : "text-[var(--app-muted)] font-medium border border-transparent hover:text-[var(--app-text)]"
                  }`}
                >
                  {t === "Audio" && <MicIcon color={activeTab === t ? "#f37422" : "#8a8073"} />}
                  {t === "Video" && <VideoIcon color={activeTab === t ? "#f37422" : "#8a8073"} />}
                  {t === "Literature" && <BookIcon color={activeTab === t ? "#f37422" : "#8a8073"} />}
                  {t}
                  {(t === "All" || t === "Literature") && (
                    <span className={`font-['JetBrains_Mono'] font-bold text-[9px] px-[5px] py-[2px] rounded-[4px] ${activeTab === t ? "bg-[rgba(243,116,34,0.15)] text-[#f37422]" : "bg-[rgba(138,128,115,0.1)] text-[var(--app-muted)]"}`}>
                      {t === "All" ? "142" : "8"}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {!isLiterature ? (
            <div className="overflow-x-auto">
              <div className="min-w-[860px]">
                <TableHead cols={[
                  { label: "CONTENT", w: "flex-1 min-w-[220px]" },
                  { label: "TYPE", w: "w-[110px]" },
                  { label: "CATEGORY", w: "w-[110px]" },
                  { label: "DIFFICULTY", w: "w-[110px]" },
                  { label: "DURATION", w: "w-[90px]" },
                  { label: "STATUS", w: "w-[100px]" },
                  { label: "FEATURED", w: "w-[90px]" },
                  { label: "PLAYS", w: "w-[70px]" },
                  { label: "ACTIONS", w: "w-[60px] text-right" },
                ]} />
                {filteredContent.map((item) => {
                  const tc = CONTENT_TYPE_COLORS[item.type] ?? { bg: "rgba(138,128,115,0.15)", color: "#8a8073" };
                  return (
                    <TableRow key={item.id}>
                      <div className="flex items-center gap-[10px] flex-1 min-w-[220px]">
                        <div className="w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: tc.bg }}>
                          {item.type === "Audio" && <MicIcon color={tc.color} />}
                          {item.type === "Video" && <VideoIcon color={tc.color} />}
                          {item.type === "Meditation" && <SparklesIcon color={tc.color} />}
                          {!["Audio", "Video", "Meditation"].includes(item.type) && <FileIcon color={tc.color} />}
                        </div>
                        <div>
                          <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[13px] leading-tight">{item.title}</p>
                          <p className="font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[9px] leading-tight">{item.creator}</p>
                        </div>
                      </div>
                      <div className="w-[110px]">
                        <span className="inline-flex px-[8px] py-[3px] rounded-[4px] font-['JetBrains_Mono'] font-bold text-[10px]" style={{ background: tc.bg, color: tc.color }}>
                          {item.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="w-[110px] font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[11px]">{item.category}</div>
                      <div className="w-[110px] font-['Figtree'] font-normal text-[var(--app-text)] text-[12px]">{item.difficulty}</div>
                      <div className="w-[90px] font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[11px]">{item.duration}</div>
                      <div className="w-[100px]"><StatusPill status={item.status} /></div>
                      <div className="w-[90px]"><Toggle on={item.featured} /></div>
                      <div className="w-[70px] font-['JetBrains_Mono'] font-bold text-[var(--app-text)] text-[12px]">{item.plays.toLocaleString()}</div>
                      <div className="w-[60px] flex items-center justify-end gap-[10px]">
                        <ActionBtn onClick={() => {}} title="Edit" icon={<EditIcon />} />
                      </div>
                    </TableRow>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <TableHead cols={[
                  { label: "CONTENT", w: "flex-1 min-w-[220px]" },
                  { label: "CATEGORY", w: "w-[140px]" },
                  { label: "FEATURED", w: "w-[100px]" },
                  { label: "UPLOADED", w: "w-[130px]" },
                  { label: "ACTIONS", w: "w-[70px] text-right" },
                ]} />
                {LITERATURE_ITEMS.map((item) => (
                  <TableRow key={item.id}>
                    <div className="flex items-center gap-[10px] flex-1 min-w-[220px]">
                      <div className="w-[32px] h-[32px] rounded-full bg-[rgba(183,163,110,0.2)] flex items-center justify-center flex-shrink-0">
                        <BookIcon color="#b7a36e" />
                      </div>
                      <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[13px]">{item.title}</p>
                    </div>
                    <div className="w-[140px]">
                      <span className="inline-flex px-[8px] py-[3px] rounded-[4px] bg-[rgba(183,163,110,0.15)] font-['JetBrains_Mono'] font-bold text-[10px] text-[#b7a36e]">
                        {item.category.toUpperCase()}
                      </span>
                    </div>
                    <div className="w-[100px]"><Toggle on={item.featured} /></div>
                    <div className="w-[130px] font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[11px]">{item.uploaded}</div>
                    <div className="w-[70px] flex items-center justify-end gap-[10px]">
                      <ActionBtn onClick={() => {}} title="Edit" icon={<EditIcon />} />
                    </div>
                  </TableRow>
                ))}
              </div>
            </div>
          )}
        </TableCard>
      </div>
    </div>
  );
}
