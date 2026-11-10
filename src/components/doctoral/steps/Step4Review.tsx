import { useState } from "react";
import { CheckCircle2, Download, Eye, FileText, ShieldCheck } from "lucide-react";
import type { ApplicationState, AttachedFile, ThesisTopic } from "../../../types/doctoral";
import DocumentViewerModal from "../../common/DocumentViewerModal";

type Props = {
  value: ApplicationState;
  topics: ThesisTopic[];
  submitted: boolean;
  onSubmit: () => void;
  onClose: () => void;
};

export default function Step4Review({ value, topics, submitted, onSubmit, onClose }: Props) {
  const [previewDoc, setPreviewDoc] = useState<{ doc: AttachedFile | string; label: string } | null>(null);
  const chosen = value.selectedSubjects.map((id) => topics.find((topic) => topic.id === id)).filter(Boolean) as ThesisTopic[];
  const fileEntries = Object.entries(value.files || {});

  if (submitted) {
    return (
      <div className="wizard-success">
        <div className="success-icon">
          <CheckCircle2 size={36} />
        </div>
        <h3>Candidature transmise avec succès</h3>
        <p>Votre dossier a été enregistré et apparaît désormais en temps réel sur les portails des encadrants et de la direction.</p>
        <div className="receipt-preview">
          <span>GCD USMBA · Récépissé officiel de candidature doctorale</span>
          <strong>{value.fullName}</strong>
          <small>Référence : CAND-{value.cne}-{new Date().getFullYear()}</small>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "8px" }}>
            <span className="badge badge-green">Dossier reçu</span>
            <span className="badge badge-blue">{fileEntries.length} pièce(s) jointe(s)</span>
          </div>
        </div>
        <div className="wizard-actions">
          <button className="button button-secondary" onClick={() => window.print()}>
            <Download size={16} /> Imprimer le récépissé
          </button>
          <button className="button button-primary" onClick={onClose}>
            Retour à l'espace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wizard-section">
      <div className="wizard-section-heading">
        <div>
          <h3>Résumé et confirmation</h3>
          <p>Vérifiez l’exhaustivité de vos données et vos pièces jointes avant la transmission.</p>
        </div>
        <span className="badge badge-green">Étape 4 / 4</span>
      </div>

      <div className="summary-grid">
        <div>
          <span>Profil personnel</span>
          <strong>{value.fullName}</strong>
          <small>{value.cne} · {value.cin} · {value.phone}</small>
          <small>{value.email}</small>
          <small>{value.address}</small>
        </div>

        <div>
          <span>Parcours académique</span>
          <strong>{value.masterDiploma || "Master"}</strong>
          <small>Master : {value.masterYear} · {value.masterUniversity}</small>
          <small>Licence : {value.licenceDiploma} ({value.licenceYear}) · {value.licenceUniversity}</small>
          <small>Bac : {value.bacDiploma} ({value.bacYear}) · {value.bacUniversity}</small>
        </div>

        <div className="wizard-full-summary">
          <span>Sujets de recherche choisis ({chosen.length})</span>
          {chosen.map((topic, index) => (
            <div key={topic.id} style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
              <strong>{index + 1}. {topic.title}</strong>
              <small style={{ display: "block", color: "var(--muted)" }}>{topic.laboratory} · {topic.cedoc} · Encadrant : {topic.supervisor}</small>
            </div>
          ))}
        </div>

        <div className="wizard-full-summary">
          <span>Université d’accueil</span>
          <strong>{value.university || "Non spécifiée"}</strong>
        </div>

        <div className="wizard-full-summary">
          <span>Pièces justificatives & fiches jointes ({fileEntries.length})</span>
          {fileEntries.length === 0 ? (
            <p style={{ fontSize: "11px", color: "#f4c985", marginTop: "4px" }}>
              ⚠️ Aucune pièce jointe n'a été ajoutée. Il est fortement conseillé d'ajouter au minimum votre Master et relevés.
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "8px", marginTop: "8px" }}>
              {fileEntries.map(([label, file]) => {
                const name = typeof file === "string" ? file : file.name;
                const size = typeof file === "object" ? file.size : undefined;
                return (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1, marginRight: "8px" }}>
                      <strong style={{ display: "block", fontSize: "11px" }}>{label}</strong>
                      <small style={{ color: "var(--muted)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", display: "block" }}>
                        {name} {size ? `(${size})` : ""}
                      </small>
                    </div>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => setPreviewDoc({ doc: file, label })}
                      style={{ height: "26px", padding: "0 8px", fontSize: "10px" }}
                      title="Prévisualiser"
                    >
                      <Eye size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
        <button className="button button-primary" onClick={onSubmit} style={{ minHeight: "42px", padding: "0 22px" }}>
          Envoyer ma candidature <CheckCircle2 size={16} />
        </button>
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
