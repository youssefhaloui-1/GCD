import { ChangeEvent, FormEvent, ReactNode, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Download, FileText, Search, Upload, X } from "lucide-react";
import { motion } from "framer-motion";
import type { ApplicationData } from "../../App";

type Props = {
  onClose: () => void;
  onSubmitted: (data: ApplicationData) => void;
  initialData?: ApplicationData;
};

type Topic = { id: string; title: string; laboratory: string; cedoc: string; supervisor: string };
type UploadedFiles = Record<string, string>;

const topics: Topic[] = [
  { id: "topic-01", title: "Intelligence artificielle et apprentissage automatique", laboratory: "LSI · IA & Data", cedoc: "CEDOC Sciences et Technologies", supervisor: "Pr. Nadia Chafik" },
  { id: "topic-02", title: "Cybersécurité et sécurité des applications", laboratory: "LSI · Sécurité", cedoc: "CEDOC Sciences et Technologies", supervisor: "Pr. Omar Benjelloun" },
  { id: "topic-03", title: "Systèmes distribués et cloud computing", laboratory: "LIM · Systèmes", cedoc: "CEDOC Sciences et Technologies", supervisor: "Pr. Yassine Benslimane" },
  { id: "topic-04", title: "Science des données et visualisation", laboratory: "LSI · IA & Data", cedoc: "CEDOC Sciences et Technologies", supervisor: "Pr. Salma Tazi" },
  { id: "topic-05", title: "Vision par ordinateur et patrimoine numérique", laboratory: "LISAC · Numérique", cedoc: "CEDOC Lettres et Sciences Humaines", supervisor: "Pr. Lina Berrada" },
  { id: "topic-06", title: "Gouvernance des données publiques", laboratory: "LAREF · Droit public", cedoc: "CEDOC Droit, Économie et Gestion", supervisor: "Pr. Sara Aït Lahcen" },
  { id: "topic-07", title: "Santé numérique et télémédecine", laboratory: "LIM · Santé", cedoc: "CEDOC Sciences et Technologies", supervisor: "Pr. Imane Naciri" },
  { id: "topic-08", title: "Transition énergétique et villes durables", laboratory: "LIM · Énergie", cedoc: "CEDOC Sciences et Technologies", supervisor: "Pr. Mehdi El Idrissi" },
  { id: "topic-09", title: "Matériaux composites biosourcés", laboratory: "LMC · Matériaux", cedoc: "CEDOC Sciences et Technologies", supervisor: "Pr. Rachid Alaoui" },
  { id: "topic-10", title: "Économie circulaire et territoires", laboratory: "LAREF · Économie", cedoc: "CEDOC Droit, Économie et Gestion", supervisor: "Pr. Salma Tazi" },
  { id: "topic-11", title: "Internet des objets et industrie 4.0", laboratory: "LIM · Systèmes", cedoc: "CEDOC Sciences et Technologies", supervisor: "Pr. Anas Amrani" },
  { id: "topic-12", title: "Réseaux intelligents et télécommunications", laboratory: "LTI · Réseaux", cedoc: "CEDOC Sciences et Technologies", supervisor: "Pr. Omar Benjelloun" },
  { id: "topic-13", title: "Droit du numérique et protection des données", laboratory: "LAREF · Droit public", cedoc: "CEDOC Droit, Économie et Gestion", supervisor: "Pr. Sara Aït Lahcen" },
  { id: "topic-14", title: "Pédagogie universitaire et innovation", laboratory: "LISAC · Éducation", cedoc: "CEDOC Lettres et Sciences Humaines", supervisor: "Pr. Khadija El Fassi" },
  { id: "topic-15", title: "Agriculture intelligente et ressources hydriques", laboratory: "LIM · Environnement", cedoc: "CEDOC Sciences et Technologies", supervisor: "Pr. Mehdi El Idrissi" },
];

const universities = ["Faculté des Sciences de Fès", "Faculté des Sciences et Techniques de Fès", "ENSA Fès"];
const steps = ["Profil personnel", "Parcours académique", "Choix du sujet", "Résumé et confirmation"];
const fileLabels = ["Relevés de notes", "Diplôme ou attestation Licence", "Diplôme ou attestation Master", "CV détaillé"];

function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "blue" | "amber" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="wizard-error">{message}</span> : null;
}

