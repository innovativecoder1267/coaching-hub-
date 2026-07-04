"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase.client";

/**
 * SettingsPanel
 * -------------
 * Drop-in settings component for a coaching-hub app (Next.js App Router).
 *
 * Reads + updates the `profile` table (RLS-protected, so we only ever
 * filter by the logge    text
 *   city                 text
 *   onboarding_complete  boolean
 *   fee_cycle            text   ("monthly" | "quarterly" | "yearly")
 *
 * USAGE
 * -----
 *   <SettingsPanel />
 *
 * That's it — no props required. It creates its own browser Supabase
 * client via `createClient()` from "@/lib/supabase/client" (the
 * @supabase/ssr browser client convention), and redirects to /login on
 * sign-out or missing session by default.
 *d-in user's own id):
 *   purpose              text
 *   institute_name   
 * If your client file exports something other than `createClient`, or
 * lives somewhere other than "@/lib/supabase/client", just adjust the
 * import above. If your `profile` table links to the user via a column
 * other than `id`, change PROFILE_ID_COLUMN below. If you'd rather
 * redirect somewhere other than /login, pass onLogout / onAuthRequired.
 */

const PROFILE_ID_COLUMN = "owner_info";

type FeeCycle = "monthly" | "quarterly" | "yearly";

interface Profile {
  purpose: string | null;
  institute_name: string | null;
  city: string | null;
  onboarding_complete: boolean;
  fee_cycle: FeeCycle | string | null;
}

type EditableField = "institute_name" | "city" | "purpose";

interface SettingsPanelProps {
  /** Called after a successful sign-out. Defaults to redirecting to /login. */
  onLogout?: () => void;
  /** Called if no active session is found while loading the profile. Defaults to redirecting to /login. */
  onAuthRequired?: () => void;
  className?: string;
}

const FEE_CYCLES: FeeCycle[] = ["monthly", "quarterly", "yearly"];

const FIELD_META: Record<
  EditableField,
  { label: string; placeholder: string }
> = {
  institute_name: { label: "Institute name", placeholder: "e.g. Aurora Learning Co." },
  city: { label: "City", placeholder: "e.g. Pune" },
  purpose: { label: "Purpose", placeholder: "e.g. JEE / NEET coaching" },
};

