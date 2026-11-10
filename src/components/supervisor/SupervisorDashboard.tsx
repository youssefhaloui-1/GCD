import { FormEvent, useState } from "react";
import { Check, Eye, FileCheck2, FileText, Plus, Send, X } from "lucide-react";
import { mockApplications, mockProgressReports, mockTopics } from "../../data/mockData";
import type { Application, Candidate, ProgressReport } from "../../types/doctoral";
import type { CandidateStatus } from "../../domain/gcd";
import CandidateDetailModal from "../candidate/CandidateDetailModal";

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "amber" | "blue" | "red" | "violet" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

const statusLabels: Record<string, string> = {
  received: "Nouveau dossier",
  screening: "Présélection",
  shortlisted: "Retenu pour entretien",
  interview: "Entretien oral",
  scored: "Évaluation",
  accepted: "Admis",
  rejected: "Refusé",
};

const statusTones: Record<string, "blue" | "amber" | "violet" | "green" | "red"> = {
  received: "blue",
  screening: "blue",
  shortlisted: "amber",
  interview: "amber",
  scored: "violet",
  accepted: "green",
  rejected: "red",
};

interface SupervisorProps {
  candidates?: Candidate[];
  onStatusChange?: (id: string, status: CandidateStatus) => void;
  onToggleDocumentVerify?: (candidateId: string, label: string) => void;
}

