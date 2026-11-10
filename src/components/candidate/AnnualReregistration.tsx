import { ChangeEvent, ReactNode, useState } from "react";
import { Check, CheckCircle2, FileText, Upload } from "lucide-react";

const stages = ["Rapport soumis", "Avis de l’encadrant", "Approbation CEDOC", "Validation finale"];

function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "blue" | "amber" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export default function AnnualReregistration() {
  const [report, setReport] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setReport(file.name);
  };
  const submit = () => {
    if (!report) {
      setMessage("Ajoutez votre rapport d’avancement au format PDF.");
      return;
    }
    setSubmitted(true);
    setMessage("Votre rapport a été transmis à votre encadrant.");
  };
  const activeStage = submitted ? 1 : 0;
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">ESPACE DOCTORANT · ANNÉE 2026 / 2027</p><h1>Réinscription annuelle</h1><p className="subheading">Déposez votre rapport d’avancement et suivez chaque validation.</p></div><Badge tone={submitted ? "blue" : "amber"}>{submitted ? "En cours de validation" : "À compléter"}</Badge></div><div className="student-dashboard-grid"><section className="card student-progress-card"><div className="section-heading"><div><h2>État de la réinscription</h2><p>Le statut est actualisé après chaque décision.</p></div><span className="completion">{submitted ? "25%" : "0%"}</span></div><div className="annual-tracker">{stages.map((stage, index) => <div className={`annual-stage ${index <= activeStage ? "active" : ""}`} key={stage}><span>{index < activeStage ? <Check size={14} /> : index + 1}</span><div><strong>{stage}</strong><small>{index < activeStage ? "Terminé" : index === activeStage && submitted ? "En cours" : index === 0 ? "En attente de dépôt" : "À venir"}</small></div></div>)}</div><div className="student-status-callout"><CheckCircle2 size={19} /><div><strong>{submitted ? "Rapport transmis" : "Prochaine action : déposer votre rapport"}</strong><p>{message || "Le rapport doit présenter vos travaux réalisés, vos publications et vos objectifs pour l’année prochaine."}</p></div></div></section><section className="card student-upload-card"><div className="section-heading"><div><h2>Rapport d’avancement</h2><p>Formats acceptés : PDF, 10 Mo maximum.</p></div><FileText size={20} className="muted-icon" /></div><label className={`student-dropzone ${report ? "uploaded" : ""}`}><Upload size={23} /><strong>{report || "Choisir le rapport d’avancement"}</strong><small>{report ? "Fichier prêt à être transmis" : "Cliquez pour importer votre fichier PDF"}</small><input type="file" accept=".pdf" onChange={handleFile} /></label><label className="student-notes">Observations complémentaires<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ajoutez une information utile à votre encadrant…" /></label>{message && !submitted && <span className="wizard-error">{message}</span>}<button className="button button-primary button-wide" onClick={submit} disabled={submitted}>{submitted ? "Rapport déjà transmis" : "Transmettre le rapport"}</button></section></div></div>;
}
