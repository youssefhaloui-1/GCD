import type { CandidateInfo } from "../../../types/doctoral";

type Props = { value: CandidateInfo; errors: Record<string, string>; onChange: (key: keyof CandidateInfo, value: string) => void };

export default function Step1Personal({ value, errors, onChange }: Props) {
  const fields = [
    ["fullName", "Nom complet"],
    ["email", "Email institutionnel"],
    ["cne", "CNE / MASSAR"],
    ["cin", "CIN"],
    ["phone", "Téléphone"],
  ] as const;
  return <div className="wizard-section"><div className="wizard-section-heading"><div><h3>Profil personnel</h3><p>Identifiez votre dossier avec vos informations officielles.</p></div><span className="badge badge-blue">Étape 1 / 4</span></div><div className="wizard-form-grid">{fields.map(([key, label]) => <label key={key}>{label}<input type={key === "email" ? "email" : "text"} value={value[key]} maxLength={key === "cne" ? 10 : undefined} onChange={(event) => onChange(key, event.target.value)} /><span className="wizard-error">{errors[key]}</span></label>)}<label className="wizard-full-field">Adresse<textarea value={value.address} onChange={(event) => onChange("address", event.target.value)} /><span className="wizard-error">{errors.address}</span></label></div></div>;
}
