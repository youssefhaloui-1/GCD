import { useState } from "react";
import { AlertTriangle, Trash2, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  candidateName?: string;
  isDraft?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Suppression définitive de la candidature",
  message = "Êtes-vous sûr de vouloir supprimer définitivement votre candidature ? Cette action est irréversible.",
  candidateName,
  isDraft = false,
}: Props) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirm();
    }, 400);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 70 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="modal"
        style={{ maxWidth: "500px", padding: 0, overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            background: "rgba(255, 130, 150, 0.12)",
            borderBottom: "1px solid rgba(255, 130, 150, 0.25)",
            padding: "20px 24px",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "rgba(255, 130, 150, 0.2)",
              color: "#ff8296",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="eyebrow" style={{ color: "#ff8296" }}>
              ZONE DANGEREUSE · ACTION IRRÉVERSIBLE
            </p>
            <h2 style={{ fontSize: "17px", color: "var(--text)", margin: "4px 0 2px" }}>
              {title}
            </h2>
            {candidateName && (
              <small style={{ color: "var(--muted)", fontSize: "11px" }}>
                Dossier associé : <strong>{candidateName}</strong>
              </small>
            )}
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Annuler">
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "22px 24px" }}>
          <p style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--text)", marginBottom: "14px" }}>
            {message}
          </p>

          <div
            style={{
              padding: "12px 14px",
              borderRadius: "8px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              fontSize: "11px",
              color: "var(--muted)",
              lineHeight: "1.5",
            }}
          >
            <strong style={{ color: "var(--text)", display: "block", marginBottom: "4px" }}>
              Éléments qui seront supprimés et nettoyés :
            </strong>
            <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
              <li>Toutes vos informations personnelles et académiques saisies</li>
              <li>L'ensemble des fichiers téléversés (diplômes Bac, Licence, Master, relevés, CV)</li>
              <li>Le dossier présent dans la liste des commissions (directeur, chef de thèse, chef de projet)</li>
              {isDraft && <li>La sauvegarde automatique locale du brouillon</li>}
            </ul>
          </div>
        </div>

        <div
          className="modal-actions"
          style={{
            padding: "16px 24px",
            background: "var(--surface)",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button
            type="button"
            className="button button-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="button"
            className="button"
            style={{
              background: "#e11d48",
              color: "#ffffff",
              border: "none",
              boxShadow: "0 4px 14px rgba(225, 29, 72, 0.35)",
            }}
            onClick={handleConfirm}
            disabled={loading}
          >
            <Trash2 size={15} />
            {loading ? "Suppression en cours..." : "Oui, supprimer définitivement"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
