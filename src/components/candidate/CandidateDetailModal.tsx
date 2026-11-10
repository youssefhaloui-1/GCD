import { useState } from "react";
import {
  Award,
  Building,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import type { AttachedFile, Candidate, ApplicationStatus } from "../../types/doctoral";
import type { CandidateStatus } from "../../domain/gcd";
import DocumentViewerModal from "../common/DocumentViewerModal";

interface Props {
  candidate: Candidate;
  onClose: () => void;
  onStatusChange: (candidateId: string, newStatus: CandidateStatus) => void;
  onToggleDocumentVerify?: (candidateId: string, documentLabel: string) => void;
  onScoreChange?: (candidateId: string, score: number) => void;
}

const statusOptions: { key: CandidateStatus; label: string; tone: string; description: string }[] = [
  { key: "received", label: "Nouveau dossier", tone: "blue", description: "Dossier reçu, vérification des prérequis" },
  { key: "interview", label: "Entretien oral", tone: "amber", description: "Candidat convoqué devant la commission" },
  { key: "scored", label: "En évaluation", tone: "violet", description: "Notation académique et délibération" },
  { key: "accepted", label: "Admis définitif", tone: "green", description: "Sélection validée pour inscription" },
  { key: "rejected", label: "Candidature refusée", tone: "red", description: "Dossier non retenu par la commission" },
];

export default function CandidateDetailModal({
  candidate,
  onClose,
  onStatusChange,
  onToggleDocumentVerify,
  onScoreChange,
}: Props) {
  const [activeTab, setActiveTab] = useState<"dossier" | "pieces" | "statut">("dossier");
  const [previewDoc, setPreviewDoc] = useState<{ doc: AttachedFile | string; label: string; isVerified: boolean } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<CandidateStatus>(
    (candidate.status as CandidateStatus) || "received"
  );
  const [score, setScore] = useState<number>(candidate.academicScore || candidate.score || 80);

  const files = candidate.files || {};
  const fileEntries = Object.entries(files);

  const handleStatusApply = (newStatus: CandidateStatus) => {
    setSelectedStatus(newStatus);
    onStatusChange(candidate.id, newStatus);
  };

  const currentStatusObj = statusOptions.find((s) => s.key === selectedStatus) || statusOptions[0];

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 50 }}>
      <div className="modal candidate-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
            <div className="subject-avatar" style={{ width: "42px", height: "42px", fontSize: "14px", flexShrink: 0 }}>
              {candidate.initials || candidate.name?.slice(0, 2).toUpperCase() || "CD"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "18px" }}>{candidate.fullName || candidate.name}</h2>
                <span className={`badge badge-${currentStatusObj.tone}`}>
                  {currentStatusObj.label}
                </span>
              </div>
              <p style={{ color: "var(--muted)", fontSize: "11px", marginTop: "2px" }}>
                CNE : <strong>{candidate.cne}</strong> · CIN : {candidate.cin || "Non renseigné"} · Déposé : {candidate.submittedAt || candidate.date}
              </p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="wizard-progress" style={{ gridTemplateColumns: "repeat(3, 1fr)", padding: "10px 18px" }}>
          <button
            type="button"
            className={`wizard-progress-step ${activeTab === "dossier" ? "current complete" : ""}`}
            onClick={() => setActiveTab("dossier")}
            style={{ background: "transparent", border: 0, cursor: "pointer", textAlign: "left" }}
          >
            <span><User size={13} /></span>
            <small>Parcours & Diplômes</small>
          </button>
          <button
            type="button"
            className={`wizard-progress-step ${activeTab === "pieces" ? "current complete" : ""}`}
            onClick={() => setActiveTab("pieces")}
            style={{ background: "transparent", border: 0, cursor: "pointer", textAlign: "left" }}
          >
            <span><FileCheck2 size={13} /></span>
            <small>Pièces & Fiches ({fileEntries.length})</small>
          </button>
          <button
            type="button"
            className={`wizard-progress-step ${activeTab === "statut" ? "current complete" : ""}`}
            onClick={() => setActiveTab("statut")}
            style={{ background: "transparent", border: 0, cursor: "pointer", textAlign: "left" }}
          >
            <span><ShieldCheck size={13} /></span>
            <small>Gestion du Statut</small>
          </button>
        </div>

        {/* Tab 1: Dossier & Parcours */}
        {activeTab === "dossier" && (
          <div className="wizard-content" style={{ padding: "20px" }}>
            <div className="summary-grid" style={{ marginBottom: "18px" }}>
              <div>
                <span>Coordonnées du candidat</span>
                <strong>{candidate.fullName || candidate.name}</strong>
                <small><Mail size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> {candidate.email || "candidat@usmba.ac.ma"}</small>
                <small><Phone size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> {candidate.phone || "+212 6 00 00 00 00"}</small>
                <small><MapPin size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> {candidate.address || "Fès, Maroc"}</small>
              </div>

              <div>
                <span>Établissement & Évaluation</span>
                <strong>{candidate.university || "Faculté des Sciences de Fès"}</strong>
                <div style={{ marginTop: "6px" }}>
                  <label style={{ fontSize: "11px", color: "var(--muted)", display: "block" }}>Note académique /100 :</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={score}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setScore(val);
                        onScoreChange?.(candidate.id, val);
                      }}
                      style={{ width: "70px", height: "32px", padding: "0 8px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text)", fontSize: "12px", fontWeight: "bold" }}
                    />
                    <span className="badge badge-green">{score >= 80 ? "Mention Très Bien" : score >= 70 ? "Mention Bien" : "Admissible"}</span>
                  </div>
                </div>
              </div>

              <div className="wizard-full-summary">
                <span>Sujet de recherche doctoral</span>
                <strong style={{ fontSize: "13px", color: "var(--text)" }}>{candidate.selectedTopic || candidate.subject}</strong>
                <small style={{ color: "var(--muted)", display: "block", marginTop: "4px" }}>
                  Directeur de thèse : Pr. Responsable · Laboratoire associé USMBA
                </small>
              </div>
            </div>

            <div className="section-heading" style={{ marginTop: "16px", marginBottom: "12px" }}>
              <div>
                <h3 style={{ fontSize: "14px" }}>Détail des diplômes présentés</h3>
                <p>Authentification des titres académiques antérieurs</p>
              </div>
            </div>

            <div style={{ display: "grid", gap: "10px" }}>
              <div className="academic-block" style={{ padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>Master / Diplôme d'Ingénieur (Bac+5)</strong>
                  <span className="badge badge-blue">Requis</span>
                </div>
                <p style={{ margin: "4px 0", fontSize: "12px", color: "var(--text)" }}>
                  {candidate.masterDiploma || "Master de recherche en Sciences"} ({candidate.masterYear || "2024"})
                </p>
                <small style={{ color: "var(--muted)" }}>Établissement : {candidate.masterUniversity || "Faculté des Sciences de Fès"}</small>
              </div>

              <div className="academic-block" style={{ padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>Licence Fondamentale / Professionnelle (Bac+3)</strong>
                  <span className="badge badge-neutral">Validé</span>
                </div>
                <p style={{ margin: "4px 0", fontSize: "12px", color: "var(--text)" }}>
                  {candidate.licenceDiploma || "Licence Sciences et Techniques"} ({candidate.licenceYear || "2022"})
                </p>
                <small style={{ color: "var(--muted)" }}>Établissement : {candidate.licenceUniversity || "Université Sidi Mohamed Ben Abdellah"}</small>
              </div>

              <div className="academic-block" style={{ padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>Baccalauréat</strong>
                  <span className="badge badge-neutral">Validé</span>
                </div>
                <p style={{ margin: "4px 0", fontSize: "12px", color: "var(--text)" }}>
                  {candidate.bacDiploma || "Baccalauréat Sciences"} ({candidate.bacYear || "2019"})
                </p>
                <small style={{ color: "var(--muted)" }}>Académie : {candidate.bacUniversity || "Académie Fès-Meknès"}</small>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Pièces jointes & Fiches */}
        {activeTab === "pieces" && (
          <div className="wizard-content" style={{ padding: "20px" }}>
            <div className="section-heading" style={{ marginBottom: "14px" }}>
              <div>
                <h3 style={{ fontSize: "15px" }}>Contrôle des pièces jointes et fiches</h3>
                <p>Consultez, téléchargez et certifiez la conformité de chaque document déposé.</p>
              </div>
              <span className="badge badge-blue">{fileEntries.length} document(s)</span>
            </div>

            {fileEntries.length === 0 ? (
              <div className="empty-state" style={{ padding: "30px 10px" }}>
                <FileText size={32} />
                <strong>Aucune pièce jointe</strong>
                <span>Le candidat n'a pas encore joint de fichier dématérialisé.</span>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "10px" }}>
                {fileEntries.map(([label, file]) => {
                  const fileName = typeof file === "string" ? file : file.name;
                  const fileSize = typeof file === "object" ? file.size : undefined;
                  const isVerified = typeof file === "object" ? Boolean(file.verified) : false;

                  return (
                    <div
                      key={label}
                      className="card"
                      style={{
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "10px",
                        borderLeft: isVerified ? "4px solid #68dda8" : "4px solid #efbf76",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "220px", flex: 1 }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            background: isVerified ? "rgba(104, 221, 168, 0.15)" : "rgba(239, 191, 118, 0.15)",
                            display: "grid",
                            placeItems: "center",
                            color: isVerified ? "#68dda8" : "#efbf76",
                            flexShrink: 0,
                          }}
                        >
                          <FileText size={18} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <strong style={{ fontSize: "12px" }}>{label}</strong>
                            {isVerified ? (
                              <span className="badge badge-green" style={{ fontSize: "9px", padding: "1px 6px" }}>
                                <Check size={10} /> Conforme
                              </span>
                            ) : (
                              <span className="badge badge-amber" style={{ fontSize: "9px", padding: "1px 6px" }}>
                                À certifier
                              </span>
                            )}
                          </div>
                          <small style={{ color: "var(--muted)", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", fontSize: "11px" }}>
                            {fileName} {fileSize ? `· ${fileSize}` : ""}
                          </small>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() => setPreviewDoc({ doc: file, label, isVerified })}
                          style={{ height: "32px", padding: "0 10px", fontSize: "11px" }}
                        >
                          <Eye size={13} /> Consulter
                        </button>
                        <button
                          type="button"
                          className={`button ${isVerified ? "button-secondary" : "button-primary"}`}
                          onClick={() => onToggleDocumentVerify?.(candidate.id, label)}
                          style={{ height: "32px", padding: "0 10px", fontSize: "11px" }}
                        >
                          <CheckCircle2 size={13} />
                          {isVerified ? "Dévalider" : "Certifier conforme"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Gestion Flexible du Statut */}
        {activeTab === "statut" && (
          <div className="wizard-content" style={{ padding: "20px" }}>
            <div className="section-heading" style={{ marginBottom: "14px" }}>
              <div>
                <h3 style={{ fontSize: "15px" }}>Modifier le statut du candidat</h3>
                <p>Attribuez en toute liberté l'état d'avancement de ce dossier doctoral.</p>
              </div>
            </div>

            <div style={{ display: "grid", gap: "10px", marginBottom: "20px" }}>
              {statusOptions.map((opt) => {
                const isSelected = selectedStatus === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleStatusApply(opt.key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      borderRadius: "10px",
                      border: isSelected ? "2px solid #6975f5" : "1px solid var(--border)",
                      background: isSelected ? "var(--primary-soft)" : "var(--surface)",
                      cursor: "pointer",
                      textAlign: "left",
                      color: "var(--text)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className={`badge badge-${opt.tone}`}>{opt.label}</span>
                        {isSelected && <strong style={{ fontSize: "11px", color: "#aeb5ff" }}>Actuel</strong>}
                      </div>
                      <small style={{ color: "var(--muted)", display: "block", marginTop: "4px", fontSize: "11px" }}>
                        {opt.description}
                      </small>
                    </div>
                    {isSelected && (
                      <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#6975f5", display: "grid", placeItems: "center", color: "#fff" }}>
                        <Check size={14} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="review-callout green" style={{ marginTop: "16px" }}>
              <ShieldCheck size={20} />
              <div>
                <strong>Synchronisation immédiate</strong>
                <p>La mise à jour du statut est répercutée en temps réel sur le Kanban, les filtres et l'espace du candidat.</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="modal-actions" style={{ padding: "14px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>Statut actuel :</span>
            <span className={`badge badge-${currentStatusObj.tone}`}>{currentStatusObj.label}</span>
          </div>
          <button type="button" className="button button-primary" onClick={onClose}>
            Fermer le dossier
          </button>
        </div>
      </div>

      {previewDoc && (
        <DocumentViewerModal
          document={previewDoc.doc}
          label={previewDoc.label}
          canVerify
          isVerified={previewDoc.isVerified}
          onToggleVerify={() => {
            onToggleDocumentVerify?.(candidate.id, previewDoc.label);
            setPreviewDoc((prev) => prev ? { ...prev, isVerified: !prev.isVerified } : null);
          }}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
