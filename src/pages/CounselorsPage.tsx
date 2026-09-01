import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { useAppContext } from "@/app/app-context";

import { PageHeader } from "@/components/common/PageHeader";
import { SearchBox } from "@/components/common/SearchBox";
import { PrimaryBtn } from "@/components/common/Buttons";
import { MetricCard } from "@/components/common/MetricCard";
import { TableCard, TableHead, TableRow } from "@/components/common/Table";
import { ActionBtn } from "@/components/common/ActionBtn";

import {
  ModalOverlay,
  ModalCard,
  ModalHeader,
  ModalFooter,
} from "@/components/common/Modal";

import {
  FormField,
  TextInput,
  TextArea,
  SelectInput,
} from "@/components/common/FormFields";

import { EyeIcon, EditIcon } from "@/components/icons";

import { ApiError } from "@/lib/api";

import {
  listCounselors,
  getCounselor,
  getCounselorStats,
  updateCounselor,
  deleteCounselor,
  counselorDisplayName,

  COUNSELOR_STATUSES,
  COUNSELOR_STATUS_LABELS,

  COUNSELOR_SPECIALIZATIONS,
  COUNSELOR_SPECIALIZATION_LABELS,

  type ApiCounselor,
  type CounselorStats,
  type CounselorStatus,
  type CounselorSpecialization,
} from "@/lib/counselors";


/* =========================================================
   DISPLAY MODEL
   ========================================================= */

interface DisplayCounselor {
  id: string;
  name: string;
  initials: string;
  role: string;
  specialization: CounselorSpecialization;
  specializationLabel: string;
  avatarUrl: string | null;
  patients: number;
}


/* =========================================================
   API → DISPLAY
   ========================================================= */

function toDisplayCounselor(
  counselor: ApiCounselor
): DisplayCounselor {
  return {
    id: counselor.id,

    name: counselorDisplayName(counselor),

    initials: counselor.initials || "—",

    role: counselor.role || "Licensed Counselor",

    specialization: counselor.specialization,

    specializationLabel:
      counselor.specialization_label ||
      COUNSELOR_SPECIALIZATION_LABELS[counselor.specialization],

    avatarUrl: counselor.avatar_url,

    // Your counselor service uses patient_count.
    patients: counselor.patient_count ?? 0,
  };
}


/* =========================================================
   COUNSELOR DETAIL / VIEW MODAL
   ========================================================= */

