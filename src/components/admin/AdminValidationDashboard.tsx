import { useState } from "react";
import { Check, CheckCircle2, FileCheck2, ShieldCheck } from "lucide-react";
import { mockApplications } from "../../data/mockData";

const checklist = ["Original du BAC", "Diplôme ou attestation Master", "Relevés de notes originaux", "CIN / passeport", "Charte des thèses signée"];

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "amber" | "blue" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export default function AdminValidationDashboard() {
  const [candidateId, setCandidateId] = useState(mockApplications[0].id);
  const [checked, setChecked] = useState<string[]>([]);
  const [validated, setValidated] = useState(false);
  const selected = mockApplications.find((application) => application.id === candidateId) || mockApplications[0];
  const toggle = (item: string) => setChecked((items) => items.includes(item) ? items.filter((value) => value !== item) : [...items, item]);
  const complete = checked.length === checklist.length;
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">DIRECTION ADMINISTRATIVE · CEDOC</p><h1>Validation des inscriptions</h1><p className="subheading">Contrôlez le dossier physique et attribuez le numéro d’inscription officiel.</p></div><Badge tone={validated ? "green" : "amber"}>{validated ? "Inscription finalisée" : "Vérification en cours"}</Badge></div><div className="admin-layout"><section className="card admin-card"><div className="section-heading"><div><h2>Dossier physique</h2><p>Sélectionnez un candidat puis cochez chaque pièce originale vérifiée.</p></div><FileCheck2 size={20} className="muted-icon" /></div><label className="admin-select">Candidat<select value={candidateId} onChange={(event) => { setCandidateId(event.target.value); setChecked([]); setValidated(false); }}>{mockApplications.map((application) => <option key={application.id} value={application.id}>{application.fullName} · {application.cne}</option>)}</select></label><div className="physical-checklist">{checklist.map((item) => <label key={item}><input type="checkbox" checked={checked.includes(item)} onChange={() => toggle(item)} /><span>{item}</span>{checked.includes(item) && <Check size={16} />}</label>)}</div></section><section className="card admin-card"><div className="section-heading"><div><h2>Validation finale</h2><p>Action irréversible dans le registre administratif de démonstration.</p></div><ShieldCheck size={20} className="muted-icon" /></div><div className="admin-candidate"><div className="profile-large-avatar">{selected.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><div><strong>{selected.fullName}</strong><span>{selected.email}</span><small>{selected.university}</small></div></div><div className="review-callout"><CheckCircle2 size={18} /><div><strong>{complete ? "Dossier complet" : `${checked.length}/${checklist.length} pièces vérifiées`}</strong><p>La charte des thèses signée est obligatoire avant l’attribution du numéro.</p></div></div><button className="button button-primary button-wide" disabled={!complete || validated} onClick={() => setValidated(true)}>{validated ? "Numéro étudiant attribué" : "Finaliser l’inscription"}</button>{validated && <div className="registration-number"><span>Numéro officiel</span><strong>USMBA-DOC-{selected.cne.slice(-5)}</strong></div>}</section></div></div>;
}