export default function CandidateRegistrationWizard({ onClose, onSubmitted, initialData }: Props) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [laboratory, setLaboratory] = useState("");
  const [cedoc, setCedoc] = useState("");
  const [files, setFiles] = useState<UploadedFiles>({});
  const [form, setForm] = useState({
    fullName: initialData?.fullName ?? "",
    email: initialData?.email ?? "",
    cne: initialData?.cne ?? "",
    cin: initialData?.cin ?? "",
    phone: initialData?.phone ?? "",
    address: initialData?.address ?? "",
    bacDiploma: initialData?.bacDiploma ?? "",
    bacYear: initialData?.bacYear ?? "",
    bacUniversity: initialData?.bacUniversity ?? "",
    licenceDiploma: initialData?.licenceDiploma ?? "",
    licenceYear: initialData?.licenceYear ?? "",
    licenceUniversity: initialData?.licenceUniversity ?? "",
    masterDiploma: initialData?.masterDiploma ?? "",
    masterYear: initialData?.masterYear ?? "",
    masterUniversity: initialData?.masterUniversity ?? "",
    selectedSubjects: initialData?.selectedSubjects ?? [],
    university: initialData?.university ?? "",
  });

  const filteredTopics = useMemo(() => topics.filter((topic) => {
    const matchesQuery = `${topic.title} ${topic.laboratory} ${topic.cedoc}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (!laboratory || topic.laboratory === laboratory) && (!cedoc || topic.cedoc === cedoc);
  }), [query, laboratory, cedoc]);

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const setFile = (event: ChangeEvent<HTMLInputElement>, label: string) => {
    const file = event.target.files?.[0];
    if (file) setFiles((current) => ({ ...current, [label]: file.name }));
  };
  const toggleTopic = (id: string) => setForm((current) => ({
    ...current,
    selectedSubjects: current.selectedSubjects.includes(id)
      ? current.selectedSubjects.filter((item) => item !== id)
      : current.selectedSubjects.length < 3 ? [...current.selectedSubjects, id] : current.selectedSubjects,
  }));
  const validateStep = () => {
    const nextErrors: Record<string, string> = {};
    if (step === 1) {
      if (!form.fullName.trim()) nextErrors.fullName = "Le nom complet est obligatoire.";
      if (!/^[A-Z0-9]{10}$/i.test(form.cne)) nextErrors.cne = "Le CNE/MASSAR doit contenir exactement 10 caractères.";
      if (!/^[A-Z]{1,2}[0-9]{5,8}$/i.test(form.cin)) nextErrors.cin = "Format CIN invalide.";
      if (!/^\+?[0-9\s-]{9,15}$/.test(form.phone)) nextErrors.phone = "Numéro de téléphone invalide.";
      if (!form.address.trim()) nextErrors.address = "L’adresse est obligatoire.";
    }
    if (step === 2) {
      if (!form.bacDiploma.trim()) nextErrors.bacDiploma = "Le diplôme du BAC est obligatoire.";
      if (!/^(19|20)\d{2}$/.test(form.bacYear)) nextErrors.bacYear = "Année invalide.";
      if (!form.licenceDiploma.trim()) nextErrors.licenceDiploma = "Le diplôme de Licence est obligatoire.";
      if (!/^(19|20)\d{2}$/.test(form.licenceYear)) nextErrors.licenceYear = "Année invalide.";
      if (!form.masterDiploma.trim()) nextErrors.masterDiploma = "Le diplôme de Master est obligatoire.";
      if (!/^(19|20)\d{2}$/.test(form.masterYear)) nextErrors.masterYear = "Année invalide.";
    }
    if (step === 3 && form.selectedSubjects.length === 0) nextErrors.subjects = "Sélectionnez au moins un sujet.";
    if (step === 3 && !form.university) nextErrors.university = "Choisissez une université d’accueil.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
  const next = () => {
    if (validateStep()) setStep((current) => Math.min(4, current + 1));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!validateStep()) return;
    setSubmitted(true);
    onSubmitted({ ...form, files });
  };
  const selectedTopicDetails = form.selectedSubjects.map((id) => topics.find((topic) => topic.id === id)).filter(Boolean) as Topic[];

  return <div className="modal-backdrop" onClick={onClose}><motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="modal application-modal wizard-modal" onClick={(event) => event.stopPropagation()}>
    <div className="modal-header"><div><p className="eyebrow">INSCRIPTION DOCTORALE</p><h2>{initialData ? "Modifier ma candidature" : "Nouvelle candidature"}</h2><p>Complétez les quatre étapes de votre dossier.</p></div><button className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>
    {!submitted ? <form onSubmit={submit}>
      <div className="wizard-progress">{steps.map((label, index) => { const current = index + 1; return <div className={`wizard-progress-step ${step >= current ? "complete" : ""} ${step === current ? "current" : ""}`} key={label}><span>{step > current ? <Check size={13} /> : current}</span><small>{label}</small></div>; })}</div>
      <div className="wizard-content">
        {step === 1 && <div className="wizard-section"><div className="wizard-section-heading"><div><h3>Profil personnel</h3><p>Ces informations seront utilisées pour identifier votre dossier.</p></div><Badge tone="blue">Étape 1 / 4</Badge></div><div className="wizard-form-grid"><label>Nom complet<input value={form.fullName} onChange={(event) => update("fullName", event.target.value)} /><FieldError message={errors.fullName} /></label><label>Email<input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} /><FieldError message={errors.email} /></label><label>CNE / MASSAR<input maxLength={10} value={form.cne} onChange={(event) => update("cne", event.target.value.toUpperCase())} /><FieldError message={errors.cne} /></label><label>CIN<input value={form.cin} onChange={(event) => update("cin", event.target.value.toUpperCase())} /><FieldError message={errors.cin} /></label><label>Téléphone<input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+212 6 00 00 00 00" /><FieldError message={errors.phone} /></label><label className="wizard-full-field">Adresse<textarea value={form.address} onChange={(event) => update("address", event.target.value)} /><FieldError message={errors.address} /></label></div></div>}
        {step === 2 && <div className="wizard-section"><div className="wizard-section-heading"><div><h3>Parcours académique</h3><p>Renseignez vos diplômes et années d’obtention.</p></div><Badge tone="blue">Étape 2 / 4</Badge></div><div className="academic-block"><strong>Baccalauréat</strong><div className="wizard-form-grid"><label>Diplôme<input value={form.bacDiploma} onChange={(event) => update("bacDiploma", event.target.value)} /><FieldError message={errors.bacDiploma} /></label><label>Année<input inputMode="numeric" value={form.bacYear} onChange={(event) => update("bacYear", event.target.value)} /><FieldError message={errors.bacYear} /></label><label className="wizard-full-field">Université / établissement<input value={form.bacUniversity} onChange={(event) => update("bacUniversity", event.target.value)} /></label></div></div><div className="academic-block"><strong>Licence</strong><div className="wizard-form-grid"><label>Diplôme<input value={form.licenceDiploma} onChange={(event) => update("licenceDiploma", event.target.value)} /><FieldError message={errors.licenceDiploma} /></label><label>Année<input inputMode="numeric" value={form.licenceYear} onChange={(event) => update("licenceYear", event.target.value)} /><FieldError message={errors.licenceYear} /></label><label className="wizard-full-field">Université / établissement<input value={form.licenceUniversity} onChange={(event) => update("licenceUniversity", event.target.value)} /></label></div></div><div className="academic-block"><strong>Master</strong><div className="wizard-form-grid"><label>Diplôme<input value={form.masterDiploma} onChange={(event) => update("masterDiploma", event.target.value)} /><FieldError message={errors.masterDiploma} /></label><label>Année<input inputMode="numeric" value={form.masterYear} onChange={(event) => update("masterYear", event.target.value)} /><FieldError message={errors.masterYear} /></label><label className="wizard-full-field">Université / établissement<input value={form.masterUniversity} onChange={(event) => update("masterUniversity", event.target.value)} /></label></div></div><div className="upload-grid">{fileLabels.map((label) => <label className="upload-box" key={label}><Upload size={17} /><strong>{label}</strong><small>{files[label] || "PDF ou JPEG · cliquer pour choisir"}</small><input type="file" accept=".pdf,.jpeg,.jpg" onChange={(event) => setFile(event, label)} /></label>)}</div></div>}
        {step === 3 && <div className="wizard-section"><div className="wizard-section-heading"><div><h3>Choix du sujet doctoral</h3><p>Choisissez jusqu’à trois sujets parmi les offres disponibles.</p></div><Badge tone={form.selectedSubjects.length === 3 ? "green" : "blue"}>{form.selectedSubjects.length} / 3 choix</Badge></div><div className="topic-toolbar"><div className="search-input"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un sujet, laboratoire ou CEDOC" /></div><select value={laboratory} onChange={(event) => setLaboratory(event.target.value)}><option value="">Tous les laboratoires</option>{Array.from(new Set(topics.map((topic) => topic.laboratory))).map((item) => <option key={item}>{item}</option>)}</select><select value={cedoc} onChange={(event) => setCedoc(event.target.value)}><option value="">Tous les CEDOC</option>{Array.from(new Set(topics.map((topic) => topic.cedoc))).map((item) => <option key={item}>{item}</option>)}</select></div><div className="topic-card-grid">{filteredTopics.map((topic) => { const selected = form.selectedSubjects.includes(topic.id); return <label className={`topic-card ${selected ? "selected" : ""}`} key={topic.id}><input type="checkbox" checked={selected} onChange={() => toggleTopic(topic.id)} /><div><strong>{topic.title}</strong><span>{topic.laboratory} · {topic.cedoc}</span><small>{topic.supervisor}</small></div>{selected && <CheckCircle2 size={18} />}</label>; })}</div><FieldError message={errors.subjects} /><label className="wizard-university-label">Université d’accueil<select value={form.university} onChange={(event) => update("university", event.target.value)}><option value="">Sélectionnez une université</option>{universities.map((item) => <option key={item}>{item}</option>)}</select><FieldError message={errors.university} /></label></div>}
        {step === 4 && <div className="wizard-section"><div className="wizard-section-heading"><div><h3>Résumé et confirmation</h3><p>Vérifiez votre dossier avant la transmission.</p></div><Badge tone="green">Prêt à envoyer</Badge></div><div className="summary-grid"><div><span>Profil personnel</span><strong>{form.fullName}</strong><small>{form.cne} · {form.cin} · {form.phone}</small><small>{form.address}</small></div><div><span>Parcours académique</span><strong>{form.masterDiploma}</strong><small>Master · {form.masterYear} · {form.masterUniversity}</small><small>Licence · {form.licenceYear} · {form.licenceUniversity}</small></div><div className="wizard-full-summary"><span>Sujets sélectionnés</span>{selectedTopicDetails.map((topic, index) => <strong key={topic.id}>{index + 1}. {topic.title}<small>{topic.laboratory} · {topic.cedoc}</small></strong>)}</div><div className="wizard-full-summary"><span>Université d’accueil</span><strong>{form.university}</strong></div><div className="wizard-full-summary"><span>Pièces jointes</span>{Object.entries(files).map(([label, file]) => <small key={label}><FileText size={13} /> {label} : {file}</small>)}</div></div><p className="wizard-confirmation-note"><CheckCircle2 size={17} /> En envoyant ce dossier, vous confirmez l’exactitude des informations fournies.</p></div>}
      </div>
      <div className="wizard-actions"><button type="button" className="button button-secondary" disabled={step === 1} onClick={() => setStep((current) => current - 1)}><ArrowLeft size={16} /> Retour</button>{step < 4 ? <button type="button" className="button button-primary" onClick={next}>Continuer <ArrowRight size={16} /></button> : <button type="submit" className="button button-primary">Envoyer ma candidature <Check size={16} /></button>}</div>
    </form> : <div className="wizard-success"><div className="success-icon"><CheckCircle2 size={32} /></div><h3>Candidature enregistrée</h3><p>Votre dossier a été transmis avec succès. Conservez votre récépissé pour suivre son traitement.</p><div className="receipt-preview"><span>GCD USMBA · Récépissé de candidature</span><strong>{form.fullName}</strong><small>Référence : CAND-{form.cne}-{new Date().getFullYear()}</small><Badge tone="green">Dossier reçu</Badge></div><div className="wizard-actions"><button type="button" className="button button-secondary" onClick={() => window.print()}><Download size={16} /> Télécharger le récépissé</button><button type="button" className="button button-primary" onClick={onClose}>Accéder à mon tableau de bord</button></div></div>}
  </motion.div></div>;
}