export default function SupervisorDashboard({
  candidates: propCandidates,
  onStatusChange: propOnStatusChange,
  onToggleDocumentVerify,
}: SupervisorProps) {
  const [localApplications, setLocalApplications] = useState<Application[]>(mockApplications);
  const [reports, setReports] = useState<ProgressReport[]>(mockProgressReports);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [topicTitle, setTopicTitle] = useState("");
  const [opinion, setOpinion] = useState<Record<string, string>>({});
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Use propCandidates if supplied, otherwise fallback to localApplications
  const candidateList: Candidate[] = propCandidates && propCandidates.length > 0
    ? propCandidates
    : localApplications.map((app) => ({
        id: app.id,
        fullName: app.fullName,
        name: app.fullName,
        initials: app.fullName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
        cne: app.cne,
        cin: app.cin,
        email: app.email,
        phone: app.phone,
        address: app.address,
        status: app.status as CandidateStatus,
        academicScore: app.academicScore,
        interviewScore: app.interviewScore,
        selectedTopic: app.selectedTopic,
        subject: app.selectedTopic,
        date: app.submittedAt,
        submittedAt: app.submittedAt,
        university: app.university,
        bacDiploma: app.bacDiploma,
        bacYear: app.bacYear,
        bacUniversity: app.bacUniversity,
        licenceDiploma: app.licenceDiploma,
        licenceYear: app.licenceYear,
        licenceUniversity: app.licenceUniversity,
        masterDiploma: app.masterDiploma,
        masterYear: app.masterYear,
        masterUniversity: app.masterUniversity,
        selectedSubjects: app.selectedSubjects,
        files: app.files,
      }));

  const handleStatusChange = (id: string, status: CandidateStatus) => {
    if (propOnStatusChange) {
      propOnStatusChange(id, status);
    } else {
      setLocalApplications((items) =>
        items.map((item) => (item.id === id ? { ...item, status: status as any } : item))
      );
    }
    if (selectedCandidate && selectedCandidate.id === id) {
      setSelectedCandidate((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const approveReport = (id: string) =>
    setReports((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: "cedoc-review", advisoryOpinion: opinion[id] } : item
      )
    );

  const publishTopic = (event: FormEvent) => {
    event.preventDefault();
    setShowTopicForm(false);
    setTopicTitle("");
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">PORTAIL ENCADRANT & CHEF DE THÈSE</p>
          <h1>Suivi des doctorants & Candidatures</h1>
          <p className="subheading">
            Examinez les pièces jointes des candidats, attribuez les statuts et suivez les travaux de recherche.
          </p>
        </div>
        <button className="button button-primary" onClick={() => setShowTopicForm(true)}>
          <Plus size={16} /> Nouveau sujet
        </button>
      </div>

      <div className="role-dashboard-grid">
        <section className="card role-main-card">
          <div className="section-heading">
            <div>
              <h2>Candidatures sur les sujets de recherche</h2>
              <p>Consultez les diplômes et ajustez le statut de chaque candidat en toute liberté.</p>
            </div>
            <Badge tone="blue">{candidateList.length} dossiers</Badge>
          </div>

          <div className="role-list">
            {candidateList.map((candidate) => {
              const filesCount = Object.keys(candidate.files || {}).length;
              const currentStatus = candidate.status || "received";
              const tone = statusTones[currentStatus] || "blue";

              return (
                <div className="role-list-row" key={candidate.id} style={{ flexWrap: "wrap", gap: "10px" }}>
                  <div className="subject-avatar">
                    {candidate.initials || candidate.name?.slice(0, 2).toUpperCase() || "CD"}
                  </div>

                  <div className="role-list-content" style={{ minWidth: "180px", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <strong>{candidate.fullName || candidate.name}</strong>
                      {filesCount > 0 && (
                        <span className="badge badge-neutral" style={{ fontSize: "9px", padding: "1px 5px" }}>
                          {filesCount} doc(s)
                        </span>
                      )}
                    </div>
                    <span>{candidate.selectedTopic || candidate.subject} · Score {candidate.academicScore || candidate.score}/100</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <select
                      value={currentStatus}
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
                      title="Changer le statut"
                    >
                      <option value="received">Nouveau dossier</option>
                      <option value="interview">Entretien oral</option>
                      <option value="scored">En évaluation</option>
                      <option value="accepted">Admis définitif</option>
                      <option value="rejected">Refusé</option>
                    </select>

                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => setSelectedCandidate(candidate)}
                      style={{ height: "32px", padding: "0 10px", fontSize: "11px" }}
                      title="Voir le dossier complet et les pièces jointes"
                    >
                      <Eye size={13} /> Dossier
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card role-side-card">
          <div className="section-heading">
            <div>
              <h2>Rapports annuels d'activité</h2>
              <p>Avis motivé de l’encadrant sur la réinscription</p>
            </div>
            <FileText size={19} className="muted-icon" />
          </div>

          {reports.map((report) => (
            <div className="report-card" key={report.id}>
              <strong>{report.candidateName}</strong>
              <span>{report.fileName} · {report.year}</span>
              <textarea
                value={opinion[report.id] || ""}
                onChange={(event) => setOpinion((items) => ({ ...items, [report.id]: event.target.value }))}
                placeholder="Avis motivé sur l'avancement de la thèse..."
              />
              <button
                className="button button-secondary"
                disabled={report.status !== "submitted"}
                onClick={() => approveReport(report.id)}
              >
                <Send size={14} /> {report.status === "submitted" ? "Transmettre l’avis" : "Avis transmis"}
              </button>
            </div>
          ))}
        </section>
      </div>

      {showTopicForm && (
        <div className="modal-backdrop" onClick={() => setShowTopicForm(false)}>
          <div className="modal small-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">PUBLICATION SCIENTIFIQUE</p>
                <h2>Créer un sujet doctoral</h2>
              </div>
              <button className="icon-button" onClick={() => setShowTopicForm(false)}>
                <X size={18} />
              </button>
            </div>
            <form className="stack modal-form" onSubmit={publishTopic}>
              <label>
                Titre du sujet de thèse
                <input autoFocus value={topicTitle} onChange={(event) => setTopicTitle(event.target.value)} required />
              </label>
              <label>
                Laboratoire d'accueil
                <select>
                  <option>{mockTopics[0].laboratory}</option>
                  <option>{mockTopics[2].laboratory}</option>
                  <option>{mockTopics[8].laboratory}</option>
                </select>
              </label>
              <button className="button button-primary" type="submit">
                Publier le sujet
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onStatusChange={handleStatusChange}
          onToggleDocumentVerify={onToggleDocumentVerify}
        />
      )}
    </div>
  );
}