function CounselorDetailModal({
  counselorId,
  onClose,
}: {
  counselorId: string;
  onClose: () => void;
}) {
  const [detail, setDetail] =
    useState<ApiCounselor | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getCounselor(counselorId)
      .then((response) => {
        if (!cancelled) {
          setDetail(response);
        }
      })
      .catch((err) => {
        if (cancelled) return;

        setError(
          err instanceof ApiError
            ? err.message
            : "Unable to load counselor details."
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
  }, [counselorId]);


  const counselor = detail
    ? toDisplayCounselor(detail)
    : null;


  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard>

        <ModalHeader
          title="Counselor Profile"
          onClose={onClose}
        />

        {loading && (
          <p className="font-['Figtree'] text-[13px] text-[var(--app-muted)]">
            Loading counselor details...
          </p>
        )}

        {!loading && error && (
          <p className="font-['Figtree'] text-[13px] text-red-500">
            {error}
          </p>
        )}

        {!loading && !error && counselor && (
          <div className="flex flex-col gap-[20px]">

            {/* PROFILE HEADER */}
            <div className="flex items-center gap-[14px]">

              {counselor.avatarUrl ? (
                <img
                  src={counselor.avatarUrl}
                  alt={counselor.name}
                  className="w-[56px] h-[56px] rounded-full flex-shrink-0 object-cover"
                />
              ) : (
                <div className="w-[56px] h-[56px] rounded-full bg-[rgba(243,116,34,0.18)] text-[#f37422] font-['Figtree'] font-bold text-[16px] flex items-center justify-center">
                  {counselor.initials}
                </div>
              )}

              <div>
                <p className="font-['Figtree'] font-bold text-[18px] text-[var(--app-text)]">
                  {counselor.name}
                </p>

                <p className="font-['Figtree'] text-[13px] text-[var(--app-muted)]">
                  {counselor.role}
                </p>
              </div>

            </div>


            {/* PROFESSIONAL INFORMATION */}
            <div>
              <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[var(--app-muted)] mb-[10px]">
                Professional Information
              </p>

              <div className="grid grid-cols-2 gap-[12px]">

                <DetailItem
                  label="Specialization"
                  value={counselor.specializationLabel}
                />

                <DetailItem
                  label="Role"
                  value={counselor.role}
                />

                <DetailItem
                  label="License Number"
                  value={
                    detail.license_number ||
                    "Not provided"
                  }
                />

                <DetailItem
                  label="Status"
                  value={
                    detail.status_label ||
                    COUNSELOR_STATUS_LABELS[
                      detail.status
                    ]
                  }
                />

                <DetailItem
                  label="Patients Assigned"
                  value={String(counselor.patients)}
                />

              </div>
            </div>


            {/* CONTACT INFORMATION */}
            <div>
              <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[var(--app-muted)] mb-[10px]">
                Contact Information
              </p>

              <div className="grid grid-cols-2 gap-[12px]">

                <DetailItem
                  label="First Name"
                  value={
                    detail.first_name ||
                    "Not provided"
                  }
                />

                <DetailItem
                  label="Last Name"
                  value={
                    detail.last_name ||
                    "Not provided"
                  }
                />

                <DetailItem
                  label="Email"
                  value={
                    detail.email ||
                    "Not provided"
                  }
                />

                <DetailItem
                  label="Phone"
                  value={
                    detail.phone ||
                    "Not provided"
                  }
                />

              </div>
            </div>


            {/* NOTES */}
            <div>
              <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[var(--app-muted)] mb-[10px]">
                Notes / Credentials
              </p>

              <div className="rounded-[9px] bg-[var(--app-surface)] border border-[var(--app-border)] p-[14px]">

                <p className="font-['Figtree'] text-[13px] leading-[20px] text-[var(--app-text)] whitespace-pre-wrap">
                  {detail.notes_credentials?.trim()
                    ? detail.notes_credentials
                    : "No notes or credentials provided."}
                </p>

              </div>
            </div>


            {/* RECORD INFORMATION */}
            <div>
              <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[var(--app-muted)] mb-[10px]">
                Record Information
              </p>

              <div className="grid grid-cols-2 gap-[12px]">

                <DetailItem
                  label="Created"
                  value={formatDate(detail.created_at)}
                />

                <DetailItem
                  label="Last Updated"
                  value={formatDate(detail.updated_at)}
                />

              </div>
            </div>

          </div>
        )}

        <ModalFooter
          onCancel={onClose}
          onConfirm={onClose}
          confirmLabel="Close"
        />

      </ModalCard>
    </ModalOverlay>
  );
}


/* =========================================================
   DETAIL ITEM
   ========================================================= */

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[9px] bg-[var(--app-surface)] border border-[var(--app-border)] p-[12px]">

      <p className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-wider text-[var(--app-muted)]">
        {label}
      </p>

      <p className="mt-[4px] font-['Figtree'] font-semibold text-[13px] text-[var(--app-text)] break-words">
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   DATE FORMATTER
   ========================================================= */

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}


/* =========================================================
   EDIT COUNSELOR MODAL
   Same fields as Add Counselor
   Email is READ ONLY
   ========================================================= */

