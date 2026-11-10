import { ChangeEvent, useState } from "react";
import { Eye, FileCheck, Trash2, Upload } from "lucide-react";
import type { AcademicDegree, AttachedFile } from "../../../types/doctoral";
import DocumentViewerModal from "../../common/DocumentViewerModal";

type Props = {
  degrees: { bac: AcademicDegree; licence: AcademicDegree; master: AcademicDegree };
  files: Record<string, string | AttachedFile>;
  errors: Record<string, string>;
  onDegreeChange: (degree: "bac" | "licence" | "master", key: keyof AcademicDegree, value: string) => void;
  onFile: (event: ChangeEvent<HTMLInputElement>, label: string) => void;
  onRemoveFile?: (label: string) => void;
};

const labels = { bac: "Baccalauréat", licence: "Licence", master: "Master" };

// Fixed and predefined required files - strictly restricted without custom addition
const fixedFileLabels = [
  "Diplôme ou attestation Bac",
  "Diplôme Licence",
  "Diplôme Master",
  "Relevés de notes",
  "CV détaillé",
  "Projet de recherche",
];

export default function Step2Academic({
  degrees,
  files,
  errors,
  onDegreeChange,
  onFile,
  onRemoveFile,
}: Props) {
  const [previewDoc, setPreviewDoc] = useState<{ doc: AttachedFile | string; label: string } | null>(null);

  return (
    <div className="wizard-section">
      <div className="wizard-section-heading">
        <div>
          <h3>Parcours académique & Justificatifs</h3>
          <p>Renseignez vos diplômes obligatoires et déposez les justificatifs requis (PDF, JPEG, PNG).</p>
        </div>
        <span className="badge badge-blue">Étape 2 / 4</span>
      </div>

      {/* Fixed Predefined Degrees */}
      {(["bac", "licence", "master"] as const).map((degree) => (
        <div className="academic-block" key={degree}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>{labels[degree]}</strong>
            <span style={{ fontSize: "10px", color: "var(--muted)" }}>Diplôme certifié</span>
          </div>
          <div className="wizard-form-grid">
            {(["diploma", "year", "university"] as const).map((key) => (
              <label key={key}>
                {key === "diploma" ? "Intitulé du diplôme" : key === "year" ? "Année d’obtention" : "Université / établissement"}
                <input
                  value={degrees[degree][key]}
                  onChange={(event) => onDegreeChange(degree, key, event.target.value)}
                  placeholder={
                    key === "diploma"
                      ? degree === "bac" ? "Ex. Sciences Mathématiques B" : degree === "licence" ? "Ex. Licence Fondamentale SMI" : "Ex. Master Recherche Informatique"
                      : key === "year" ? "Ex. 2024" : "Ex. Faculté des Sciences de Fès"
                  }
                />
                <span className="wizard-error">{errors[`${degree}${key.charAt(0).toUpperCase()}${key.slice(1)}`]}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Fixed Predefined Attachments - Strictly Locked */}
      <div style={{ marginTop: "24px", marginBottom: "14px" }}>
        <strong style={{ fontSize: "13px", display: "block" }}>Pièces jointes & Fiches obligatoires</strong>
        <span style={{ fontSize: "11px", color: "var(--muted)" }}>
          Champs prédéfinis obligatoires. Chaque document téléversé sera examiné et certifié par la commission.
        </span>
      </div>

      <div className="upload-grid">
        {fixedFileLabels.map((label) => {
          const fileEntry = files[label];
          const hasFile = Boolean(fileEntry);
          const fileName = typeof fileEntry === "string" ? fileEntry : fileEntry?.name;
          const fileSize = typeof fileEntry === "object" ? fileEntry?.size : undefined;

          return (
            <div
              className={`upload-box ${hasFile ? "upload-box-filled" : ""}`}
              key={label}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "12px",
                border: hasFile ? "1px solid rgba(104, 221, 168, 0.4)" : "1px dashed rgba(125, 134, 242, 0.45)",
                borderRadius: "10px",
                background: hasFile ? "rgba(104, 221, 168, 0.05)" : "var(--primary-soft)",
                minHeight: "135px",
                transition: "all 0.2s ease",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {hasFile ? <FileCheck size={16} color="#68dda8" /> : <Upload size={16} color="#9da6ff" />}
                    <strong style={{ fontSize: "11px", color: hasFile ? "#68dda8" : "var(--text)" }}>{label}</strong>
                  </div>
                  {hasFile && (
                    <span className="badge badge-green" style={{ fontSize: "9px", padding: "2px 6px" }}>
                      Prêt
                    </span>
                  )}
                </div>

                <small style={{ display: "block", color: "var(--muted)", fontSize: "10px", wordBreak: "break-all", lineHeight: 1.3 }}>
                  {hasFile ? `${fileName} ${fileSize ? `(${fileSize})` : ""}` : "Glisser un fichier ou cliquer pour parcourir"}
                </small>
              </div>

              <div style={{ marginTop: "10px", display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                {hasFile ? (
                  <>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => setPreviewDoc({ doc: fileEntry, label })}
                      style={{ height: "28px", padding: "0 8px", fontSize: "10px", flex: 1 }}
                      title="Prévisualiser ce document"
                    >
                      <Eye size={12} /> Consulter
                    </button>
                    {onRemoveFile && (
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => onRemoveFile(label)}
                        style={{ height: "28px", width: "28px", padding: 0, color: "#ff8296" }}
                        title="Supprimer ce document"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                    <label
                      style={{
                        height: "28px",
                        padding: "0 8px",
                        fontSize: "10px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        color: "var(--muted)",
                      }}
                      title="Remplacer le fichier"
                    >
                      <span>Remplacer</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        style={{ display: "none" }}
                        onChange={(e) => onFile(e, label)}
                      />
                    </label>
                  </>
                ) : (
                  <label
                    style={{
                      width: "100%",
                      height: "30px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      background: "rgba(105, 117, 245, 0.15)",
                      border: "1px solid rgba(105, 117, 245, 0.3)",
                      borderRadius: "7px",
                      cursor: "pointer",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#aeb5ff",
                    }}
                  >
                    <Upload size={12} /> Déposer cette pièce
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      style={{ display: "none" }}
                      onChange={(e) => onFile(e, label)}
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {previewDoc && (
        <DocumentViewerModal
          document={previewDoc.doc}
          label={previewDoc.label}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