export default function SettingsPanel({
  onLogout,
  onAuthRequired,
  className,
}: SettingsPanelProps) {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [savingField, setSavingField] = useState<EditableField | null>(null);
  const [justSavedField, setJustSavedField] = useState<EditableField | null>(null);

  const [savingCycle, setSavingCycle] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.getUser();

      if (!active) return;
      if(error) {
        console.error("Error fetching user:", error);
        setError("Couldn't load your profile. Try refreshing.");
        setLoading(false);
        return;
      }
      console.log("Current user:", data?.user?.id);
      if (data) {
        setUserId(data?.user?.id ?? null);
       }


      const {data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("purpose, institute_name, city, onboarding_complete, fee_cycle")
        .eq(PROFILE_ID_COLUMN, data?.user?.id)
        .single();
      if (!active) return;

      if (profileError) {
        setError("Couldn't load your profile. Try refreshing.");
        console.log("SUPABASE ERROR:", profileError);
      } else {
        setProfile(profileData as Profile);
      }
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, [supabase, onAuthRequired, router]);

  useEffect(() => {
    if (editingField) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingField]);

  function startEdit(field: EditableField) {
    if (!profile) return;
    setEditingField(field);
    setDraftValue(profile[field] ?? "");
  }

  function cancelEdit() {
    setEditingField(null);
    setDraftValue("");
  }

  async function saveEdit(field: EditableField) {
    if (!userId || !profile) return;
    const trimmed = draftValue.trim()
    console.log("User id",userId, "saving field", field, "with value", trimmed,"profile", profile)
    setSavingField(field);
 const { data, error:updateError } = await supabase
  .from("profiles")
  .update({ [field]: trimmed })
  .eq(PROFILE_ID_COLUMN, userId)
  .select();

  console.log("Fetched profile data for saving:", data, "Error:", updateError )
 
    if (updateError) {
      setError(`Couldn't save ${FIELD_META[field].label.toLowerCase()}.`);
      console.error("SUPABASE ERROR:", updateError);
      return;
    }
    setProfile((prev) => (prev ? { ...prev, [field]: trimmed } : prev));
    setEditingField(null);
    setJustSavedField(field);
    console.log(`Saved ${field}:`, trimmed,"Data is",data,"Error is",updateError  )
    setTimeout(() => setJustSavedField(null), 1600);
  }

  async function changeFeeCycle(cycle: FeeCycle) {
    if (!userId || !profile || profile.fee_cycle === cycle || savingCycle) return;
    setSavingCycle(true);
    const prevCycle = profile.fee_cycle;
    setProfile({ ...profile, fee_cycle: cycle }); // optimistic

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ fee_cycle: cycle })
      .eq(PROFILE_ID_COLUMN, userId);

    setSavingCycle(false);

    if (updateError) {
      setProfile((prev) => (prev ? { ...prev, fee_cycle: prevCycle } : prev));
      setError("Couldn't update the fee cycle.");
      console.log("SUPABASE ERROR:", updateError)
    }
    console.log(`Changed fee cycle to:`, cycle)
  }

  async function handleLogout() {
    setLoggingOut(true);
    const { error: signOutError } = await supabase.auth.signOut();
    setLoggingOut(false);

    if (signOutError) {
      setError("Couldn't log out. Try again.");
      return;
    }
    setShowLogoutConfirm(false);

    if (onLogout) {
      onLogout();
    } else {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <div className={`ch-settings ${className ?? ""}`}>
      <style>{CSS}</style>

      <div className="ch-card">
        {loading ? (
          <SkeletonState />
        ) : error && !profile ? (
          <ErrorState message={error} />
        ) : profile ? (
          <>
            <header className="ch-header">
              <div className="ch-header-text">
                <span className="ch-eyebrow">Coaching profile</span>
                <h2 className="ch-institute-name">
                  {profile.institute_name || "Untitled institute"}
                </h2>
                <p className="ch-city">
                  <PinIcon/>
                  {profile.city || "City not set"}
                </p>
              </div>
              <OnboardingStamp complete={profile.onboarding_complete} />
            </header>

            {error && <div className="ch-banner">{error}</div>}

            <div className="ch-ledger">
              <LedgerRow
                field="institute_name"
                value={profile.institute_name}
                editing={editingField === "institute_name"}
                saving={savingField === "institute_name"}
                justSaved={justSavedField === "institute_name"}
                draftValue={draftValue}
                inputRef={inputRef}
                onStart={() => startEdit("institute_name")}
                onChange={setDraftValue}
                onSave={() => saveEdit("institute_name")}
                onCancel={cancelEdit}
              />
              <LedgerRow
                field="city"
                value={profile.city}
                editing={editingField === "city"}
                saving={savingField === "city"}
                justSaved={justSavedField === "city"}
                draftValue={draftValue}
                inputRef={inputRef}
                onStart={() => startEdit("city")}
                onChange={setDraftValue}
                onSave={() => saveEdit("city")}
                onCancel={cancelEdit}
              />
              <LedgerRow
                field="purpose"
                value={profile.purpose}
                editing={editingField === "purpose"}
                saving={savingField === "purpose"}
                justSaved={justSavedField === "purpose"}
                draftValue={draftValue}
                inputRef={inputRef}
                onStart={() => startEdit("purpose")}
                onChange={setDraftValue}
                onSave={() => saveEdit("purpose")}
                onCancel={cancelEdit}
              />

              <div className="ch-row ch-row--static">
                <div className="ch-row-label">Fee cycle</div>
                <div className="ch-segmented" role="tablist" aria-label="Fee cycle">
                  {FEE_CYCLES.map((cycle) => (
                    <button
                      key={cycle}
                      role="tab"
                      type="button"
                      aria-selected={profile.fee_cycle === cycle}
                      className={`ch-segment ${
                        profile.fee_cycle === cycle ? "is-active" : ""
                      }`}
                      onClick={() => changeFeeCycle(cycle)}
                      disabled={savingCycle}
                    >
                      {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <footer className="ch-footer">
              <button
                type="button"
                className="ch-logout-btn"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <LogoutIcon />
                Log out
              </button>
            </footer>
          </>
        ) : null}
      </div>

      {showLogoutConfirm && (
        <div
          className="ch-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLogoutConfirm(false);
          }}
        >
          <div className="ch-modal">
            <h3>Log out of this account?</h3>
            <p>You'll need to sign in again to manage your coaching.</p>
            <div className="ch-modal-actions">
              <button
                type="button"
                className="ch-btn-ghost"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ch-btn-danger"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging out…" : "Log out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- rows --------------------------------- */

interface LedgerRowProps {
  field: EditableField;
  value: string | null;
  editing: boolean;
  saving: boolean;
  justSaved: boolean;
  draftValue: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onStart: () => void;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}
                        
function LedgerRow({
  field,
  value,
  editing,
  saving,
  justSaved,
  draftValue,
  inputRef,
  onStart,
  onChange,
  onSave,
  onCancel,
}: LedgerRowProps) {
  const meta = FIELD_META[field];

  return (
    <div className={`ch-row ${editing ? "is-editing" : ""}`}>
      <div className="ch-row-label">{meta.label}</div>

      {editing ? (
        <div className="ch-row-edit">
          <input
            ref={inputRef}
            className="ch-input"
            value={draftValue}
            placeholder={meta.placeholder}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave();
              if (e.key === "Escape") onCancel();
            }}
          />
          <button
            type="button"
            className="ch-icon-btn ch-icon-btn--confirm"
            onClick={onSave}
            disabled={saving}
            aria-label="Save"
          >
            {saving ? <Spinner /> : <CheckIcon />}
          </button>
          <button
            type="button"
            className="ch-icon-btn"
            onClick={onCancel}
            disabled={saving}
            aria-label="Cancel"
          >
            <CloseIcon />
          </button>
        </div>
      ) : (
        <button type="button" className="ch-row-value" onClick={onStart}>
          <span className={value ? "" : "ch-row-value--empty"}>
            {value || meta.placeholder}
          </span>
          <span className={`ch-row-status ${justSaved ? "is-visible" : ""}`}>
            <CheckIcon /> Saved
          </span>
          <PencilIcon className="ch-row-pencil" />
        </button>
      )}
    </div>
  );
}

/* ------------------------------- sub-views -------------------------------- */

function OnboardingStamp({ complete }: { complete: boolean }) {
  return (
    <div
      className={`ch-stamp ${complete ? "ch-stamp--complete" : "ch-stamp--pending"}`}
      title={complete ? "Onboarding complete" : "Onboarding pending"}
    >
      <span>{complete ? "Enrolled" : "Pending"}</span>
    </div>
  );
}

function SkeletonState() {
  return (
    <div className="ch-skeleton" aria-busy="true" aria-label="Loading settings">
      <div className="ch-skeleton-line ch-skeleton-line--wide" />
      <div className="ch-skeleton-line ch-skeleton-line--mid" />
      <div className="ch-skeleton-block" />
      <div className="ch-skeleton-block" />
      <div className="ch-skeleton-block" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="ch-empty">
      <p>{message}</p>
    </div>
  );
}

/* ---------------------------------- icons --------------------------------- */

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-6.2 7-11.3A7 7 0 0 0 5 9.7C5 14.8 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16.5 3.5 20 7 8 19l-4.5 1L4.5 15.5 16.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
      <path
        d="M5 13l4.5 4.5L19 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <path
        d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner() {
  return <span className="ch-spinner" aria-hidden="true" />;
}

/* ----------------------------------- css ----------------------------------- */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');

.ch-settings {
  --ink: #1c2740;
  --ink-soft: #5b5749;
  --parchment: #fbf8f2;
  --parchment-dim: #f1ecdf;
  --rule: #e1d8c2;
  --amber: #c07f1f;
  --amber-deep: #9c6512;
  --moss: #3f6b53;
  --moss-dim: #e7efe9;
  --pending: #a9663a;
  --pending-dim: #f4e7da;
  --danger: #a8392f;
  --danger-dim: #f6e6e3;
  --shadow: 0 10px 30px -12px rgba(28, 39, 64, 0.18);

  font-family: 'Inter', system-ui, sans-serif;
  color: var(--ink);
  max-width: 520px;
  width: 100%;
  position: relative;
}

.ch-card {
  background: var(--parchment);
  border: 1px solid var(--rule);
  border-radius: 18px;
  box-shadow: var(--shadow);
  overflow: hidden;
  animation: ch-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes ch-fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.ch-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 28px 22px;
  border-bottom: 1px solid var(--rule);
}

.ch-eyebrow {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--amber-deep);
  margin-bottom: 6px;
}

.ch-institute-name {
  font-family: 'Fraunces', serif;
  font-size: 26px;
  font-weight: 600;
  line-height: 1.15;
  margin: 0 0 6px;
  color: var(--ink);
}

.ch-city {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 13.5px;
  color: var(--ink-soft);
}

.ch-stamp {
  flex-shrink: 0;
  border: 2px solid var(--moss);
  color: var(--moss);
  border-radius: 999px;
  padding: 7px 16px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transform: rotate(-6deg);
  animation: ch-stamp-in 0.5s 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  white-space: nowrap;
}

.ch-stamp--pending {
  border-color: var(--pending);
  color: var(--pending);
}

@keyframes ch-stamp-in {
  from { opacity: 0; transform: rotate(-6deg) scale(0.6); }
  to { opacity: 1; transform: rotate(-6deg) scale(1); }
}

.ch-banner {
  margin: 16px 28px 0;
  padding: 10px 14px;
  background: var(--danger-dim);
  color: var(--danger);
  border-radius: 10px;
  font-size: 13px;
}

.ch-ledger {
  padding: 6px 28px 8px;
}

.ch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid var(--rule);
  transition: background 0.2s ease;
}

.ch-row:last-child {
  border-bottom: none;
}

.ch-row-label {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-soft);
  flex-shrink: 0;
  width: 120px;
}

.ch-row-value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 15px;
  color: var(--ink);
  padding: 6px 10px;
  border-radius: 8px;
  text-align: right;
  transition: background 0.18s ease, transform 0.18s ease;
}

