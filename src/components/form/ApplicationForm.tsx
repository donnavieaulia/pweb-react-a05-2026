import { useEffect, useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";
import type { Application, WorkMode } from "../../types";
import { WORK_MODES } from "../../types";
import {
  createApplication,
  isDuplicateApplication,
  parseSkills,
} from "../../utils/application";
import type { NewApplicationInput } from "../../utils/application";
import "./form.css";

type InitialStatus = NewApplicationInput["status"];

interface FormValues {
  company: string;
  role: string;
  workMode: WorkMode;
  status: InitialStatus;
  skillsText: string;
  cvVersion: string;
  appliedDate: string;
}

type FieldName =
  | "company"
  | "role"
  | "skillsText"
  | "cvVersion"
  | "appliedDate";
type FormErrors = Partial<Record<FieldName, string>>;

// Urutan field dari atas ke bawah -> dipakai untuk cari "error pertama"
const FIELD_ORDER: FieldName[] = [
  "company",
  "role",
  "skillsText",
  "cvVersion",
  "appliedDate",
];

const INITIAL_VALUES: FormValues = {
  company: "",
  role: "",
  workMode: "Remote",
  status: "WISHLIST",
  skillsText: "",
  cvVersion: "",
  appliedDate: "",
};

interface ApplicationFormProps {
  applications: Application[];
  onAdd: (application: Application) => void;
  onClose: () => void;
}

function validate(values: FormValues, applications: Application[]): FormErrors {
  const errors: FormErrors = {};

  if (values.company.trim() === "")
    errors.company = "Nama perusahaan wajib diisi.";
  if (values.role.trim() === "") errors.role = "Posisi/role wajib diisi.";
  if (parseSkills(values.skillsText).length === 0) {
    errors.skillsText = "Isi minimal 1 skill, pisahkan dengan koma.";
  }

  if (values.status === "APPLIED") {
    if (values.cvVersion.trim() === "")
      errors.cvVersion = "Versi CV wajib diisi untuk status APPLIED.";
    if (values.appliedDate === "")
      errors.appliedDate = "Tanggal melamar wajib diisi untuk status APPLIED.";
  }

  // Anti-duplikat hanya dicek kalau company & role sudah terisi
  if (
    !errors.company &&
    !errors.role &&
    isDuplicateApplication(applications, values.company, values.role)
  ) {
    errors.company = `Lamaran ${values.company.trim()} — ${values.role.trim()} sudah ada.`;
  }

  return errors;
}

function ApplicationForm({
  applications,
  onAdd,
  onClose,
}: ApplicationFormProps) {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");

  // useRef: "pegangan" langsung ke elemen input di DOM, untuk .focus()
  const companyRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLInputElement>(null);
  const skillsRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const fieldRefs: Record<FieldName, RefObject<HTMLInputElement | null>> = {
    company: companyRef,
    role: roleRef,
    skillsText: skillsRef,
    cvVersion: cvRef,
    appliedDate: dateRef,
  };

  // Saat form dibuka, langsung fokus ke input Perusahaan
  useEffect(() => {
    companyRef.current?.focus();
  }, []);

  /** Update 1 field secara immutable + hapus error field itu. */
  function updateField<K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSuccessMessage("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newErrors = validate(values, applications);
    setErrors(newErrors);

    const firstError = FIELD_ORDER.find(
      (field) => newErrors[field] !== undefined,
    );
    if (firstError) {
      fieldRefs[firstError].current?.focus();
      return;
    }

    const isApplied = values.status === "APPLIED";
    const newApp = createApplication({
      company: values.company,
      role: values.role,
      workMode: values.workMode,
      status: values.status,
      requiredSkills: parseSkills(values.skillsText),
      cvVersion: isApplied ? values.cvVersion.trim() : undefined,
      appliedDate: isApplied ? values.appliedDate : undefined,
      logMessage: isApplied
        ? `Lamaran dikirim (CV: ${values.cvVersion.trim()})`
        : "Dicatat manual ke Wishlist",
    });

    onAdd(newApp);
    setSuccessMessage(
      `Lamaran ${newApp.company} — ${newApp.role} berhasil dicatat.`,
    );
    setValues(INITIAL_VALUES);
    companyRef.current?.focus();
  }

  function inputClass(field: FieldName): string {
    return errors[field] ? "input input--error" : "input";
  }

  return (
    <section className="kotak">
      <div className="kotak__header kotak__header--hijau form-header">
        <h2 className="section-title">Catat Lamaran Manual</h2>
        <button
          type="button"
          className="form-close"
          onClick={onClose}
          aria-label="Tutup form"
        >
          ×
        </button>
      </div>

      <form className="kotak__body app-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="company">Perusahaan</label>
          <input
            id="company"
            ref={companyRef}
            className={inputClass("company")}
            value={values.company}
            onChange={(e) => updateField("company", e.target.value)}
            placeholder="misal: Nusantara Cloud Tech"
          />
          {errors.company && <p className="error-text">{errors.company}</p>}
        </div>

        <div className="field">
          <label htmlFor="role">Posisi / Role</label>
          <input
            id="role"
            ref={roleRef}
            className={inputClass("role")}
            value={values.role}
            onChange={(e) => updateField("role", e.target.value)}
            placeholder="misal: Frontend Intern"
          />
          {errors.role && <p className="error-text">{errors.role}</p>}
        </div>

        <div className="field">
          <label htmlFor="workMode">Mode Kerja</label>
          <select
            id="workMode"
            className="select"
            value={values.workMode}
            onChange={(e) =>
              updateField("workMode", e.target.value as WorkMode)
            }
          >
            {WORK_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="status">Status Awal</label>
          <select
            id="status"
            className="select"
            value={values.status}
            onChange={(e) =>
              updateField("status", e.target.value as InitialStatus)
            }
          >
            <option value="WISHLIST">WISHLIST</option>
            <option value="APPLIED">APPLIED</option>
          </select>
        </div>

        <div className="field field--full">
          <label htmlFor="skills">Required Skills</label>
          <input
            id="skills"
            ref={skillsRef}
            className={inputClass("skillsText")}
            value={values.skillsText}
            onChange={(e) => updateField("skillsText", e.target.value)}
            placeholder="pisahkan dengan koma, misal: React, TypeScript, CSS"
          />
          {errors.skillsText && (
            <p className="error-text">{errors.skillsText}</p>
          )}
        </div>

        {/* Input kondisional: hanya muncul kalau Status Awal = APPLIED */}
        {values.status === "APPLIED" && (
          <>
            <div className="field">
              <label htmlFor="cvVersion">Versi CV</label>
              <input
                id="cvVersion"
                ref={cvRef}
                className={inputClass("cvVersion")}
                value={values.cvVersion}
                onChange={(e) => updateField("cvVersion", e.target.value)}
                placeholder="misal: Kapten-CV-v2.pdf"
              />
              {errors.cvVersion && (
                <p className="error-text">{errors.cvVersion}</p>
              )}
            </div>

            <div className="field">
              <label htmlFor="appliedDate">Tanggal Melamar</label>
              <input
                id="appliedDate"
                ref={dateRef}
                type="date"
                className={inputClass("appliedDate")}
                value={values.appliedDate}
                onChange={(e) => updateField("appliedDate", e.target.value)}
              />
              {errors.appliedDate && (
                <p className="error-text">{errors.appliedDate}</p>
              )}
            </div>
          </>
        )}

        <div className="form-actions field--full">
          {successMessage && <p className="success-text">{successMessage}</p>}
          <button type="button" className="btn" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn--primary">
            Simpan Lamaran
          </button>
        </div>
      </form>
    </section>
  );
}

export default ApplicationForm;
