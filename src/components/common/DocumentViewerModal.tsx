import { useState } from "react";
import { Download, Eye, FileText, CheckCircle2, X, ExternalLink, ShieldCheck } from "lucide-react";
import type { AttachedFile } from "../../types/doctoral";

interface DocumentViewerModalProps {
  document: AttachedFile | string;
  label: string;
  onClose: () => void;
  canVerify?: boolean;
  isVerified?: boolean;
  onToggleVerify?: () => void;
}

export default function DocumentViewerModal({
  document,
  label,
  onClose,
  canVerify = false,
  isVerified = false,
  onToggleVerify,
}: DocumentViewerModalProps) {
  const fileName = typeof document === "string" ? document : document.name;
  const fileSize = typeof document === "object" ? document.size : undefined;
  const dataUrl = typeof document === "object" ? document.dataUrl : undefined;
  const isImage = typeof document === "object" && document.type?.startsWith("image/");
  const isPdf = typeof document === "object" && (document.type?.includes("pdf") || fileName.endsWith(".pdf"));

  const handleDownload = () => {
    if (dataUrl) {
      const a = window.document.createElement("a");
      a.href = dataUrl;
      a.download = fileName;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    } else {
      // Create a dummy download representation for simulated mock files
      const blob = new Blob([`Contenu certifié USMBA - Document : ${label}\nFichier : ${fileName}\nDate : ${new Date().toLocaleDateString("fr-FR")}\nSignature électronique valide.`], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = fileName.endsWith(".pdf") ? fileName.replace(".pdf", ".txt") : `${fileName}.txt`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 60 }}>
      <div className="modal doc-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ minWidth: 0, flex: 1 }}>
            <p className="eyebrow">CONSULTATION DU DOCUMENT</p>
            <h2 style={{ fontSize: "16px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
              {label}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "11px" }}>
              {fileName} {fileSize ? `· ${fileSize}` : ""}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              className="button button-secondary"
              onClick={handleDownload}
              style={{ padding: "0 10px", height: "34px", fontSize: "11px" }}
              title="Télécharger le fichier"
            >
              <Download size={14} /> Télécharger
            </button>
            {canVerify && (
              <button
                type="button"
                className={`button ${isVerified ? "button-secondary" : "button-primary"}`}
                onClick={onToggleVerify}
                style={{ padding: "0 10px", height: "34px", fontSize: "11px" }}
              >
                <CheckCircle2 size={14} />
                {isVerified ? "Conforme (Validé)" : "Marquer Conforme"}
              </button>
            )}
            <button className="icon-button" onClick={onClose} aria-label="Fermer">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="doc-viewer-body">
          {dataUrl && isImage ? (
            <div className="doc-preview-container">
              <img src={dataUrl} alt={fileName} style={{ maxWidth: "100%", maxHeight: "55vh", objectFit: "contain", borderRadius: "8px" }} />
            </div>
          ) : dataUrl && isPdf ? (
            <div className="doc-preview-container" style={{ width: "100%", height: "55vh" }}>
              <iframe src={dataUrl} title={fileName} style={{ width: "100%", height: "100%", border: "0", borderRadius: "8px" }} />
            </div>
          ) : (
            <div className="doc-simulated-view">
              <div className="doc-paper">
                <div className="doc-header-seal">
                  <div className="doc-seal-badge">USMBA</div>
                  <div>
                    <strong>UNIVERSITÉ SIDI MOHAMED BEN ABDELLAH DE FÈS</strong>
                    <small>Centre des Études Doctorales (CEDoc) · Pôle Doctoral</small>
                  </div>
                </div>
                <hr className="doc-divider" />
                <div className="doc-title-box">
                  <h3>{label.toUpperCase()}</h3>
                  <span>Nom du fichier : <code>{fileName}</code></span>
                </div>
                <div className="doc-content-mock">
                  <p><strong>Identifiant document :</strong> DOC-{Math.abs(fileName.split("").reduce((a, b) => a + b.charCodeAt(0), 0))}-2026</p>
                  <p><strong>Type de pièce :</strong> Justificatif académique officiel soumis sur la plateforme GCD.</p>
                  <p><strong>Statut de conformité :</strong> {isVerified ? "✅ Pièce vérifiée et validée par la commission." : "⏳ En attente d'examen par le responsable."}</p>
                  <div className="doc-stamp">
                    <ShieldCheck size={28} />
                    <span>EMPREINTE NUMÉRIQUE CERTIFIÉE<br /><small>GCD · ARCHIVE UNIVERSITAIRE</small></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions" style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
            {isVerified ? "Pièce validée par la commission" : "Vérifiez l'authenticité des mentions"}
          </span>
          <button type="button" className="button button-secondary" onClick={onClose}>
            Fermer l'aperçu
          </button>
        </div>
      </div>
    </div>
  );
}
