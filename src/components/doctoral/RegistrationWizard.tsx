import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import type { AcademicDegree, ApplicationState, AttachedFile, CandidateInfo } from "../../types/doctoral";
import { mockTopics } from "../../data/mockTopics";
import Step1Personal from "./steps/Step1Personal";
import Step2Academic from "./steps/Step2Academic";
import Step3TopicSelection from "./steps/Step3TopicSelection";
import Step4Review from "./steps/Step4Review";
import DeleteConfirmationModal from "../candidate/DeleteConfirmationModal";

type Props = {
  onClose: () => void;
  onSubmitted: (value: ApplicationState) => void;
  initialData?: ApplicationState;
  onDeleteCandidate?: () => void;
};

const steps = ["Profil personnel", "Parcours académique", "Choix du sujet", "Résumé et confirmation"];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function RegistrationWizard({
  onClose,
  onSubmitted,
  initialData,
  onDeleteCandidate,
}: Props) {
  // Check for stored draft if no initialData is passed
  const savedDraft = (() => {
    if (initialData) return null;
    try {
      const raw = localStorage.getItem("gcd_candidate_draft");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [step, setStep] = useState<number>(() => {
    if (savedDraft?.step && savedDraft.step >= 1 && savedDraft.step <= 4) {
      return savedDraft.step;
    }
    return 1;
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => {
    if (savedDraft?.lastSaved) return savedDraft.lastSaved;
    return new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [draftRestoredBanner, setDraftRestoredBanner] = useState<boolean>(Boolean(savedDraft));

  // Connectivity monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const [personal, setPersonal] = useState<CandidateInfo>({
    fullName: initialData?.fullName ?? savedDraft?.personal?.fullName ?? "",
    email: initialData?.email ?? savedDraft?.personal?.email ?? "",
    cne: initialData?.cne ?? savedDraft?.personal?.cne ?? "",
    cin: initialData?.cin ?? savedDraft?.personal?.cin ?? "",
    phone: initialData?.phone ?? savedDraft?.personal?.phone ?? "",
    address: initialData?.address ?? savedDraft?.personal?.address ?? "",
  });

  const [degrees, setDegrees] = useState({
    bac: {
      diploma: initialData?.bacDiploma ?? savedDraft?.degrees?.bac?.diploma ?? "",
      year: initialData?.bacYear ?? savedDraft?.degrees?.bac?.year ?? "",
      university: initialData?.bacUniversity ?? savedDraft?.degrees?.bac?.university ?? "",
    },
    licence: {
      diploma: initialData?.licenceDiploma ?? savedDraft?.degrees?.licence?.diploma ?? "",
      year: initialData?.licenceYear ?? savedDraft?.degrees?.licence?.year ?? "",
      university: initialData?.licenceUniversity ?? savedDraft?.degrees?.licence?.university ?? "",
    },
    master: {
      diploma: initialData?.masterDiploma ?? savedDraft?.degrees?.master?.diploma ?? "",
      year: initialData?.masterYear ?? savedDraft?.degrees?.master?.year ?? "",
      university: initialData?.masterUniversity ?? savedDraft?.degrees?.master?.university ?? "",
    },
  });

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    initialData?.selectedSubjects ?? savedDraft?.selectedSubjects ?? []
  );
  const [university, setUniversity] = useState(
    initialData?.university ?? savedDraft?.university ?? ""
  );
  const [files, setFiles] = useState<Record<string, string | AttachedFile>>(
    initialData?.files ?? savedDraft?.files ?? {}
  );

  // Automatic draft save to localStorage on every state change
  useEffect(() => {
    if (submitted) return;
    const draftPayload = {
      step,
      personal,
      degrees,
      selectedSubjects,
      university,
      files,
      lastSaved: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      status: "draft",
    };
    try {
      localStorage.setItem("gcd_candidate_draft", JSON.stringify(draftPayload));
      setLastSavedTime(draftPayload.lastSaved);
    } catch {
      // Handle storage quota limit if any large files
    }
  }, [step, personal, degrees, selectedSubjects, university, files, submitted]);

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
    // Remove local draft upon definitive submission
    try {
      localStorage.removeItem("gcd_candidate_draft");
    } catch {
      // Ignore
    }
    onSubmitted(value);
  };

  const handleDefinitiveDelete = () => {
    try {
      localStorage.removeItem("gcd_candidate_draft");
    } catch {
      // Ignore
    }
    setShowDeleteModal(false);
    if (onDeleteCandidate) {
      onDeleteCandidate();
    } else {
      onClose();
    }
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
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <p className="eyebrow">CYCLE DOCTORAL USMBA</p>
              <span className="badge badge-amber" style={{ fontSize: "9px" }}>
                Brouillon en cours
              </span>
              {!isOnline && (
                <span className="badge badge-red" style={{ fontSize: "9px" }}>
                  <WifiOff size={10} style={{ display: "inline", marginRight: "3px" }} />
                  Hors-ligne
                </span>
              )}
            </div>
            <h2>{initialData ? "Modifier ma candidature" : "Nouvelle candidature doctorale"}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "3px", flexWrap: "wrap" }}>
              <p style={{ color: "var(--muted)", fontSize: "11px" }}>
                Progression sauvegardée automatiquement à <strong>{lastSavedTime}</strong>.
              </p>
              {isOnline ? (
                <span style={{ fontSize: "10px", color: "#68dda8", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Wifi size={12} /> Connecté
                </span>
              ) : (
                <span style={{ fontSize: "10px", color: "#ff8296", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <WifiOff size={12} /> Déconnecté · Sauvegarde locale active
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setShowDeleteModal(true)}
              style={{ height: "32px", padding: "0 10px", fontSize: "11px", color: "#ff8296" }}
              title="Supprimer définitivement ce dossier"
            >
              <Trash2 size={13} />
              <span className="hide-mobile">Supprimer</span>
            </button>
            <button className="icon-button" onClick={onClose} aria-label="Fermer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Offline / Restored Draft Banner */}
        {!isOnline && (
          <div
            style={{
              padding: "10px 18px",
              background: "rgba(255, 130, 150, 0.15)",
              borderBottom: "1px solid rgba(255, 130, 150, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
              color: "#ff9aab",
            }}
          >
            <WifiOff size={15} />
            <span>
              <strong>Connexion perdue :</strong> Vous êtes actuellement hors-ligne. Toutes vos modifications restent conservées sur votre appareil et seront finalisables dès reconnexion.
            </span>
          </div>
        )}

        {draftRestoredBanner && isOnline && (
          <div
            style={{
              padding: "8px 18px",
              background: "rgba(105, 117, 245, 0.12)",
              borderBottom: "1px solid rgba(105, 117, 245, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "11px",
              color: "#aeb5ff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <RotateCcw size={13} />
              <span>Brouillon restauré : vos saisies ont été récupérées là où vous vous étiez arrêté.</span>
            </div>
            <button
              type="button"
              onClick={() => setDraftRestoredBanner(false)}
              style={{ background: "transparent", border: 0, color: "var(--muted)", cursor: "pointer" }}
            >
              <X size={14} />
            </button>
          </div>
        )}

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

      {/* Confirmation modal for definitive deletion */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDefinitiveDelete}
        candidateName={personal.fullName || "Brouillon en cours"}
        isDraft={true}
        title="Suppression définitive du brouillon"
        message="Êtes-vous sûr de vouloir supprimer définitivement ce dossier et toutes les données saisies ? Cette action est irréversible."
      />
    </div>
  );
}
