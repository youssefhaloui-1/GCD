import { ChangeEvent, FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import type { AcademicDegree, ApplicationState, AttachedFile, CandidateInfo } from "../../types/doctoral";
import { mockTopics } from "../../data/mockTopics";
import Step1Personal from "./steps/Step1Personal";
import Step2Academic from "./steps/Step2Academic";
import Step3TopicSelection from "./steps/Step3TopicSelection";
import Step4Review from "./steps/Step4Review";

type Props = {
  onClose: () => void;
  onSubmitted: (value: ApplicationState) => void;
  initialData?: ApplicationState;
};

const steps = ["Profil personnel", "Parcours académique", "Choix du sujet", "Résumé et confirmation"];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function RegistrationWizard({ onClose, onSubmitted, initialData }: Props) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [personal, setPersonal] = useState<CandidateInfo>({
    fullName: initialData?.fullName ?? "",
    email: initialData?.email ?? "",
    cne: initialData?.cne ?? "",
    cin: initialData?.cin ?? "",
    phone: initialData?.phone ?? "",
    address: initialData?.address ?? "",
  });
  const [degrees, setDegrees] = useState({
    bac: {
      diploma: initialData?.bacDiploma ?? "",
      year: initialData?.bacYear ?? "",
      university: initialData?.bacUniversity ?? "",
    },
    licence: {
      diplence: initialData?.licenceDiploma ?? "",
      diploma: initialData?.licenceDiploma ?? "",
      year: initialData?.licenceYear ?? "",
      university: initialData?.licenceUniversity ?? "",
    },
    master: {
      diploma: initialData?.masterDiploma ?? "",
      year: initialData?.masterYear ?? "",
      university: initialData?.masterUniversity ?? "",
    },
  });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialData?.selectedSubjects ?? []);
  const [university, setUniversity] = useState(initialData?.university ?? "");
  const [files, setFiles] = useState<Record<string, string | AttachedFile>>(initialData?.files ?? {});

  const value: ApplicationState = {
    ...personal,
    bacDiploma: degrees.bac.diploma,
    bacYear: degrees.bac.year,
    bacUniversity: degrees.bac.university,
    licenceDiploma: degrees.licence.diploma,
    licenceYear: degrees.licence.year,
    licenceUniversity: degrees.licence.university,
    masterDiploma: degrees.master.diploma,
    masterYear: degrees.master.year,
    masterUniversity: degrees.master.university,
    selectedSubjects,
    university,
    files,
  };

  const updatePersonal = (key: keyof CandidateInfo, next: string) =>
    setPersonal((current) => ({ ...current, [key]: next }));

  const updateDegree = (degree: "bac" | "licence" | "master", key: keyof AcademicDegree, next: string) =>
    setDegrees((current) => ({ ...current, [degree]: { ...current[degree], [key]: next } }));

  const updateFile = (event: ChangeEvent<HTMLInputElement>, label: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setFiles((current) => ({
        ...current,
        [label]: {
          name: file.name,
          size: formatSize(file.size),
          type: file.type || "application/octet-stream",
          dataUrl,
          uploadedAt: new Date().toLocaleDateString("fr-FR"),
          verified: false,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (label: string) => {
    setFiles((current) => {
      const next = { ...current };
      delete next[label];
      return next;
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (step === 1) {
      if (!personal.fullName.trim()) nextErrors.fullName = "Le nom complet est obligatoire.";
      if (!personal.cne.trim()) {
        nextErrors.cne = "Le CNE/MASSAR est obligatoire.";
      } else if (!/^[A-Z0-9]{8,12}$/i.test(personal.cne.trim())) {
        nextErrors.cne = "Le CNE/MASSAR doit comporter 8 à 12 caractères alphanumériques.";
      }
      if (!personal.cin.trim()) {
        nextErrors.cin = "Le numéro CIN est obligatoire.";
      }
      if (!personal.phone.trim()) {
        nextErrors.phone = "Le numéro de téléphone est obligatoire.";
      }
      if (!personal.address.trim()) nextErrors.address = "L’adresse est obligatoire.";
    }
    if (step === 2) {
      if (!degrees.bac.diploma.trim()) nextErrors.bacDiploma = "Diplôme Bac obligatoire.";
      if (!degrees.licence.diploma.trim()) nextErrors.licenceDiploma = "Diplôme Licence obligatoire.";
      if (!degrees.master.diploma.trim()) nextErrors.masterDiploma = "Diplôme Master obligatoire.";
    }
    if (step === 3) {
      if (!selectedSubjects.length) nextErrors.subjects = "Sélectionnez au moins un sujet de thèse.";
      if (!university) nextErrors.university = "Choisissez une université ou établissement d’accueil.";
    }
    setErrors(nextErrors);
    return !Object.keys(nextErrors).length;
  };

  const next = () => {
    if (validate()) setStep((current) => Math.min(4, current + 1));
  };

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    setSubmitted(true);
    onSubmitted(value);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="modal application-modal wizard-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">CYCLE DOCTORAL USMBA</p>
            <h2>{initialData ? "Modifier ma candidature" : "Nouvelle candidature doctorale"}</h2>
            <p>Parcours complet : profil, diplômes, justificatifs et sélection des sujets.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        {!submitted && (
          <div className="wizard-progress">
            {steps.map((label, index) => (
              <div
                className={`wizard-progress-step ${step >= index + 1 ? "complete" : ""} ${
                  step === index + 1 ? "current" : ""
                }`}
                key={label}
              >
                <span>{step > index + 1 ? <Check size={13} /> : index + 1}</span>
                <small>{label}</small>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={submit}>
          {!submitted && (
            <div className="wizard-content">
              {step === 1 && <Step1Personal value={personal} errors={errors} onChange={updatePersonal} />}
              {step === 2 && (
                <Step2Academic
                  degrees={degrees}
                  files={files}
                  errors={errors}
                  onDegreeChange={updateDegree}
                  onFile={updateFile}
                  onRemoveFile={removeFile}
                />
              )}
              {step === 3 && (
                <Step3TopicSelection
                  topics={mockTopics}
                  selected={selectedSubjects}
                  university={university}
                  errors={errors}
                  onToggle={(id) =>
                    setSelectedSubjects((current) =>
                      current.includes(id)
                        ? current.filter((item) => item !== id)
                        : current.length < 3
                        ? [...current, id]
                        : current
                    )
                  }
                  onUniversity={setUniversity}
                />
              )}
              {step === 4 && (
                <Step4Review
                  value={value}
                  topics={mockTopics}
                  submitted={false}
                  onSubmit={submit}
                  onClose={onClose}
                />
              )}
            </div>
          )}

          {submitted && (
            <Step4Review
              value={value}
              topics={mockTopics}
              submitted
              onSubmit={submit}
              onClose={onClose}
            />
          )}

          {!submitted && step < 4 && (
            <div className="wizard-actions">
              <button
                type="button"
                className="button button-secondary"
                disabled={step === 1}
                onClick={() => setStep((current) => current - 1)}
              >
                <ArrowLeft size={16} /> Retour
              </button>
              <button type="button" className="button button-primary" onClick={next}>
                Continuer <ArrowRight size={16} />
              </button>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