.ch-row-value:hover {
  background: var(--parchment-dim);
}

.ch-row-value:hover .ch-row-pencil {
  opacity: 1;
  transform: translateX(0);
}

.ch-row-value--empty {
  color: #a59c87;
  font-style: italic;
}

.ch-row-pencil {
  opacity: 0;
  transform: translateX(-4px);
  color: var(--amber-deep);
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.ch-row-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--moss);
  font-size: 12px;
  font-weight: 600;
  opacity: 0;
  transform: translateY(-2px);
  transition: opacity 0.25s ease, transform 0.25s ease;
  pointer-events: none;
}

.ch-row-status.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.ch-row-edit {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}

.ch-input {
  flex: 1;
  font-family: inherit;
  font-size: 15px;
  color: var(--ink);
  background: #fff;
  border: 1.5px solid var(--amber);
  border-radius: 8px;
  padding: 7px 10px;
  outline: none;
  min-width: 0;
}

.ch-input:focus {
  box-shadow: 0 0 0 3px rgba(192, 127, 31, 0.18);
}

.ch-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 7px;
  border: 1px solid var(--rule);
  background: #fff;
  color: var(--ink-soft);
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.ch-icon-btn:hover {
  transform: translateY(-1px);
  background: var(--parchment-dim);
}

.ch-icon-btn--confirm {
  color: var(--moss);
  border-color: var(--moss);
}

