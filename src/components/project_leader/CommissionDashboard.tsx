import { useState } from "react";
import { Check, Download, Eye, FileText, Trophy, X } from "lucide-react";
import { mockCandidates, mockCommittee } from "../../data/mockData";
import type { Candidate } from "../../types/doctoral";
import type { CandidateStatus } from "../../domain/gcd";
import CandidateDetailModal from "../candidate/CandidateDetailModal";

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "amber" | "blue" | "red" | "violet" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

const statusLabels: Record<string, string> = {
  received: "Reçu",
  interview: "Entretien oral",
  scored: "En évaluation",
  shortlisted: "Présélectionné",
  accepted: "Admis",
  rejected: "Refusé",
};

interface CommissionProps {
  candidates?: Candidate[];
  onStatusChange?: (id: string, status: CandidateStatus) => void;
  onToggleDocumentVerify?: (candidateId: string, label: string) => void;
  onScoreChange?: (candidateId: string, score: number) => void;
}

export default function CommissionDashboard({
  candidates: propCandidates,
  onStatusChange: propOnStatusChange,
  onToggleDocumentVerify,
  onScoreChange,
}: CommissionProps) {
  const [localCandidates, setLocalCandidates] = useState<Candidate[]>(mockCandidates);
  const [pvReady, setPvReady] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const candidateList = propCandidates && propCandidates.length > 0 ? propCandidates : localCandidates;

  const handleStatusChange = (id: string, status: CandidateStatus) => {
    if (propOnStatusChange) {
      propOnStatusChange(id, status);
    } else {
      setLocalCandidates((items) =>
        items.map((item) => (item.id === id ? { ...item, status } : item))
      );
    }
    if (selectedCandidate && selectedCandidate.id === id) {
      setSelectedCandidate((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleScoreChange = (id: string, score: number) => {
    if (onScoreChange) {
      onScoreChange(id, score);
    } else {
      setLocalCandidates((items) =>
        items.map((item) =>
          item.id === id
            ? { ...item, interviewScore: score }
            : item
        )
      );
    }
  };

  const shortlist = candidateList.filter(
    (c) => c.status === "interview" || c.status === "scored" || c.status === "accepted" || c.status === "shortlisted"
  );

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">COMMISSION CEDOC · CHEF DE PROJET</p>
          <h1>Commission de sélection doctorale</h1>
          <p className="subheading">
            Évaluez les dossiers académiques, consultez les fiches et diplômes, et attribuez les statuts finaux.
          </p>
        </div>
        <button className="button button-primary" onClick={() => setPvReady(true)}>
          <FileText size={16} /> {pvReady ? "PV officiel généré" : "Générer le PV de sélection"}
        </button>
      </div>

      <div className="stats-grid role-stats">
        <div className="card stat-card">
          <div className="stat-icon blue">
            <Trophy size={19} />
          </div>
          <div className="stat-copy">
            <span>Dossiers reçus</span>
            <strong>{candidateList.length}</strong>
            <small>Session 2026 / 2027</small>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon green">
            <Check size={19} />
          </div>
          <div className="stat-copy">
            <span>Retenus / Admis</span>
            <strong>{shortlist.length}</strong>
            <small>En cours de délibération</small>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon violet">
            <FileText size={19} />
          </div>
          <div className="stat-copy">
            <span>Membres commission</span>
            <strong>{mockCommittee.length}</strong>
            <small>Quorum atteint</small>
          </div>
        </div>
      </div>

      <div className="role-dashboard-grid">
        <section className="card role-main-card">
          <div className="section-heading">
            <div>
              <h2>Candidatures & Notation orale</h2>
              <p>Consultez les pièces jointes et appliquez le statut de chaque candidat.</p>
            </div>
          </div>

          <div className="role-list">
            {candidateList.map((candidate) => {
              const filesCount = Object.keys(candidate.files || {}).length;
              return (
                <div className="role-list-row commission-row" key={candidate.id} style={{ flexWrap: "wrap", gap: "10px" }}>
                  <div className="subject-avatar">
                    {candidate.initials || candidate.name?.slice(0, 2).toUpperCase() || "CD"}
                  </div>

                  <div className="role-list-content" style={{ minWidth: "170px", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <strong>{candidate.fullName || candidate.name}</strong>
                      {filesCount > 0 && (
                        <span className="badge badge-neutral" style={{ fontSize: "9px", padding: "1px 5px" }}>
                          {filesCount} doc(s)
                        </span>
                      )}
                    </div>
                    <span>{candidate.selectedTopic || candidate.subject}</span>
                  </div>

                  <Badge tone="blue">Dossier : {candidate.academicScore || candidate.score}/100</Badge>

                  <label className="score-field" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span>Oral</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={candidate.interviewScore ?? ""}
                      onChange={(event) => handleScoreChange(candidate.id, Number(event.target.value))}
                      placeholder="--"
                    />
                  </label>

                  <select
                    value={candidate.status}
                    onChange={(e) => handleStatusChange(candidate.id, e.target.value as CandidateStatus)}
                    style={{
                      height: "32px",
                      padding: "0 8px",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--text)",
                      fontSize: "11px",
                    }}
                  >
                    <option value="received">Reçu</option>
                    <option value="interview">Entretien oral</option>
                    <option value="scored">En évaluation</option>
                    <option value="accepted">Admis</option>
                    <option value="rejected">Refusé</option>
                  </select>

                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setSelectedCandidate(candidate)}
                    style={{ height: "32px", padding: "0 10px", fontSize: "11px" }}
                    title="Consulter le dossier complet et les justificatifs"
                  >
                    <Eye size={13} /> Dossier
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card role-side-card">
          <div className="section-heading">
            <div>
              <h2>PV de sélection & Jury</h2>
              <p>Membres habilités et délibération</p>
            </div>
            <Download size={18} className="muted-icon" />
          </div>

          <div className="committee-list">
            {mockCommittee.map((member) => (
              <div key={member.id}>
                <span className="status-live" />
                <strong>{member.name}</strong>
                <small>{member.role}</small>
              </div>
            ))}
          </div>

          <div className={`review-callout ${pvReady ? "green" : ""}`}>
            <FileText size={18} />
            <div>
              <strong>{pvReady ? "PV prêt pour archivage" : "PV en cours de préparation"}</strong>
              <p>
                {pvReady
                  ? "Toutes les délibérations sont compilées dans le document officiel."
                  : "Saisissez les statuts et notes avant d'éditer le PV de commission."}
              </p>
            </div>
          </div>

          {pvReady && (
            <button className="button button-secondary button-wide" onClick={() => window.print()}>
              <Download size={15} /> Télécharger le PV officiel (PDF)
            </button>
          )}
        </section>
      </div>

      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onStatusChange={handleStatusChange}
          onToggleDocumentVerify={onToggleDocumentVerify}
          onScoreChange={handleScoreChange}
        />
      )}
    </div>
  );
}
