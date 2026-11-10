import { ChangeEvent } from "react";
import type { AcademicDegree } from "../../../types/doctoral";

type Props = { degrees: { bac: AcademicDegree; licence: AcademicDegree; master: AcademicDegree }; files: Record<string, string>; errors: Record<string, string>; onDegreeChange: (degree: "bac" | "licence" | "master", key: keyof AcademicDegree, value: string) => void; onFile: (event: ChangeEvent<HTMLInputElement>, label: string) => void };
const labels = { bac: "Baccalauréat", licence: "Licence", master: "Master" };
const fileLabels = ["Relevés de notes", "Diplôme Licence", "Diplôme Master", "CV détaillé"];

export default function Step2Academic({ degrees, files, errors, onDegreeChange, onFile }: Props) {
  return <div className="wizard-section"><div className="wizard-section-heading"><div><h3>Parcours académique</h3><p>Renseignez vos diplômes, établissements et années.</p></div><span className="badge badge-blue">Étape 2 / 4</span></div>{(["bac", "licence", "master"] as const).map((degree) => <div className="academic-block" key={degree}><strong>{labels[degree]}</strong><div className="wizard-form-grid">{(["diploma", "year", "university"] as const).map((key) => <label key={key}>{key === "diploma" ? "Diplôme" : key === "year" ? "Année d’obtention" : "Université / établissement"}<input value={degrees[degree][key]} onChange={(event) => onDegreeChange(degree, key, event.target.value)} /><span className="wizard-error">{errors[`${degree}${key.charAt(0).toUpperCase()}${key.slice(1)}`]}</span></label>)}</div></div>)}<div className="upload-grid">{fileLabels.map((label) => <label className="upload-box" key={label}><strong>{label}</strong><small>{files[label] || "PDF ou JPEG"}</small><input type="file" accept=".pdf,.jpg,.jpeg" onChange={(event) => onFile(event, label)} /></label>)}</div></div>;
}