.ch-icon-btn--confirm:hover {
  background: var(--moss-dim);
}

.ch-icon-btn:disabled {
  opacity: 0.6;
  cursor: default;
  transform: none;
}

.ch-row--static {
  align-items: center;
}

.ch-segmented {
  display: inline-flex;
  background: var(--parchment-dim);
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
}

.ch-segment {
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-soft);
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 7px 13px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.ch-segment:hover:not(.is-active) {
  color: var(--ink);
  background: rgba(255, 255, 255, 0.6);
}

.ch-segment.is-active {
  background: var(--ink);
  color: var(--parchment);
  box-shadow: 0 3px 8px -3px rgba(28, 39, 64, 0.45);
}

.ch-segment:disabled {
  cursor: default;
}

.ch-footer {
  padding: 18px 28px 26px;
  display: flex;
  justify-content: flex-end;
}

.ch-logout-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--danger);
  background: var(--danger-dim);
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 9px 16px;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
}

.ch-logout-btn:hover {
  background: var(--danger);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 6px 14px -6px rgba(168, 57, 47, 0.55);
}

/* modal */

.ch-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(28, 39, 64, 0.45);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  animation: ch-overlay-in 0.18s ease both;
}

@keyframes ch-overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ch-modal {
  background: var(--parchment);
  border-radius: 16px;
  padding: 26px;
  width: min(360px, 88vw);
  box-shadow: 0 24px 48px -16px rgba(28, 39, 64, 0.4);
  animation: ch-modal-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes ch-modal-in {
  from { opacity: 0; transform: translateY(8px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.ch-modal h3 {
  font-family: 'Fraunces', serif;
  font-size: 19px;
  margin: 0 0 8px;
}

.ch-modal p {
  font-size: 13.5px;
  color: var(--ink-soft);
  margin: 0 0 20px;
}

.ch-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.ch-btn-ghost,
.ch-btn-danger {
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  border-radius: 9px;
  padding: 9px 16px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: transform 0.15s ease, background 0.15s ease;
}

.ch-btn-ghost {
  background: var(--parchment-dim);
  color: var(--ink-soft);
}

.ch-btn-ghost:hover {
  background: var(--rule);
}

.ch-btn-danger {
  background: var(--danger);
  color: #fff;
}

.ch-btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px -6px rgba(168, 57, 47, 0.55);
}

.ch-btn-ghost:disabled,
.ch-btn-danger:disabled {
  opacity: 0.6;
  cursor: default;
  transform: none;
}

/* loading + error states */

.ch-skeleton {
  padding: 28px;
}

.ch-skeleton-line {
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--parchment-dim) 25%, var(--rule) 37%, var(--parchment-dim) 63%);
  background-size: 400% 100%;
  animation: ch-shimmer 1.3s ease infinite;
  margin-bottom: 10px;
}

.ch-skeleton-line--wide { width: 60%; height: 20px; }
.ch-skeleton-line--mid { width: 38%; margin-bottom: 26px; }

.ch-skeleton-block {
  height: 46px;
  border-radius: 8px;
  margin-bottom: 12px;
  background: linear-gradient(90deg, var(--parchment-dim) 25%, var(--rule) 37%, var(--parchment-dim) 63%);
  background-size: 400% 100%;
  animation: ch-shimmer 1.3s ease infinite;
}

@keyframes ch-shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: 0 0; }
}

.ch-empty {
  padding: 40px 28px;
  text-align: center;
  color: var(--ink-soft);
  font-size: 14px;
}

.ch-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(63, 107, 83, 0.3);
  border-top-color: var(--moss);
  border-radius: 50%;
  display: inline-block;
  animation: ch-spin 0.6s linear infinite;
}

@keyframes ch-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .ch-row { flex-direction: column; align-items: flex-start; gap: 8px; }
  .ch-row-value, .ch-row-edit { width: 100%; justify-content: flex-start; }
  .ch-row-status { display: none; }
  .ch-header { flex-direction: column; }
}

@media (prefers-reduced-motion: reduce) {
  .ch-card, .ch-stamp, .ch-modal-overlay, .ch-modal, .ch-skeleton-line, .ch-skeleton-block, .ch-spinner {
    animation: none !important;
  }
}
`;
