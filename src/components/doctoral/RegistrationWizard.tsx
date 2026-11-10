import { ChangeEvent, FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import type { AcademicDegree, ApplicationState, CandidateInfo } from "../../types/doctoral";
import { mockTopics } from "../../data/mockTopics";
import Step1Personal from "./steps/Step1Personal";
import Step2Academic from "./steps/Step2Academic";
import Step3TopicSelection from "./steps/Step3TopicSelection";
import Step4Review from "./steps/Step4Review";

type Props = { onClose: () => void; onSubmitted: (value: ApplicationState) => void; initialData?: ApplicationState };
const emptyDegree = (): AcademicDegree => ({ diploma: "", year: "", university: "" });
const steps = ["Profil personnel", "Parcours académique", "Choix du sujet", "Résumé"];

export default function RegistrationWizard({ onClose, onSubmitted, initialData }: Props) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [personal, setPersonal] = useState<CandidateInfo>({ fullName: initialData?.fullName ?? "", email: initialData?.email ?? "", cne: initialData?.cne ?? "", cin: initialData?.cin ?? "", phone: initialData?.phone ?? "", address: initialData?.address ?? "" });
  const [degrees, setDegrees] = useState({ bac: { diploma: initialData?.bacDiploma ?? "", year: initialData?.bacYear ?? "", university: initialData?.bacUniversity ?? "" }, licence: { diploma: initialData?.licenceDiploma ?? "", year: initialData?.licenceYear ?? "", university: initialData?.licenceUniversity ?? "" }, master: { diploma: initialData?.masterDiploma ?? "", year: initialData?.masterYear ?? "", university: initialData?.masterUniversity ?? "" } });
  const [selectedSubjects, setSelectedSubjects] = useState(initialData?.selectedSubjects ?? []);
  const [university, setUniversity] = useState(initialData?.university ?? "");
  const [files, setFiles] = useState(initialData?.files ?? {});

  const value: ApplicationState = { ...personal, bacDiploma: degrees.bac.diploma, bacYear: degrees.bac.year, bacUniversity: degrees.bac.university, licenceDiploma: degrees.licence.diploma, licenceYear: degrees.licence.year, licenceUniversity: degrees.licence.university, masterDiploma: degrees.master.diploma, masterYear: degrees.master.year, masterUniversity: degrees.master.university, selectedSubjects, university, files };
  const updatePersonal = (key: keyof CandidateInfo, next: string) => setPersonal((current) => ({ ...current, [key]: next }));
  const updateDegree = (degree: "bac" | "licence" | "master", key: keyof AcademicDegree, next: string) => setDegrees((current) => ({ ...current, [degree]: { ...current[degree], [key]: next } }));
  const updateFile = (event: ChangeEvent<HTMLInputElement>, label: string) => { const file = event.target.files?.[0]; if (file) setFiles((current) => ({ ...current, [label]: file.name })); };
  const validate = () => {
    const next: Record<string, string> = {};
    if (step === 1) {
      if (!personal.fullName.trim()) next.fullName = "Le nom complet est obligatoire.";
      if (!/^[A-Z0-9]{10}$/i.test(personal.cne)) next.cne = "Le CNE/MASSAR doit contenir 10 caractères.";
      if (!/^[A-Z]{1,2}[0-9]{5,8}$/i.test(personal.cin)) next.cin = "Format CIN invalide.";
      if (!/^\+?[0-9\s-]{9,15}$/.test(personal.phone)) next.phone = "Téléphone invalide.";
      if (!personal.address.trim()) next.address = "L’adresse est obligatoire.";
    }
    if (step === 2) (["bac", "licence", "master"] as const).forEach((degree) => { if (!degrees[degree].diploma.trim()) next[`${degree}Diploma`] = "Diplôme obligatoire."; if (!/^(19|20)\d{2}$/.test(degrees[degree].year)) next[`${degree}Year`] = "Année invalide."; });
    if (step === 3) { if (!selectedSubjects.length) next.subjects = "Sélectionnez au moins un sujet."; if (!university) next.university = "Choisissez une université."; }
    setErrors(next);
    return !Object.keys(next).length;
  };
  const next = () => { if (validate()) setStep((current) => Math.min(4, current + 1)); };
  const submit = (event?: FormEvent) => { event?.preventDefault(); setSubmitted(true); onSubmitted(value); };

  return <div className="modal-backdrop" onClick={onClose}><motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="modal application-modal wizard-modal" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow">INSCRIPTION DOCTORALE</p><h2>{initialData ? "Modifier ma candidature" : "Nouvelle candidature"}</h2><p>Votre progression est conservée entre les étapes.</p></div><button className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>{!submitted && <div className="wizard-progress">{steps.map((label, index) => <div className={`wizard-progress-step ${step >= index + 1 ? "complete" : ""} ${step === index + 1 ? "current" : ""}`} key={label}><span>{step > index + 1 ? <Check size={13} /> : index + 1}</span><small>{label}</small></div>)}</div>}<form onSubmit={submit}>{!submitted && <div className="wizard-content">{step === 1 && <Step1Personal value={personal} errors={errors} onChange={updatePersonal} />}{step === 2 && <Step2Academic degrees={degrees} files={files} errors={errors} onDegreeChange={updateDegree} onFile={updateFile} />}{step === 3 && <Step3TopicSelection topics={mockTopics} selected={selectedSubjects} university={university} errors={errors} onToggle={(id) => setSelectedSubjects((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current)} onUniversity={setUniversity} />}{step === 4 && <Step4Review value={value} topics={mockTopics} submitted={false} onSubmit={submit} onClose={onClose} />}</div>}{submitted && <Step4Review value={value} topics={mockTopics} submitted onSubmit={submit} onClose={onClose} />}{!submitted && step < 4 && <div className="wizard-actions"><button type="button" className="button button-secondary" disabled={step === 1} onClick={() => setStep((current) => current - 1)}><ArrowLeft size={16} /> Retour</button><button type="button" className="button button-primary" onClick={next}>Continuer <ArrowRight size={16} /></button></div>}</form></motion.div></div>;
}
