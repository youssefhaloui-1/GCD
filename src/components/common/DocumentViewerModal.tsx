import { useEffect, useMemo, useState } from "react";
import { Download, Eye, FileText, CheckCircle2, X, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
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
  const isPdf = typeof document === "object" ? (document.type?.includes("pdf") || fileName.toLowerCase().endsWith(".pdf")) : fileName.toLowerCase().endsWith(".pdf");

  const [viewMode, setViewMode] = useState<"document" | "certified">(isPdf && dataUrl ? "document" : "certified");
  const [pdfError, setPdfError] = useState(false);

  // Generate a clean blob URL with explicit Content-Type application/pdf to prevent iframe/cors issues
  const blobUrl = useMemo(() => {
    if (!dataUrl) return null;
    try {
      const parts = dataUrl.split(",");
      const mimeMatch = dataUrl.match(/data:([^;]+);/);
      const mimeType = mimeMatch ? mimeMatch[1] : (isPdf ? "application/pdf" : "application/octet-stream");
      const base64Str = parts[1] || parts[0];
      const byteCharacters = atob(base64Str);
      const byteArrays = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([byteArrays], { type: mimeType });
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }, [dataUrl, isPdf]);

  // Clean up object URL when unmounting
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const handleDownload = () => {
    if (blobUrl) {
      const a = window.document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    } else if (dataUrl) {
      const a = window.document.createElement("a");
      a.href = dataUrl;
      a.download = fileName;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    } else {
      // Create an authenticated official university document copy
      const content = `UNIVERSITÉ SIDI MOHAMED BEN ABDELLAH - FÈS\nPOLE DES ETUDES DOCTORALES\n========================================\nDOCUMENT ACADÉMIQUE OFFICIEL : ${label}\nFICHIER : ${fileName}\nSTATUT : ${isVerified ? "CONFORME ET VALIDÉ" : "EN COURS D'INSTRUCTION"}\nDATE D'EXTRACTION : ${new Date().toLocaleDateString("fr-FR")}\nEMPREINTE NUMÉRIQUE CERTIFIÉE USMBA-GCD-2026`;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = fileName.endsWith(".pdf") ? fileName.replace(/\.pdf$/i, ".txt") : `${fileName}.txt`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleOpenExternal = () => {
    if (blobUrl) {
      window.open(blobUrl, "_blank");
    } else if (dataUrl) {
      window.open(dataUrl, "_blank");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 60 }}>
      <div className="modal doc-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <p className="eyebrow">CONSULTATION DU DOCUMENT</p>
              {isVerified && (
                <span className="badge badge-green" style={{ fontSize: "9px", padding: "1px 6px" }}>
                  <ShieldCheck size={11} style={{ display: "inline", marginRight: "3px" }} />
                  Certifié conforme
                </span>
              )}
            </div>
            <h2 style={{ fontSize: "16px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
              {label}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "11px" }}>
              {fileName} {fileSize ? `· ${fileSize}` : ""}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {(blobUrl || dataUrl) && (
              <button
                type="button"
                className="button button-secondary"
                onClick={handleOpenExternal}
                style={{ padding: "0 10px", height: "34px", fontSize: "11px" }}
                title="Ouvrir dans un nouvel onglet"
              >
                <ExternalLink size={14} /> Plein écran
              </button>
            )}
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
                {isVerified ? "Dévalider (Annuler)" : "Certifier conforme"}
              </button>
            )}
            <button className="icon-button" onClick={onClose} aria-label="Fermer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* View Mode Switcher for PDFs */}
        {isPdf && (blobUrl || dataUrl) && !pdfError && (
          <div style={{ padding: "6px 20px", display: "flex", gap: "8px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border)" }}>
            <button
              type="button"
              className={`button ${viewMode === "document" ? "button-primary" : "button-secondary"}`}
              onClick={() => setViewMode("document")}
              style={{ height: "26px", fontSize: "11px", padding: "0 10px" }}
            >
              Vue PDF intégrée
            </button>
            <button
              type="button"
              className={`button ${viewMode === "certified" ? "button-primary" : "button-secondary"}`}
              onClick={() => setViewMode("certified")}
              style={{ height: "26px", fontSize: "11px", padding: "0 10px" }}
            >
              Fiche certifiée USMBA
            </button>
          </div>
        )}

        <div className="doc-viewer-body">
          {dataUrl && isImage ? (
            <div className="doc-preview-container">
              <img src={dataUrl} alt={fileName} style={{ maxWidth: "100%", maxHeight: "55vh", objectFit: "contain", borderRadius: "8px" }} />
            </div>
          ) : isPdf && (blobUrl || dataUrl) && viewMode === "document" && !pdfError ? (
            <div className="doc-preview-container" style={{ width: "100%", height: "55vh", minHeight: "380px", position: "relative" }}>
              <object
                data={blobUrl || dataUrl}
                type="application/pdf"
                style={{ width: "100%", height: "100%", border: "0", borderRadius: "8px" }}
                onError={() => setPdfError(true)}
              >
                <iframe
                  src={blobUrl || dataUrl}
                  title={fileName}
                  style={{ width: "100%", height: "100%", border: "0", borderRadius: "8px" }}
                />
              </object>
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
                  <span>Nom du fichier : <code>{fileName}</code> {fileSize ? `(${fileSize})` : ""}</span>
                </div>
                <div className="doc-content-mock">
                  <p><strong>Identifiant pièce :</strong> DOC-{Math.abs(fileName.split("").reduce((a, b) => a + b.charCodeAt(0), 0))}-2026</p>
                  <p><strong>Format de transmission :</strong> Format PDF dématérialisé avec signature d'intégrité.</p>
                  <p>
                    <strong>Statut de conformité :</strong>{" "}
                    {isVerified ? (
                      <span style={{ color: "#68dda8", fontWeight: "bold" }}>
                        ✅ Document vérifié et certifié conforme par la commission.
                      </span>
                    ) : (
                      <span style={{ color: "#efbf76", fontWeight: "bold" }}>
                        ⏳ En attente de validation par le responsable habilité.
                      </span>
                    )}
                  </p>
                  <div className="doc-stamp">
                    <ShieldCheck size={28} />
                    <span>EMPREINTE NUMÉRIQUE CERTIFIÉE<br /><small>GCD · ARCHIVE UNIVERSITAIRE USMBA</small></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions" style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: isVerified ? "#68dda8" : "var(--muted)" }}>
            {isVerified ? "Pièce certifiée conforme par la commission" : "Cliquez sur 'Certifier conforme' pour valider cette pièce"}
          </span>
          <button type="button" className="button button-secondary" onClick={onClose}>
            Fermer l'aperçu
          </button>
        </div>
      </div>
    </div>
  );
}
