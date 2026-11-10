import { useState } from "react";
import { Check, CheckCircle2, Download, Eye, FileCheck2, FileText, ShieldCheck } from "lucide-react";
import { mockApplications } from "../../data/mockData";
import type { AttachedFile, Candidate } from "../../types/doctoral";
import type { CandidateStatus } from "../../domain/gcd";
import DocumentViewerModal from "../common/DocumentViewerModal";

const checklist = [
  "Original du BAC",
  "Diplôme ou attestation Master",
  "Relevés de notes originaux",
  "CIN / passeport",
  "Charte des thèses signée",
];

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "amber" | "blue" | "red" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

interface AdminProps {
  candidates?: Candidate[];
  onStatusChange?: (id: string, status: CandidateStatus) => void;
  onToggleDocumentVerify?: (candidateId: string, label: string) => void;
}

export default function AdminValidationDashboard({
  candidates: propCandidates,
  onStatusChange,
  onToggleDocumentVerify,
}: AdminProps) {
  const candidateList = propCandidates && propCandidates.length > 0 ? propCandidates : (mockApplications as any as Candidate[]);
  const [candidateId, setCandidateId] = useState(candidateList[0]?.id || "c1");
  const [checked, setChecked] = useState<string[]>([]);
  const [validated, setValidated] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ doc: AttachedFile | string; label: string; isVerified: boolean } | null>(null);

  const selected = candidateList.find((c) => c.id === candidateId) || candidateList[0] || {
    id: "none",
    fullName: "Aucun candidat",
    name: "Aucun candidat",
    cne: "0000",
    email: "",
    university: "",
    files: {},
  };

  const toggle = (item: string) =>
    setChecked((items) => (items.includes(item) ? items.filter((value) => value !== item) : [...items, item]));

  const complete = checked.length === checklist.length;
  const files = selected.files || {};
  const fileEntries = Object.entries(files);

  const handleFinalize = () => {
    setValidated(true);
    onStatusChange?.(selected.id, "accepted");
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">DIRECTION ADMINISTRATIVE & CEDOC</p>
          <h1>Validation administrative & Inscriptions</h1>
          <p className="subheading">
            Contrôlez les pièces déposées en ligne, vérifiez le dossier physique et délivrez le récépissé officiel.
          </p>
        </div>
        <Badge tone={validated ? "green" : "amber"}>
          {validated ? "Inscription finalisée" : "Vérification en cours"}
        </Badge>
      </div>

      <div className="admin-layout">
        {/* Dossier Numérique & Physique */}
        <section className="card admin-card">
          <div className="section-heading">
            <div>
              <h2>Pièces jointes & Dossier physique</h2>
              <p>Sélectionnez un candidat pour examiner les documents téléversés et originaux.</p>
            </div>
            <FileCheck2 size={20} className="muted-icon" />
          </div>

          <label className="admin-select" style={{ marginBottom: "16px" }}>
            Candidat à traiter
            <select
              value={candidateId}
              onChange={(event) => {
                setCandidateId(event.target.value);
                setChecked([]);
                setValidated(false);
              }}
            >
              {candidateList.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.fullName || application.name} · {application.cne}
                </option>
              ))}
            </select>
          </label>

          {/* Section Pièces Dématérialisées */}
          <div style={{ marginBottom: "20px" }}>
            <strong style={{ fontSize: "12px", display: "block", marginBottom: "8px" }}>
              Justificatifs dématérialisés ({fileEntries.length})
            </strong>
            {fileEntries.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "11px" }}>Aucune pièce jointe transmise en ligne.</p>
            ) : (
              <div style={{ display: "grid", gap: "6px" }}>
                {fileEntries.map(([label, file]) => {
                  const fileName = typeof file === "string" ? file : file.name;
                  const isVerified = typeof file === "object" ? Boolean(file.verified) : false;

                  return (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1, marginRight: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <strong>{label}</strong>
                          {isVerified ? (
                            <span className="badge badge-green" style={{ fontSize: "9px", padding: "1px 5px" }}>
                              Vérifié
                            </span>
                          ) : (
                            <span className="badge badge-amber" style={{ fontSize: "9px", padding: "1px 5px" }}>
                              En attente
                            </span>
                          )}
                        </div>
                        <small style={{ color: "var(--muted)", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {fileName}
                        </small>
                      </div>

                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() => setPreviewDoc({ doc: file, label, isVerified })}
                          style={{ height: "28px", padding: "0 8px", fontSize: "10px" }}
                        >
                          <Eye size={12} /> Consulter
                        </button>
                        <button
                          type="button"
                          className={`button ${isVerified ? "button-secondary" : "button-primary"}`}
                          onClick={() => onToggleDocumentVerify?.(selected.id, label)}
                          style={{ height: "28px", padding: "0 8px", fontSize: "10px" }}
                        >
                          <Check size={12} /> {isVerified ? "Certifié" : "Valider"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <strong style={{ fontSize: "12px", display: "block", marginBottom: "8px" }}>
            Vérification des originaux au guichet
          </strong>
          <div className="physical-checklist">
            {checklist.map((item) => (
              <label key={item}>
                <input type="checkbox" checked={checked.includes(item)} onChange={() => toggle(item)} />
                <span>{item}</span>
                {checked.includes(item) && <Check size={16} />}
              </label>
            ))}
          </div>
        </section>

        {/* Validation finale */}
        <section className="card admin-card">
          <div className="section-heading">
            <div>
              <h2>Attribution du numéro officiel</h2>
              <p>Validation administrative et enregistrement au registre doctoral.</p>
            </div>
            <ShieldCheck size={20} className="muted-icon" />
          </div>

          <div className="admin-candidate">
            <div className="profile-large-avatar">
              {(selected.fullName || selected.name || "CD").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <strong>{selected.fullName || selected.name}</strong>
              <span>{selected.email}</span>
              <small>{selected.university}</small>
              <div style={{ marginTop: "4px" }}>
                <span className="badge badge-blue">Sujet : {selected.selectedTopic || selected.subject}</span>
              </div>
            </div>
          </div>

          <div className="review-callout">
            <CheckCircle2 size={18} />
            <div>
              <strong>{complete ? "Dossier physique & numérique complet" : `${checked.length}/${checklist.length} originaux vérifiés`}</strong>
              <p>Tous les justificatifs originaux doivent être certifiés avant attribution du numéro étudiant définitif.</p>
            </div>
          </div>

          <button
            className="button button-primary button-wide"
            disabled={!complete || validated}
            onClick={handleFinalize}
          >
            {validated ? "Numéro étudiant attribué (Admis)" : "Finaliser l’inscription administrative"}
          </button>

          {validated && (
            <div className="registration-number">
              <span>Numéro officiel étudiant</span>
              <strong>USMBA-DOC-{(selected.cne || "2026").slice(-5)}</strong>
            </div>
          )}
        </section>
      </div>

      {previewDoc && (
        <DocumentViewerModal
          document={previewDoc.doc}
          label={previewDoc.label}
          canVerify
          isVerified={previewDoc.isVerified}
          onToggleVerify={() => {
            onToggleDocumentVerify?.(selected.id, previewDoc.label);
            setPreviewDoc((prev) => {
              if (!prev) return null;
              const nextVerified = !prev.isVerified;
              const updatedDoc = typeof prev.doc === "object"
                ? { ...prev.doc, verified: nextVerified }
                : { name: prev.doc, verified: nextVerified };
              return { ...prev, isVerified: nextVerified, doc: updatedDoc };
            });
          }}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