function EditCounselorModal({
  counselor,
  onClose,
  onSaved,
}: {
  counselor: ApiCounselor;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [firstName, setFirstName] =
    useState(counselor.first_name ?? "");

  const [lastName, setLastName] =
    useState(counselor.last_name ?? "");

  /*
   * Email intentionally has NO setter.
   * It is displayed but cannot be edited.
   */
  const email = counselor.email ?? "";

  const [phone, setPhone] =
    useState(counselor.phone ?? "");

  const [specialization, setSpecialization] =
    useState<CounselorSpecialization>(
      counselor.specialization
    );

  const [licenseNumber, setLicenseNumber] =
    useState(counselor.license_number ?? "");

  const [status, setStatus] =
    useState<CounselorStatus>(
      counselor.status
    );

  const [notes, setNotes] =
    useState(counselor.notes_credentials ?? "");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  const handleSubmit = async () => {

    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (!lastName.trim()) {
      setError("Last name is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {

      /*
       * IMPORTANT:
       * Email is NOT included in this PATCH.
       * The backend keeps the existing email.
       */
      await updateCounselor(counselor.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        specialization,
        license_number: licenseNumber.trim(),
        status,
        notes_credentials: notes.trim(),
      });

      onSaved();
      onClose();

    } catch (err) {

      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to save changes. Please try again."
      );

    } finally {
      setSubmitting(false);
    }
  };


  return (
    <ModalOverlay onClose={onClose}>

      <ModalCard>

        <ModalHeader
          title={`Edit ${counselorDisplayName(counselor)}`}
          onClose={onClose}
        />

        <div className="flex flex-col gap-[16px] mt-[8px]">

          {/* FIRST NAME / LAST NAME */}
          <div className="flex gap-[16px] flex-wrap">

            <div className="flex-1 min-w-[180px]">

              <FormField
                label="First Name"
                required
              >
                <TextInput
                  placeholder="Marcus"
                  value={firstName}
                  onChange={setFirstName}
                />
              </FormField>

            </div>


            <div className="flex-1 min-w-[180px]">

              <FormField
                label="Last Name"
                required
              >
                <TextInput
                  placeholder="Kerr"
                  value={lastName}
                  onChange={setLastName}
                />
              </FormField>

            </div>

          </div>


          {/* EMAIL / PHONE */}
          <div className="flex gap-[16px] flex-wrap">

            <div className="flex-1 min-w-[180px]">

              <FormField label="Email">

                <TextInput
                  type="email"
                  value={email}
                  onChange={() => {}}
                  disabled
                />

              </FormField>

              <p className="mt-[5px] font-['Figtree'] text-[10px] text-[var(--app-muted)]">
                Email cannot be changed.
              </p>

            </div>


            <div className="flex-1 min-w-[180px]">

              <FormField label="Phone">

                <TextInput
                  type="tel"
                  placeholder="+1 (555) 382-9014"
                  value={phone}
                  onChange={setPhone}
                />

              </FormField>

            </div>

          </div>


          {/* SPECIALIZATION / LICENSE */}
          <div className="flex gap-[16px] flex-wrap">

            <div className="flex-1 min-w-[180px]">

              <FormField label="Specialization">

                <SelectInput
                  options={COUNSELOR_SPECIALIZATIONS.map(
                    (specialization) =>
                      COUNSELOR_SPECIALIZATION_LABELS[
                        specialization
                      ]
                  )}
                  value={
                    COUNSELOR_SPECIALIZATION_LABELS[
                      specialization
                    ]
                  }
                  onChange={(label) => {

                    const selected =
                      COUNSELOR_SPECIALIZATIONS.find(
                        (specialization) =>
                          COUNSELOR_SPECIALIZATION_LABELS[
                            specialization
                          ] === label
                      );

                    if (selected) {
                      setSpecialization(selected);
                    }

                  }}
                />

              </FormField>

            </div>


            <div className="flex-1 min-w-[180px]">

              <FormField label="License Number">

                <TextInput
                  placeholder="LCSW-9810442"
                  value={licenseNumber}
                  onChange={setLicenseNumber}
                />

              </FormField>

            </div>

          </div>


          {/* STATUS */}
          <div className="flex gap-[16px] flex-wrap">

            <div className="flex-1 min-w-[180px]">

              <FormField label="Status">

                <SelectInput
                  options={COUNSELOR_STATUSES.map(
                    (status) =>
                      COUNSELOR_STATUS_LABELS[status]
                  )}
                  value={
                    COUNSELOR_STATUS_LABELS[status]
                  }
                  onChange={(label) => {

                    const selected =
                      COUNSELOR_STATUSES.find(
                        (status) =>
                          COUNSELOR_STATUS_LABELS[
                            status
                          ] === label
                      );

                    if (selected) {
                      setStatus(selected);
                    }

                  }}
                />

              </FormField>

            </div>

            <div className="flex-1 min-w-[180px]" />

          </div>


          {/* NOTES */}
          <FormField label="Notes / Credentials">

            <TextArea
              placeholder="Specializes in CBT and DBT pathways for substance recovery. Primary point of contact for outpatient crisis assessments."
              value={notes}
              onChange={setNotes}
            />

          </FormField>


          {error && (
            <p className="font-['Figtree'] text-[13px] text-red-500">
              {error}
            </p>
          )}

        </div>


        <ModalFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel={
            submitting
              ? "Saving..."
              : "Save changes"
          }
          confirmDisabled={submitting}
        />

      </ModalCard>

    </ModalOverlay>
  );
}


/* =========================================================
   COUNSELORS PAGE
   ========================================================= */

export function CounselorsPage() {

  const {
    setModal,
    counselorsVersion,
    bumpCounselorsVersion,
  } = useAppContext();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);


  const [counselors, setCounselors] =
    useState<DisplayCounselor[]>([]);


  const [totalCount, setTotalCount] =
    useState<number | null>(null);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState<string | null>(null);


  const [stats, setStats] =
    useState<CounselorStats | null>(null);


  const [statsError, setStatsError] =
    useState<string | null>(null);


  const [viewCounselorId, setViewCounselorId] =
    useState<string | null>(null);


  /*
   * IMPORTANT:
   * Edit now stores the COMPLETE ApiCounselor,
   * not DisplayCounselor.
   */
  const [editCounselor, setEditCounselor] =
    useState<ApiCounselor | null>(null);


  const [deletingId, setDeletingId] =
    useState<string | null>(null);


  const [deleteError, setDeleteError] =
    useState<string | null>(null);


  /* =====================================================
     LOAD COUNSELORS
     ===================================================== */

  useEffect(() => {

    let cancelled = false;

    setLoading(true);
    setError(null);

    listCounselors({ search, page, page_size: 10 })
      .then((response) => {

        if (cancelled) return;

        setCounselors(
          response.results.map(
            toDisplayCounselor
          )
        );

        setTotalCount(response.count);
        setHasNext(Boolean(response.next));
        setHasPrev(Boolean(response.previous));

      })
      .catch((err) => {

        if (cancelled) return;

        setError(
          err instanceof ApiError
            ? err.message
            : "Unable to load counselors."
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

  }, [counselorsVersion, search, page]);

  useEffect(() => setPage(1), [search]);


  /* =====================================================
     LOAD STATS
     ===================================================== */

  useEffect(() => {

    let cancelled = false;

    setStatsError(null);

    getCounselorStats()
      .then((response) => {

        if (!cancelled) {
          setStats(response);
        }

      })
      .catch((err) => {

        if (cancelled) return;

        setStatsError(
          err instanceof ApiError
            ? err.message
            : "Unable to load stats."
        );

      });

    return () => {
      cancelled = true;
    };

  }, [counselorsVersion]);


  const filtered = counselors;


  /* =====================================================
     AVG PATIENTS
     ===================================================== */

  const avgPatients =
    stats &&
    stats.total_counselors > 0
      ? Math.round(
          (stats.total_patients_assigned /
            stats.total_counselors) *
            10
        ) / 10
      : 0;


  /* =====================================================
     DELETE
     ===================================================== */

  const handleDelete = async (
    counselor: DisplayCounselor
  ) => {

    if (
      !window.confirm(
        `Delete ${counselor.name}? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(counselor.id);
    setDeleteError(null);

    try {

      await deleteCounselor(
        counselor.id
      );

      bumpCounselorsVersion();

    } catch (err) {

      setDeleteError(
        err instanceof ApiError
          ? err.message
          : "Unable to delete counselor. Please try again."
      );

    } finally {

      setDeletingId(null);

    }
  };


  /* =====================================================
     EDIT
     ===================================================== */

  const handleEdit = async (
    counselorId: string
  ) => {

    try {

      setError(null);

      /*
       * Get complete counselor record.
       * This is important because the table only
       * keeps display information.
       */
      const counselor =
        await getCounselor(counselorId);

      setEditCounselor(counselor);

    } catch (err) {

      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to load counselor for editing."
      );

    }
  };


  /* =====================================================
     RENDER
     ===================================================== */

  return (

    <div className="flex-1 min-w-0 overflow-y-auto">

      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">


        {/* =================================================
            HEADER
            ================================================= */}

        <PageHeader
          eyebrow={
            totalCount !== null
              ? `${totalCount} TOTAL COUNSELORS`
              : "LOADING COUNSELORS…"
          }
          title="Counselor Management"
        >

          <SearchBox placeholder="Search counselors..." value={search} onChange={setSearch} />

          <PrimaryBtn
            label="+ Add Counselor"
            onClick={() =>
              setModal("add-counselor")
            }
          />

        </PageHeader>


        {/* =================================================
            ERRORS
            ================================================= */}

        {error && (
          <p className="font-['Figtree'] text-[13px] text-red-500">
            {error}
          </p>
        )}

        {statsError && (
          <p className="font-['Figtree'] text-[13px] text-red-500">
            {statsError}
          </p>
        )}

        {deleteError && (
          <p className="font-['Figtree'] text-[13px] text-red-500">
            {deleteError}
          </p>
        )}


        {/* =================================================
            STATISTICS
            ================================================= */}

        <div className="flex gap-[10px] flex-wrap">

          <MetricCard
            label="TOTAL COUNSELORS"
            value={
              stats
                ? String(
                    stats.total_counselors
                  )
                : "—"
            }
            delta="Live from server"
            deltaColor="#8a8073"
            accentColor="#f37422"
          />

          <MetricCard
            label="TOTAL PATIENTS ASSIGNED"
            value={
              stats
                ? String(
                    stats.total_patients_assigned
                  )
                : "—"
            }
            delta="Live from server"
            deltaColor="#8a8073"
            accentColor="#4ade80"
          />

          <MetricCard
            label="AVG PATIENTS / COUNSELOR"
            value={
              stats
                ? String(avgPatients)
                : "—"
            }
            delta="Live from server"
            deltaColor="#8a8073"
            accentColor="#6b8ab0"
          />

        </div>


        {/* =================================================
            COUNSELOR TABLE
            ================================================= */}

        <TableCard>

          <div className="overflow-x-auto">

            <div className="min-w-[720px]">

              <TableHead
                cols={[
                  {
                    label: "COUNSELOR",
                    w: "flex-1 min-w-[220px]",
                  },
                  {
                    label: "SPECIALIZATION",
                    w: "w-[220px]",
                  },
                  {
                    label: "ROLE",
                    w: "w-[180px]",
                  },
                  {
                    label: "ACTIONS",
                    w: "w-[100px] text-right",
                  },
                ]}
              />


              {/* LOADING */}

              {loading && (
                <div className="py-[48px] text-center">

                  <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">
                    Loading counselors...
                  </p>

                </div>
              )}


              {/* DATA */}

              {!loading &&
                !error &&
                filtered.map((c) => (

                  <TableRow key={c.id}>

                    {/* COUNSELOR */}

                    <div className="flex items-center gap-[10px] flex-1 min-w-[220px]">

                      {c.avatarUrl ? (

                        <img
                          src={c.avatarUrl}
                          alt={c.name}
                          className="w-[32px] h-[32px] rounded-full flex-shrink-0 object-cover"
                        />

                      ) : (

                        <div className="w-[32px] h-[32px] rounded-full bg-[rgba(243,116,34,0.2)] flex items-center justify-center flex-shrink-0">

                          <span className="font-['Figtree'] font-bold text-[#f37422] text-[11px]">
                            {c.initials}
                          </span>

                        </div>

                      )}

                      <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[13px] leading-tight">
                        {c.name}
                      </p>

                    </div>


                    {/* SPECIALIZATION */}

                    <div className="w-[220px] font-['Figtree'] font-normal text-[var(--app-text)] text-[12px]">

                      {c.specializationLabel}

                    </div>


                    {/* ROLE */}

                    <div className="w-[180px] font-['Figtree'] font-normal text-[var(--app-text)] text-[12px]">

                      {c.role}

                    </div>


                    {/* ACTIONS */}

                    <div className="w-[100px] flex items-center justify-end gap-[10px]">

                      {/* VIEW */}

                      <ActionBtn
                        onClick={() =>
                          setViewCounselorId(
                            c.id
                          )
                        }
                        title="View"
                        icon={<EyeIcon />}
                      />


                      {/* EDIT */}

                      <ActionBtn
                        onClick={() =>
                          handleEdit(c.id)
                        }
                        title="Edit"
                        icon={<EditIcon />}
                      />


                      {/* DELETE */}

                      <ActionBtn
                        onClick={() =>
                          handleDelete(c)
                        }
                        title="Delete counselor"
                        disabled={
                          deletingId === c.id
                        }
                        icon={
                          <Trash2
                            size={15}
                            strokeWidth={1.8}
                          />
                        }
                      />

                    </div>

                  </TableRow>

                ))}


              {/* EMPTY */}

              {!loading &&
                !error &&
                filtered.length === 0 && (

                  <div className="py-[48px] text-center">

                    <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">

                      {counselors.length === 0
                        ? "No counselors yet."
                        : "No counselors match your search."}

                    </p>

                  </div>

                )}

            </div>

          </div>

        </TableCard>

        <div className="flex items-center justify-between border-t border-[var(--app-border)] px-[13px] py-[10px]"><span className="font-['JetBrains_Mono'] text-[8px] text-[var(--app-muted)]">Page {page} · {totalCount ?? 0} counselors</span><div className="flex items-center gap-[4px]"><button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={!hasPrev || loading} className="px-2 py-1 border rounded disabled:opacity-30">‹</button><span className="px-2 py-1 rounded bg-[#f37422] text-[#15110e]">{page}</span><button type="button" onClick={() => setPage((value) => value + 1)} disabled={!hasNext || loading} className="px-2 py-1 border rounded disabled:opacity-30">›</button></div></div>


        {/* =================================================
            VIEW MODAL
            ================================================= */}

        {viewCounselorId && (

          <CounselorDetailModal
            counselorId={
              viewCounselorId
            }
            onClose={() =>
              setViewCounselorId(null)
            }
          />

        )}


        {/* =================================================
            EDIT MODAL
            ================================================= */}

        {editCounselor && (

          <EditCounselorModal
            counselor={editCounselor}
            onClose={() =>
              setEditCounselor(null)
            }
            onSaved={
              bumpCounselorsVersion
            }
          />

        )}

      </div>

    </div>
  );
}
