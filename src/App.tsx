import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Save,
  Users,
  UserRound,
  BriefcaseBusiness,
  Building2,
  X,
  SlidersHorizontal,
  Trash2,
  RotateCcw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RegistrationWizard from "./components/candidate/RegistrationWizard";
import ReRegistrationDashboard from "./components/candidate/ReRegistrationDashboard";
import RoleSwitcher from "./components/layout/RoleSwitcher";
import SupervisorDashboard from "./components/supervisor/SupervisorDashboard";
import CommissionDashboard from "./components/project_leader/CommissionDashboard";
import AdminValidationDashboard from "./components/admin/AdminValidationDashboard";
import CandidateDetailModal from "./components/candidate/CandidateDetailModal";
import DeleteConfirmationModal from "./components/candidate/DeleteConfirmationModal";
import type { ApplicationState, AttachedFile } from "./types/doctoral";
import { mockTopics } from "./data/mockTopics";
import {
  candidates as seedCandidates,
  activities,
  dashboardStats,
  subjectSteps,
  subjects as seedSubjects,
  type Candidate,
  type CandidateStatus,
  type DashboardStats,
  type DoctoralSubject,
  type Role,
  type SubjectStep,
} from "./domain/gcd";

type View = "dashboard" | "subjects" | "candidates" | "reregistration" | "profile";
export type ApplicationData = ApplicationState;
type NotificationItem = { id: string; title: string; description: string; tone: "amber" | "green" | "blue"; read: boolean };

const roleLabels: Record<Role, string> = {
  candidat: "Candidat",
  "chef-projet": "Chef de projet",
  "chef-these": "Chef de thèse",
  directeur: "Directeur",
};

const roleViews: Record<Role, View[]> = {
  candidat: ["dashboard", "reregistration", "profile"],
  "chef-projet": ["dashboard", "subjects", "candidates", "profile"],
  "chef-these": ["dashboard", "subjects", "reregistration", "profile"],
  directeur: ["dashboard", "subjects", "candidates", "reregistration", "profile"],
};

const candidateColumns: { key: CandidateStatus; label: string; tone: string }[] = [
  { key: "received", label: "Nouveaux dossiers", tone: "blue" },
  { key: "interview", label: "Entretiens", tone: "amber" },
  { key: "scored", label: "Évaluation", tone: "violet" },
  { key: "accepted", label: "Admis", tone: "green" },
  { key: "rejected", label: "Refusés", tone: "red" },
];

function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "amber" | "blue" | "violet" | "red" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

const profileOptions: { key: Role; label: string; description: string; icon: typeof UserRound; tone: string }[] = [
  { key: "candidat", label: "Candidat", description: "Déposer et suivre votre candidature", icon: UserRound, tone: "blue" },
  { key: "chef-projet", label: "Chef de projet", description: "Piloter les projets de recherche", icon: BriefcaseBusiness, tone: "violet" },
  { key: "chef-these", label: "Chef de thèse", description: "Suivre les doctorants et les sujets", icon: GraduationCap, tone: "amber" },
  { key: "directeur", label: "Directeur", description: "Valider les dossiers et superviser le cycle", icon: Building2, tone: "green" },
];

const registrationSubjects = [
  "Intelligence artificielle et apprentissage automatique",
  "Cybersécurité et sécurité des applications",
  "Systèmes distribués et cloud computing",
  "Science des données et visualisation",
  "Vision par ordinateur et patrimoine numérique",
  "Gouvernance des données publiques",
  "Santé numérique et télémédecine",
  "Transition énergétique et villes durables",
  "Matériaux composites biosourcés",
  "Économie circulaire et territoires",
  "Internet des objets et industrie 4.0",
  "Réseaux intelligents et télécommunications",
  "Droit du numérique et protection des données",
  "Pédagogie universitaire et innovation",
  "Agriculture intelligente et ressources hydriques",
];

function Login({ onLogin }: { onLogin: (email: string, role: Role) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("candidat");
  const [submitted, setSubmitted] = useState(false);
  const [registration, setRegistration] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjectQuery, setSubjectQuery] = useState("");
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  const isInstitutional = domain === "usmba.ac.ma";
  const validEmail = /^[^\s@]+@usmba\.ac\.ma$/i.test(email);
  const validPassword = password.length >= 6;
  const filteredSubjects = registrationSubjects.filter((subject) => subject.toLowerCase().includes(subjectQuery.toLowerCase()));
  const selectedProfile = profileOptions.find((profile) => profile.key === role) ?? profileOptions[0];
  const SelectedProfileIcon = selectedProfile.icon;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (validEmail && validPassword) onLogin(email, role);
  };

  return (
    <main className="login-shell">
      <div className="login-orbit orbit-one" />
      <div className="login-orbit orbit-two" />
      <div className="login-layout">
        <div className="login-intro">
          <div className="login-logo-badge">
            <img src="/logo.jpg" alt="Université Sidi Mohamed Ben Abdellah" className="university-login-logo" />
          </div>
          <p className="eyebrow">USMBA · CYCLE DOCTORAL</p>
          <h1>Un espace pour <span>chaque rôle.</span></h1>
          <p className="lead">Une plateforme unifiée, avec un parcours et des outils adaptés à chaque acteur du cycle doctoral.</p>
          <div className="login-proof">
            <div><CheckCircle2 size={17} /><span>Suivi multi-rôle en temps réel</span></div>
            <div><CheckCircle2 size={17} /><span>Récépissés numériques vérifiables</span></div>
            <div><CheckCircle2 size={17} /><span>Validation CNE / CIN instantanée</span></div>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className={`auth-card card ${registration ? "registration-card" : ""}`}>
          <div className="profile-selector">
            <p className="auth-label">Je suis</p>
            <div className="profile-grid">
              {profileOptions.map(({ key, label, description, icon: Icon, tone }) => (
                <button type="button" key={key} className={`profile-option ${role === key ? "active" : ""} profile-${tone}`} onClick={() => setRole(key)}>
                  <Icon size={17} />
                  <span><strong>{label}</strong><small>{description}</small></span>
                  {role === key && <Check size={15} />}
                </button>
              ))}
            </div>
          </div>
          <div className="auth-heading">
            <div className={`icon-tile profile-${selectedProfile.tone}`}><SelectedProfileIcon size={21} /></div>
            <div><h2>{registration ? `Inscription ${selectedProfile.label}` : `Espace ${selectedProfile.label}`}</h2><p>{registration ? "Complétez votre dossier en quelques étapes guidées." : "Accédez à votre espace sécurisé et personnalisé."}</p></div>
          </div>
          {registration ? (
            <div className="registration-flow">
              <div className="registration-progress" aria-label={`Étape ${registrationStep} sur 4`}>
                {["Profil", "Sujets", "Pièces", "Confirmation"].map((label, index) => {
                  const step = index + 1;
                  return <div key={label} className={`registration-progress-step ${registrationStep >= step ? "complete" : ""} ${registrationStep === step ? "current" : ""}`}><span>{registrationStep > step ? <Check size={13} /> : step}</span><small>{label}</small></div>;
                })}
              </div>
              {registrationStep === 1 && <div className="registration-panel stack"><label>Nom complet<input placeholder="Ex. Candidat Exemple" /></label><label>Email universitaire<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="prenom.nom@usmba.ac.ma" /></label><div className="form-grid"><label>CNE / CIN<input placeholder="Votre identifiant" /></label><label>Établissement<input placeholder="Université / faculté" /></label></div></div>}
              {registrationStep === 2 && <div className="registration-panel"><div className="subject-selection-heading"><div><strong>Choisissez vos sujets d’intérêt</strong><p>Sélectionnez au moins un sujet, jusqu’à 3 préférences.</p></div><Badge tone="blue">{selectedSubjects.length}/3</Badge></div><div className="search-input registration-search"><Search size={16} /><input value={subjectQuery} onChange={(e) => setSubjectQuery(e.target.value)} placeholder="Rechercher un sujet…" /></div><div className="subject-choice-list">{filteredSubjects.map((subject) => <label className={`subject-choice ${selectedSubjects.includes(subject) ? "selected" : ""}`} key={subject}><input type="checkbox" checked={selectedSubjects.includes(subject)} onChange={() => setSelectedSubjects((current) => current.includes(subject) ? current.filter((item) => item !== subject) : current.length < 3 ? [...current, subject] : current)} /><span>{subject}</span>{selectedSubjects.includes(subject) && <Check size={16} />}</label>)}{filteredSubjects.length === 0 && <p className="empty-choice">Aucun sujet ne correspond à votre recherche.</p>}</div></div>}
              {registrationStep === 3 && <div className="registration-panel document-list"><strong>Pièces de votre dossier</strong><p>Ajoutez les documents demandés pour accélérer l’étude de votre candidature.</p>{["CV détaillé", "Diplôme ou attestation de réussite", "Projet de recherche (PDF)"].map((document) => <label key={document}><span><FileCheck2 size={17} />{document}</span><input type="file" /></label>)}</div>}
              {registrationStep === 4 && <div className="registration-panel confirmation-panel"><div className="success-icon"><CheckCircle2 size={30} /></div><h3>Votre dossier est prêt</h3><p>Vérifiez vos informations et envoyez votre candidature. Vous pourrez suivre chaque validation depuis votre espace.</p><div className="summary-row"><span>Profil</span><strong>{selectedProfile.label}</strong></div><div className="summary-row"><span>Sujets sélectionnés</span><strong>{selectedSubjects.length}</strong></div></div>}
              <div className="registration-actions"><button className="button button-secondary" disabled={registrationStep === 1} onClick={() => setRegistrationStep((step) => step - 1)}>Retour</button><button className="button button-primary" disabled={registrationStep === 2 && selectedSubjects.length === 0} onClick={() => registrationStep === 4 ? onLogin(email || "candidat@usmba.ac.ma", role) : setRegistrationStep((step) => step + 1)}>{registrationStep === 4 ? "Envoyer ma candidature" : "Continuer"} <ArrowRight size={16} /></button></div>
            </div>
          ) : <form onSubmit={submit} className="stack">
            <label>Email universitaire<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="prenom.nom@usmba.ac.ma" /></label>
            {email && <div className={`inline-hint ${isInstitutional ? "success" : "warning"}`}>{isInstitutional ? <><Check size={15} /> Domaine USMBA détecté · SSO Google disponible</> : <><AlertCircle size={15} /> Compte externe · vérification manuelle requise</>}</div>}
            <label>Mot de passe<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="6 caractères minimum" /></label>
            {submitted && !validEmail && <p className="form-error">Utilisez votre adresse institutionnelle au format prenom.nom@usmba.ac.ma.</p>}
            {submitted && !validPassword && <p className="form-error">Le mot de passe doit contenir au moins 6 caractères.</p>}
            <button className="button button-primary button-wide" type="submit">Accéder à mon espace {selectedProfile.label} <ArrowRight size={17} /></button>
          </form>}
          {!registration && <button className="demo-link" onClick={() => onLogin("demo.candidat@usmba.ac.ma", role)}>Demo</button>}
          <p className="auth-footnote"><ShieldCheck size={14} /> Vos données sont traitées dans un espace sécurisé.</p>
        </motion.div>
      </div>
    </main>
  );
}

function Header({ role, userName, canSwitchRole, onRoleChange, onMenu, notifications, onMarkNotificationsRead }: { role: Role; userName: string; canSwitchRole: boolean; onRoleChange: (role: Role) => void; onMenu: () => void; notifications: NotificationItem[]; onMarkNotificationsRead: () => void }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  return (
    <header className="topbar">
      <div className="header-left">
        <button className="mobile-menu" onClick={onMenu} aria-label="Ouvrir le menu">
          <Menu size={21} />
        </button>
        <div className="header-brand-wrap">
          <img src="/logo.jpg" alt="Université Sidi Mohamed Ben Abdellah" className="header-university-logo" />
          <div className="header-brand-text">
            <strong>USMBA</strong>
            <span>Centre des Études Doctorales</span>
          </div>
        </div>
      </div>
      <div className="topbar-actions">
        <div className="notification-wrap">
          <button
            className="icon-button notification"
            onClick={() => setNotificationsOpen((open) => !open)}
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
          >
            <Bell size={18} />
            {unreadCount > 0 && <i />}
          </button>
          {notificationsOpen && (
            <div className="notification-panel">
              <div className="notification-heading">
                <strong>Notifications</strong>
                <button onClick={onMarkNotificationsRead}>Tout marquer comme lu</button>
              </div>
              {notifications.length === 0 ? (
                <p className="notification-empty">Aucune notification.</p>
              ) : (
                notifications.map((notification) => (
                  <div className={`notification-item ${notification.read ? "read" : ""}`} key={notification.id}>
                    <span className={`notification-dot ${notification.tone}`} />
                    <div>
                      <strong>{notification.title}</strong>
                      <p>{notification.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        {canSwitchRole ? (
          <RoleSwitcher role={role} onChange={onRoleChange} />
        ) : (
          <div className="role-picker">
            <span className="role-dot" />
            <strong>{roleLabels[role]}</strong>
          </div>
        )}
        <div className="avatar">{userName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
      </div>
    </header>
  );
}

function Sidebar({ view, setView, open, role, userName, onLogout, onClose }: { view: View; setView: (view: View) => void; open: boolean; role: Role; userName: string; onLogout: () => void; onClose: () => void }) {
  const allLinks: { key: View; label: string; icon: typeof LayoutDashboard; count?: string }[] = [
    { key: "dashboard", label: "Vue d’ensemble", icon: LayoutDashboard },
    { key: "subjects", label: "Sujets de recherche", icon: BookOpen, count: "3" },
    { key: "candidates", label: "Candidatures", icon: Users, count: "12" },
    { key: "reregistration", label: "Réinscription", icon: ClipboardCheck },
    { key: "profile", label: "Mon profil", icon: UserRound },
  ];
  const links = allLinks.filter((link) => roleViews[role].includes(link.key));
  return <>
    {open && <div className="sidebar-backdrop" onClick={onClose} />}
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-logo-wrap">
          <img src="/logo.jpg" alt="USMBA" className="sidebar-university-logo" />
        </div>
        <div><strong>GCD<span>+</span></strong><small>Gestion du cycle doctoral</small></div>
        <button type="button" className="sidebar-close" onClick={onClose} aria-label="Fermer le volet">
          <PanelLeftClose size={18} />
        </button>
      </div>
      <div className="context-badge"><span className="status-live" /><div><small>Profil actif</small><strong>{roleLabels[role]}</strong></div><MoreHorizontal size={17} /></div>
      <nav>{links.map(({ key, label, icon: Icon, count }) => <button key={key} className={view === key ? "active" : ""} onClick={() => setView(key)}><Icon size={18} /><span>{label}</span>{count && <em>{count}</em>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><Sparkles size={17} /><strong>Besoin d’aide ?</strong><p>Le guide du parcours doctoral USMBA est disponible pour votre rôle.</p></div><div className="profile-row"><div className="avatar">{userName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div><div><strong>{userName}</strong><small>{roleLabels[role]}</small></div><button className="logout-button" onClick={onLogout} aria-label="Se déconnecter" title="Se déconnecter"><LogOut size={15} /></button></div></div>
    </aside>
  </>;
}

function StatCard({ stat }: { stat: DashboardStats }) {
  const Icon = stat.icon === "subjects" ? BookOpen : stat.icon === "pending" ? Clock3 : stat.icon === "oral" ? Bell : Activity;
  return <GlassCard className="stat-card"><div className={`stat-icon ${stat.tone}`}><Icon size={19} /></div><div className="stat-copy"><span>{stat.label}</span><strong>{stat.value}</strong><small className={stat.trend.startsWith("+") ? "trend-up" : ""}>{stat.trend}</small></div><MoreHorizontal size={17} className="muted-icon" /></GlassCard>;
}

function ProfileView({
  role,
  userName,
  email,
  applicationData,
  onNameChange,
  onDeleteCandidate,
}: {
  role: Role;
  userName: string;
  email: string;
  applicationData?: ApplicationData;
  onNameChange: (name: string) => void;
  onDeleteCandidate?: () => void;
}) {
  const [name, setName] = useState(userName);
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const draftData = useMemo(() => {
    if (applicationData) return null;
    try {
      const raw = localStorage.getItem("gcd_candidate_draft");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [applicationData]);

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onNameChange(name.trim() || userName);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="page profile-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ESPACE PERSONNEL</p>
          <h1>Mon profil</h1>
          <p className="subheading">Gérez vos informations et consultez les droits liés à votre rôle.</p>
        </div>
        <Badge tone="green"><ShieldCheck size={14} /> Compte sécurisé</Badge>
      </div>

      <div className="profile-layout">
        <GlassCard className="profile-main-card">
          <div className="profile-cover">
            <div className="profile-large-avatar">
              {name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2>{name}</h2>
              <p>{roleLabels[role]} · {email}</p>
            </div>
          </div>
          <form className="profile-form" onSubmit={saveProfile}>
            <div className="form-grid">
              <label>Nom complet<input value={name} onChange={(event) => setName(event.target.value)} /></label>
              <label>Email<input value={email} readOnly /></label>
              <label>Téléphone<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+212 6 00 00 00 00" /></label>
              <label>Rôle<input value={roleLabels[role]} readOnly /></label>
            </div>
            <div className="profile-form-actions">
              <button className="button button-primary" type="submit"><Save size={16} /> Enregistrer</button>
              {saved && <Badge tone="green"><Check size={13} /> Informations enregistrées</Badge>}
            </div>
          </form>
        </GlassCard>

        <GlassCard className="profile-side-card">
          <div className="section-heading">
            <div>
              <h2>Mes droits d’accès</h2>
              <p>Modules disponibles pour votre rôle</p>
            </div>
          </div>
          <div className="permission-list">
            {roleViews[role].filter((view) => view !== "profile").map((view) => (
              <div className="permission-item" key={view}>
                <CheckCircle2 size={16} />
                <span>
                  {view === "dashboard" ? "Tableau de bord" : view === "subjects" ? "Sujets de recherche" : view === "candidates" ? "Gestion des candidatures" : "Réinscription"}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="profile-security-card">
          <div className="section-heading">
            <div>
              <h2>Sécurité</h2>
              <p>Le mot de passe est conservé localement pour cette démonstration.</p>
            </div>
          </div>
          <label className="security-field">
            Nouveau mot de passe
            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="6 caractères minimum" />
          </label>
          <button className="button button-secondary" disabled={newPassword.length < 6} onClick={() => setNewPassword("")}>
            Mettre à jour le mot de passe
          </button>
        </GlassCard>

        {role === "candidat" && (
          <GlassCard className="profile-application-card">
            <div className="section-heading">
              <div>
                <h2>Ma candidature doctorale</h2>
                <p>État du dossier et gestion</p>
              </div>
            </div>
            {applicationData ? (
              <>
                <div className="profile-application-status">
                  <Badge tone="green">Candidature transmise</Badge>
                  <span>{applicationData.selectedSubjects.length} sujet(s) · {applicationData.university}</span>
                </div>
                <p className="profile-application-subject">{applicationData.selectedSubjects.join(" · ")}</p>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setShowDeleteModal(true)}
                  style={{ color: "#ff8296", marginTop: "14px", width: "100%", fontSize: "11px" }}
                >
                  <Trash2 size={13} /> Supprimer définitivement ma candidature
                </button>
              </>
            ) : draftData ? (
              <>
                <div className="profile-application-status">
                  <Badge tone="amber">Non complété (Brouillon)</Badge>
                  <span>Sauvegardé à {draftData.lastSaved || "récemment"}</span>
                </div>
                <p className="profile-application-subject">Un brouillon a été automatiquement sauvegardé sur cet appareil.</p>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setShowDeleteModal(true)}
                  style={{ color: "#ff8296", marginTop: "14px", width: "100%", fontSize: "11px" }}
                >
                  <Trash2 size={13} /> Supprimer définitivement ce brouillon
                </button>
              </>
            ) : (
              <p className="profile-empty">Aucune candidature enregistrée pour le moment.</p>
            )}
          </GlassCard>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          onDeleteCandidate?.();
        }}
        candidateName={applicationData?.fullName || draftData?.personal?.fullName || userName}
        isDraft={Boolean(draftData && !applicationData)}
        title={applicationData ? "Suppression définitive de votre candidature" : "Suppression définitive du brouillon"}
        message={
          applicationData
            ? "Êtes-vous sûr de vouloir supprimer définitivement votre candidature ? Cette action est irréversible et supprimera votre dossier ainsi que tous vos diplômes et justificatifs téléversés."
            : "Êtes-vous sûr de vouloir supprimer définitivement ce brouillon ?"
        }
      />
    </div>
  );
}

function Dashboard({
  onNavigate,
  role,
  userName,
  onApply,
  onEditApplication,
  applicationData,
  candidatesCount,
  onDeleteApplication,
}: {
  onNavigate: (view: View) => void;
  role: Role;
  userName: string;
  onApply: () => void;
  onEditApplication: () => void;
  applicationData?: ApplicationData;
  candidatesCount: number;
  onDeleteApplication?: () => void;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const applicationSubmitted = Boolean(applicationData);

  const draftData = useMemo(() => {
    if (applicationSubmitted) return null;
    try {
      const raw = localStorage.getItem("gcd_candidate_draft");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [applicationSubmitted, applicationData]);

  const hasDraft = Boolean(draftData);

  if (role === "candidat") {
    return (
      <div className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">ESPACE CANDIDAT · PORTAIL DOCTORAL</p>
            <h1>Bonjour, {userName} <span>👋</span></h1>
            <p className="subheading">
              {applicationSubmitted
                ? "Votre candidature est enregistrée et en cours d'instruction par les commissions."
                : hasDraft
                ? "Votre dossier est en cours de saisie (sauvegarde automatique active)."
                : "Déposez votre candidature, téléversez vos diplômes et suivez son traitement."}
            </p>
          </div>
          <div>
            {applicationSubmitted ? (
              <Badge tone="green"><CheckCircle2 size={13} /> Candidature transmise</Badge>
            ) : hasDraft ? (
              <Badge tone="amber"><Clock3 size={13} /> Non complété (Brouillon)</Badge>
            ) : (
              <button className="button button-primary" onClick={onApply}>
                <BookOpen size={17} /> Déposer une candidature
              </button>
            )}
          </div>
        </div>

        {/* Offline / Autosave Banner */}
        {hasDraft && !applicationSubmitted && (
          <div
            style={{
              padding: "12px 18px",
              background: "rgba(242, 191, 117, 0.1)",
              border: "1px solid rgba(242, 191, 117, 0.3)",
              borderRadius: "12px",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <RotateCcw size={18} color="#f2bf75" />
              <div>
                <strong style={{ fontSize: "12px", color: "var(--text)" }}>Brouillon sauvegardé automatiquement</strong>
                <p style={{ fontSize: "11px", color: "var(--muted)", margin: "2px 0 0" }}>
                  Dernière sauvegarde locale à <strong>{draftData?.lastSaved || "récemment"}</strong>. Si vous fermez la page ou perdez la connexion, vos informations et diplômes restent conservés.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="button button-primary" onClick={onApply} style={{ height: "32px", fontSize: "11px" }}>
                <RotateCcw size={13} /> Reprendre le dossier
              </button>
              <button
                className="button button-secondary"
                style={{ height: "32px", fontSize: "11px", color: "#ff8296" }}
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 size={13} /> Supprimer
              </button>
            </div>
          </div>
        )}

        <div className="candidate-home-grid">
          <GlassCard className="candidate-apply-card">
            <div className="side-icon">
              {hasDraft ? <RotateCcw size={20} /> : <BookOpen size={20} />}
            </div>
            <h2>
              {applicationSubmitted
                ? "Dossier transmis avec succès"
                : hasDraft
                ? "Brouillon en cours de finalisation"
                : "Votre candidature doctorale"}
            </h2>
            <p>
              {applicationSubmitted
                ? "Votre dossier complet avec vos diplômes et justificatifs a été transmis aux commissions. Vous pouvez consulter les détails ou le supprimer définitivement."
                : hasDraft
                ? `Vous avez déjà commencé à compléter votre candidature (étape ${draftData?.step || 1} sur 4). Cliquez ci-dessous pour reprendre là où vous vous étiez arrêté.`
                : "Renseignez votre parcours, téléversez vos diplômes (Bac, Licence, Master) et choisissez jusqu’à 3 sujets de thèse."}
            </p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" }}>
              {applicationSubmitted ? (
                <>
                  <button className="button button-secondary" onClick={onEditApplication}>
                    Consulter / modifier ma candidature <ArrowRight size={16} />
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setShowDeleteModal(true)}
                    style={{ color: "#ff8296", border: "1px solid rgba(255, 130, 150, 0.3)" }}
                  >
                    <Trash2 size={15} /> Supprimer définitivement ma candidature
                  </button>
                </>
              ) : hasDraft ? (
                <>
                  <button className="button button-primary" onClick={onApply}>
                    <RotateCcw size={16} /> Reprendre et finaliser ma candidature <ArrowRight size={16} />
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setShowDeleteModal(true)}
                    style={{ color: "#ff8296" }}
                  >
                    <Trash2 size={15} /> Supprimer ce brouillon
                  </button>
                </>
              ) : (
                <button className="button button-primary" onClick={onApply}>
                  Commencer ma candidature <ArrowRight size={16} />
                </button>
              )}
            </div>
          </GlassCard>

          <GlassCard className="candidate-status-card">
            <p className="eyebrow">
              {applicationSubmitted ? "SUIVI DU DOSSIER EN DIRECT" : "ÉTAT DU BROUILLON"}
            </p>
            {applicationSubmitted ? (
              <>
                <h2>Dossier transmis · {applicationData?.fullName}</h2>
                <div className="candidate-progress-list">
                  {["Informations personnelles", "Diplômes & Justificatifs téléversés", "Choix du sujet doctoral", "Instruction par la commission"].map((label, index) => (
                    <div className={`candidate-progress-item ${index < 3 ? "complete" : "current"}`} key={label}>
                      <span>{index < 3 ? <Check size={13} /> : index + 1}</span>
                      <div>
                        <strong>{label}</strong>
                        <small>{index < 3 ? "Terminé" : "En cours d'examen"}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : hasDraft ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2>Statut : Non complété</h2>
                  <span className="badge badge-amber">Brouillon</span>
                </div>
                <div className="candidate-progress-list">
                  <div className={`candidate-progress-item ${draftData?.personal?.fullName ? "complete" : "current"}`}>
                    <span>{draftData?.personal?.fullName ? <Check size={13} /> : 1}</span>
                    <div>
                      <strong>Profil personnel</strong>
                      <small>{draftData?.personal?.fullName ? draftData.personal.fullName : "À compléter"}</small>
                    </div>
                  </div>
                  <div className={`candidate-progress-item ${Object.keys(draftData?.files || {}).length > 0 ? "complete" : "current"}`}>
                    <span>{Object.keys(draftData?.files || {}).length > 0 ? <Check size={13} /> : 2}</span>
                    <div>
                      <strong>Parcours & Diplômes</strong>
                      <small>{Object.keys(draftData?.files || {}).length} pièce(s) jointe(s)</small>
                    </div>
                  </div>
                  <div className={`candidate-progress-item ${(draftData?.selectedSubjects?.length || 0) > 0 ? "complete" : ""}`}>
                    <span>{(draftData?.selectedSubjects?.length || 0) > 0 ? <Check size={13} /> : 3}</span>
                    <div>
                      <strong>Sujets de recherche</strong>
                      <small>{draftData?.selectedSubjects?.length || 0} sujet(s) sélectionné(s)</small>
                    </div>
                  </div>
                  <div className="candidate-progress-item">
                    <span>4</span>
                    <div>
                      <strong>Transmission définitive</strong>
                      <small style={{ color: "#efbf76" }}>En attente de validation</small>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2>Aucune candidature déposée</h2>
                <p>Votre progression en temps réel et vos sauvegardes automatiques apparaîtront ici.</p>
              </>
            )}
          </GlassCard>
        </div>

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            setShowDeleteModal(false);
            onDeleteApplication?.();
          }}
          candidateName={applicationData?.fullName || draftData?.personal?.fullName || userName}
          isDraft={hasDraft && !applicationSubmitted}
          title={
            applicationSubmitted
              ? "Suppression définitive de votre candidature"
              : "Suppression définitive du brouillon"
          }
          message={
            applicationSubmitted
              ? "Êtes-vous sûr de vouloir supprimer définitivement votre candidature ? Cette action est irréversible et supprimera l'ensemble de votre dossier ainsi que vos fichiers associés."
              : "Êtes-vous sûr de vouloir supprimer définitivement ce brouillon et réinitialiser toutes les données saisies ?"
          }
        />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ESPACE {roleLabels[role].toUpperCase()}</p>
          <h1>Bonjour {userName} <span>👋</span></h1>
          <p className="subheading">Gérez les candidatures, contrôlez les diplômes et validez les étapes du cycle doctoral.</p>
        </div>
        {role !== "chef-projet" && (
          <button className="button button-secondary" onClick={() => onNavigate("reregistration")}>
            <ClipboardCheck size={17} /> Réinscriptions
          </button>
        )}
      </div>
      <div className="stats-grid">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.label}
            stat={stat.label === "Dossiers en attente" ? { ...stat, value: String(candidatesCount).padStart(2, "0") } : stat}
          />
        ))}
      </div>
      <div className="content-grid dashboard-grid">
        <GlassCard className="activity-card">
          <div className="section-heading">
            <div>
              <h2>À traiter maintenant</h2>
              <p>Les actions prioritaires de votre espace</p>
            </div>
            <button className="text-button" onClick={() => onNavigate("candidates")}>
              Tout voir <ArrowRight size={14} />
            </button>
          </div>
          <div className="task-list">
            <div className="task-item">
              <div className="task-icon amber"><FileCheck2 size={18} /></div>
              <div>
                <strong>Valider le rapport annuel de Doctorant #001</strong>
                <span>Réinscription · reçu il y a 2 h</span>
              </div>
              <Badge tone="amber">À valider</Badge>
              <button className="round-arrow"><ArrowRight size={15} /></button>
            </div>
            <div className="task-item">
              <div className="task-icon violet"><BookOpen size={18} /></div>
              <div>
                <strong>3 sujets attendent votre avis</strong>
                <span>Étape 1 sur 3 · Centre CED</span>
              </div>
              <Badge tone="violet">En cours</Badge>
              <button className="round-arrow" onClick={() => onNavigate("subjects")}><ArrowRight size={15} /></button>
            </div>
            <div className="task-item">
              <div className="task-icon green"><Users size={18} /></div>
              <div>
                <strong>{candidatesCount} dossiers de candidatures</strong>
                <span>Consultez les pièces et gérez les statuts</span>
              </div>
              <Badge tone="green">Actif</Badge>
              <button className="round-arrow" onClick={() => onNavigate("candidates")}><ArrowRight size={15} /></button>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="deadline-card">
          <div className="section-heading">
            <div>
              <h2>Prochains oraux & Commissions</h2>
              <p>Votre agenda doctoral</p>
            </div>
          </div>
          <div className="calendar-date"><strong>NOV</strong><span>15</span><small>LUN</small></div>
          <div className="deadline-info">
            <strong>Entretiens de sélection</strong>
            <span>Candidats retenus · Salle des commissions</span>
            <div className="people-stack"><span>KF</span><span>OB</span><span>+4</span></div>
          </div>
          <div className="deadline-time"><strong>09:00</strong><span>cette semaine</span></div>
        </GlassCard>
      </div>
      <GlassCard className="recent-card">
        <div className="section-heading">
          <div>
            <h2>Activité récente</h2>
            <p>Les dernières mises à jour du registre doctoral</p>
          </div>
          <button className="text-button">Voir l’historique <ArrowRight size={14} /></button>
        </div>
        <div className="activity-feed">
          {activities.map((item) => (
            <div className="feed-row" key={item.id}>
              <div className={`feed-icon ${item.tone}`}>
                {item.icon === "check" ? <CheckCircle2 size={17} /> : item.icon === "subject" ? <BookOpen size={17} /> : <Users size={17} />}
              </div>
              <div>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </div>
              <time>{item.time}</time>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function SearchBar({ query, setQuery, showFilters, setShowFilters }: { query: string; setQuery: (value: string) => void; showFilters: boolean; setShowFilters: (value: boolean) => void }) {
  return <div className="search-panel"><div className="search-input"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher par nom, CNE ou mot-clé du sujet…" /><kbd>⌘ K</kbd>{query && <button onClick={() => setQuery("")}><X size={15} /></button>}</div><button className={`filter-button ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(!showFilters)}><Filter size={16} /> Filtres avancés <ChevronDown size={15} /></button>{showFilters && <div className="advanced-filters"><select><option>Établissement : tous</option><option>Faculté des Sciences de Fès</option><option>FST Fès</option><option>FSJES Fès</option><option>ENSA Fès</option></select><select><option>Statut : tous</option><option>Nouveaux dossiers</option><option>Entretiens</option><option>Évaluation</option><option>Admis</option></select><Badge tone="blue">Filtres actifs</Badge></div>}{query && <div className="search-meta">Résultats actualisés automatiquement</div>}</div>;
}

function SubjectStepper({ subject, onClose, onValidated }: { subject: DoctoralSubject; onClose: () => void; onValidated: (subject: DoctoralSubject) => void }) {
  const [active, setActive] = useState(1);
  const validateStep = () => {
    if (active < 2) {
      setActive(active + 1);
      return;
    }
    onValidated({ ...subject, currentStep: 2, status: "Validé" });
    onClose();
  };
  return <div className="modal-backdrop" onClick={onClose}><motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="modal stepper-modal" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow">SUIVI DE VALIDATION</p><h2>{subject.title}</h2><p>{subject.doctorant} · {subject.cne}</p></div><button className="icon-button" onClick={onClose}><X size={18} /></button></div><div className="stepper">{subjectSteps.map((step, index) => <button key={step.label} onClick={() => setActive(index)} className={`step ${index <= active ? "done" : ""} ${index === active ? "current" : ""}`}><span>{index < active ? <Check size={15} /> : index + 1}</span><div><strong>{step.label}</strong><small>{index < active ? step.date : index === active ? "En attente de votre avis" : "À venir"}</small></div></button>)}</div><div className="step-detail"><div className="detail-title"><div className={`task-icon ${active === 2 ? "green" : "violet"}`}><ClipboardCheck size={19} /></div><div><h3>{subjectSteps[active].label}</h3><span>Responsable : {subjectSteps[active].owner}</span></div><Badge tone={active < 2 ? "amber" : "green"}>{active < 2 ? "En attente" : "Validé"}</Badge></div><p>{active === 1 ? "Votre avis permet au Centre CED de vérifier la cohérence scientifique et la disponibilité de l’encadrement." : "Cette étape a été validée avec succès. L’historique reste disponible pour chaque membre habilité."}</p>{active === 1 && <textarea placeholder="Ajouter un commentaire ou une demande d’ajustement…" />}</div><div className="modal-actions">{active > 0 && <button className="button button-secondary" onClick={() => setActive(active - 1)}>Étape précédente</button>}<button className="button button-primary" onClick={validateStep}>{active < 2 ? "Valider et continuer" : "Valider le sujet"} <ArrowRight size={16} /></button></div></motion.div></div>;
}

function SubjectsView() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 300);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<DoctoralSubject | null>(null);
  const [subjects, setSubjects] = useState(seedSubjects);
  const filtered = useMemo(() => subjects.filter((item) => `${item.title} ${item.doctorant} ${item.cne}`.toLowerCase().includes(debouncedQuery.toLowerCase())), [debouncedQuery, subjects]);
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">PILOTAGE SCIENTIFIQUE</p><h1>Sujets de recherche</h1><p className="subheading">Visualisez l’avancement de chaque validation, sans perdre le fil.</p></div></div><SearchBar query={query} setQuery={setQuery} showFilters={showFilters} setShowFilters={setShowFilters} /><div className="table-card card"><div className="table-toolbar"><span>{filtered.length} sujets affichés</span><div className="toolbar-actions"><Badge tone="amber">{subjects.filter((item) => item.status === "En attente").length} en attente</Badge></div></div><div className="subject-list">{filtered.map((subject) => <div className="subject-row" key={subject.id} onClick={() => setSelected(subject)}><div className="subject-main"><div className="subject-avatar">{subject.doctorant.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><div><strong>{subject.title}</strong><span>{subject.doctorant} · {subject.cne} · {subject.laboratoire}</span></div></div><div className="subject-progress">{subjectSteps.map((step, index) => <span key={step.label} className={index < subject.currentStep ? "complete" : index === subject.currentStep ? "current" : ""} title={step.label} />)}<small>{subject.currentStep + 1}/3</small></div><Badge tone={subject.status === "Validé" ? "green" : subject.status === "Rejeté" ? "red" : "amber"}>{subject.status}</Badge><ArrowRight size={17} className="row-arrow" /></div>)}{filtered.length === 0 && <div className="empty-state"><Search size={24} /><strong>Aucun sujet trouvé</strong><span>Essayez un autre nom, CNE ou mot-clé.</span></div>}</div></div>{selected && <SubjectStepper subject={selected} onClose={() => setSelected(null)} onValidated={(updated) => { setSubjects((items) => items.map((item) => item.id === updated.id ? updated : item)); setSelected(null); }} />}</div>;
}

interface CandidatesViewProps {
  candidates: Candidate[];
  onStatusChange: (candidateId: string, newStatus: CandidateStatus) => void;
  onToggleDocumentVerify?: (candidateId: string, label: string) => void;
  onScoreChange?: (candidateId: string, score: number) => void;
}

function CandidatesView({
  candidates,
  onStatusChange,
  onToggleDocumentVerify,
  onScoreChange,
}: CandidatesViewProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMobileTab, setActiveMobileTab] = useState<string>("all");
  const [inspectCandidate, setInspectCandidate] = useState<Candidate | null>(null);

  const toggle = (id: string) => setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const moveSelected = (status: CandidateStatus) => {
    selected.forEach((id) => onStatusChange(id, status));
    setSelected([]);
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchSearch = `${c.name || c.fullName} ${c.cne} ${c.subject || c.selectedTopic}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      if (activeMobileTab === "all") return true;
      return c.status === activeMobileTab;
    });
  }, [candidates, searchQuery, activeMobileTab]);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ADMISSIONS DOCTORALES · CEDOC USMBA</p>
          <h1>Gestion des candidatures</h1>
          <p className="subheading">
            Consultez les pièces jointes des candidats et faites évoluer leur statut en toute liberté.
          </p>
        </div>
      </div>

      {/* Search & Mobile Status Tabs */}
      <div style={{ marginBottom: "16px" }}>
        <div className="search-input" style={{ marginBottom: "12px" }}>
          <Search size={18} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom de candidat, CNE, sujet..."
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}>
              <X size={15} />
            </button>
          )}
        </div>

        {/* Mobile / Tablet Friendly Filter Tabs */}
        <div className="mobile-pipeline-tabs">
          <button
            type="button"
            className={`pipeline-tab-btn ${activeMobileTab === "all" ? "active" : ""}`}
            onClick={() => setActiveMobileTab("all")}
          >
            Tous les profils <em>{candidates.length}</em>
          </button>
          {candidateColumns.map((col) => {
            const count = candidates.filter((c) => c.status === col.key).length;
            return (
              <button
                type="button"
                key={col.key}
                className={`pipeline-tab-btn ${activeMobileTab === col.key ? "active" : ""}`}
                onClick={() => setActiveMobileTab(col.key)}
              >
                <span className={`column-dot ${col.tone}`} />
                {col.label} <em>{count}</em>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.length > 0 && (
        <div className="bulk-bar" style={{ flexWrap: "wrap", gap: "8px" }}>
          <strong>{selected.length} dossier(s) sélectionné(s) :</strong>
          <button onClick={() => moveSelected("interview")}>Passer en entretien</button>
          <button onClick={() => moveSelected("scored")}>Passer en évaluation</button>
          <button onClick={() => moveSelected("accepted")}>Admettre</button>
          <button onClick={() => moveSelected("rejected")}>Refuser</button>
          <button onClick={() => setSelected([])}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* Kanban Board Grid */}
      <div className="kanban">
        {candidateColumns.map((column) => {
          const colCandidates = (activeMobileTab === "all" || activeMobileTab === column.key)
            ? filteredCandidates.filter((item) => item.status === column.key)
            : [];

          return (
            <div className="kanban-column" key={column.key}>
              <div className="kanban-heading">
                <div>
                  <span className={`column-dot ${column.tone}`} />
                  <strong>{column.label}</strong>
                  <em>{candidates.filter((item) => item.status === column.key).length}</em>
                </div>
              </div>

              <div className="kanban-list">
                {colCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    selected={selected.includes(candidate.id)}
                    onToggle={() => toggle(candidate.id)}
                    onInspect={() => setInspectCandidate(candidate)}
                    onStatusChange={(newStatus) => onStatusChange(candidate.id, newStatus)}
                  />
                ))}

                {colCandidates.length === 0 && (
                  <div style={{ padding: "18px 10px", textAlign: "center", color: "var(--muted)", fontSize: "11px" }}>
                    Aucun dossier dans cette colonne
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect and Edit Candidate Modal */}
      {inspectCandidate && (
        <CandidateDetailModal
          candidate={inspectCandidate}
          onClose={() => setInspectCandidate(null)}
          onStatusChange={(id, newStatus) => {
            onStatusChange(id, newStatus);
            setInspectCandidate((prev) => (prev && prev.id === id ? { ...prev, status: newStatus } : null));
          }}
          onToggleDocumentVerify={onToggleDocumentVerify}
          onScoreChange={onScoreChange}
        />
      )}
    </div>
  );
}

function CandidateCard({
  candidate,
  selected,
  onToggle,
  onInspect,
  onStatusChange,
}: {
  candidate: Candidate;
  selected: boolean;
  onToggle: () => void;
  onInspect: () => void;
  onStatusChange: (status: CandidateStatus) => void;
}) {
  const fileEntries = Object.entries(candidate.files || {});
  const hasFiles = fileEntries.length > 0;

  return (
    <motion.div
      layout
      className={`candidate-card ${selected ? "selected" : ""}`}
      style={{ cursor: "pointer" }}
      onClick={onInspect}
    >
      <div className="candidate-top" onClick={(e) => e.stopPropagation()}>
        <button className={`checkbox ${selected ? "checked" : ""}`} onClick={onToggle}>
          {selected && <Check size={13} />}
        </button>
        <Badge tone={candidate.score >= 85 ? "green" : candidate.score >= 70 ? "amber" : "neutral"}>
          {candidate.academicScore || candidate.score}/100
        </Badge>
        {hasFiles && (
          <span className="badge badge-blue" style={{ fontSize: "9px", padding: "1px 5px", marginLeft: "auto" }}>
            <FileText size={10} style={{ display: "inline", marginRight: "3px" }} />
            {fileEntries.length} pièce(s)
          </span>
        )}
      </div>

      <div className="candidate-person">
        <div className="subject-avatar">
          {candidate.initials || candidate.name?.slice(0, 2).toUpperCase() || "CD"}
        </div>
        <div>
          <strong>{candidate.fullName || candidate.name}</strong>
          <span>{candidate.cne} · {candidate.university || "USMBA"}</span>
        </div>
      </div>

      <p>{candidate.subject || candidate.selectedTopic}</p>

      {/* Flexible Status Changer dropdown on each card */}
      <div
        style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <select
          value={candidate.status}
          onChange={(e) => onStatusChange(e.target.value as CandidateStatus)}
          className="status-quick-select"
          title="Modifier le statut du candidat"
        >
          <option value="received">Nouveau</option>
          <option value="interview">Entretien</option>
          <option value="scored">Évaluation</option>
          <option value="accepted">Admis</option>
          <option value="rejected">Refusé</option>
        </select>

        <button
          type="button"
          className="button button-secondary"
          onClick={onInspect}
          style={{ height: "28px", padding: "0 8px", fontSize: "10px" }}
          title="Consulter le dossier complet et les justificatifs"
        >
          <Eye size={12} /> Dossier
        </button>
      </div>

      <div className="candidate-meta" style={{ marginTop: "8px" }}>
        <span>
          <Clock3 size={13} /> {candidate.date || candidate.submittedAt || "Récemment"}
        </span>
        <span className={`mini-status ${candidate.status}`} />
      </div>
    </motion.div>
  );
}

function ReregistrationView() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const steps = ["Rapport d’activité", "Avis encadrant", "Dépôt physique", "Récépissé QR"];
  const workflowDescription = step === 1
    ? "Décrivez l’avancement de vos travaux et vos objectifs pour l’année à venir."
    : step === 2
      ? "Votre encadrant recevra une notification pour signer électroniquement votre rapport."
      : step === 3
        ? "Votre dossier numérique est complet. Déposez les pièces originales au bureau d’ordre."
        : "Générez un QR code unique pour accélérer la réception.";
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">PARCOURS DOCTORAL · ANNÉE 3</p><h1>Réinscription</h1><p className="subheading">Un workflow hybride, guidé de la saisie jusqu’au bureau d’ordre.</p></div><Badge tone="green"><CheckCircle2 size={14} /> Dossier ouvert</Badge></div><div className="rereg-layout"><GlassCard className="workflow-card"><div className="workflow-progress">{steps.map((label, index) => <div className={`workflow-step ${index + 1 <= step ? "active" : ""}`} key={label}><span>{index + 1 < step ? <Check size={14} /> : index + 1}</span><div><strong>{label}</strong><small>{index + 1 < step ? "Terminé" : index + 1 === step ? "En cours" : "À venir"}</small></div></div>)}</div><div className="workflow-content">{done ? <div className="success-panel"><div className="success-icon"><QrCode size={38} /></div><p className="eyebrow">RÉCÉPISSÉ NUMÉRIQUE</p><h2>Votre dossier est prêt.</h2><p>Présentez ce QR code au bureau d’ordre pour synchroniser la réception physique.</p><div className="qr-placeholder"><QrCode size={106} /></div><strong>GCD-2026-00482</strong><button className="button button-primary button-wide"><Download size={16} /> Télécharger le récépissé</button></div> : <><div className="workflow-title"><div><h2>{steps[step - 1]}</h2><p>{workflowDescription}</p></div><span className="completion">{Math.round((step / steps.length) * 100)}%</span></div>{step === 1 && <div className="form-grid"><label>Avancement de la thèse<textarea defaultValue="Les travaux portent sur l’analyse des données collectées au sein du laboratoire."></textarea></label><label>Publications / communications<textarea placeholder="Ajoutez vos productions de l’année…"></textarea></label><label>Prochain objectif<input placeholder="Ex. Soumission de l’article et expérimentation finale" /></label><label>Demande de dérogation<select><option>Aucune dérogation</option><option>Dérogation année supplémentaire</option></select></label></div>}{step === 2 && <div className="review-callout"><CheckCircle2 size={22} /><div><strong>Rapport prêt pour signature</strong><p>Une notification sera envoyée à Pr. Encadrant Référent. Vous pourrez suivre son avis depuis votre espace.</p></div><Badge tone="amber">En attente</Badge></div>}{step === 3 && <div className="physical-checklist">{["Rapport signé par l’encadrant", "Copie CIN / carte étudiant", "Attestation de couverture médicale"].map((item) => <label key={item}><input type="checkbox" defaultChecked /> <span>{item}</span><Check size={16} /></label>)}</div>}{step === 4 && <div className="review-callout green"><QrCode size={25} /><div><strong>Tout est prêt pour le récépissé</strong><p>Le QR code contiendra la référence, la date et l’empreinte de votre dossier.</p></div></div>}<div className="modal-actions"><button className="button button-secondary" disabled={step === 1} onClick={() => setStep(step - 1)}>Retour</button><button className="button button-primary" onClick={() => step === 4 ? setDone(true) : setStep(step + 1)}>{step === 4 ? "Générer le récépissé" : "Enregistrer et continuer"} <ArrowRight size={16} /></button></div></>}</div></GlassCard><GlassCard className="rereg-side"><div className="side-icon"><ShieldCheck size={20} /></div><h3>Éligibilité automatisée</h3><p>Votre progression est calculée à partir des activités déclarées et des validations reçues.</p><div className="eligibility"><div><span>Crédits de formation</span><strong>18 / 20</strong></div><div className="progress-line"><span style={{ width: "90%" }} /></div><div><span>Pièces justificatives</span><strong>4 / 4</strong></div><div className="progress-line green"><span style={{ width: "100%" }} /></div></div><div className="next-deadline"><Clock3 size={16} /><span>Date limite de dépôt<strong>15 novembre 2026</strong></span></div></GlassCard></div></div>;
}

export default function App() {
  const [auth, setAuth] = useState(false);
  const [view, setView] = useState<View>("dashboard");
  const [role, setRole] = useState<Role>("directeur");
  const [demoMode, setDemoMode] = useState(false);
  const [userName, setUserName] = useState("Utilisateur");
  const [userEmail, setUserEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationData>();

  // Shared synchronized candidates state (with localStorage persistence and legacy migration)
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const stored = localStorage.getItem("gcd_candidates_data");
      if (stored) {
        const parsed = JSON.parse(stored);
        const hasLegacyNames = Array.isArray(parsed) && parsed.some((c: any) =>
          c.fullName?.includes("Salma") ||
          c.fullName?.includes("Bennis") ||
          c.fullName?.includes("Khadija") ||
          c.fullName?.includes("Benjelloun") ||
          c.name?.includes("Khadija") ||
          c.name?.includes("Tazi")
        );
        if (!hasLegacyNames) {
          return parsed;
        }
      }
      return seedCandidates;
    } catch {
      return seedCandidates;
    }
  });

  // Save candidates to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem("gcd_candidates_data", JSON.stringify(candidates));
    } catch {
      // Ignore if localStorage quota exceeded
    }
  }, [candidates]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: "n1", title: "3 sujets attendent votre avis", description: "Ouvrez le module Sujets de recherche pour traiter les validations.", tone: "amber", read: false },
    { id: "n2", title: "Dossier reçu", description: "Une nouvelle candidature est disponible dans votre espace.", tone: "blue", read: false },
    { id: "n3", title: "Rapport annuel validé", description: "La réinscription de Doctorant #001 a été mise à jour.", tone: "green", read: true },
  ]);

  // Handler for flexible status changes on any candidate
  const handleCandidateStatusChange = (candidateId: string, newStatus: CandidateStatus) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
    );
  };

  // Handler for document verification toggle by manager
  const handleToggleDocumentVerify = (candidateId: string, label: string) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== candidateId || !c.files) return c;
        const currentFile = c.files[label];
        if (!currentFile) return c;
        const updatedDoc =
          typeof currentFile === "string"
            ? { name: currentFile, verified: true }
            : { ...currentFile, verified: !currentFile.verified };
        return {
          ...c,
          files: { ...c.files, [label]: updatedDoc },
        };
      })
    );
  };

  // Handler for candidate score adjustment
  const handleScoreChange = (candidateId: string, score: number) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? { ...c, score, academicScore: score }
          : c
      )
    );
  };

  // When candidate submits their application: IMMEDIATELY visible for all manager roles!
  const handleApplicationSubmitted = (data: ApplicationData) => {
    setApplicationData(data);
    setApplicationOpen(false);

    // Resolve subject title from mockTopics or fallback
    const matchedTopic = mockTopics.find((t) => data.selectedSubjects.includes(t.id));
    const subjectTitle = matchedTopic ? matchedTopic.title : (data.selectedSubjects[0] || "Sujet doctoral");

    const newCandidate: Candidate = {
      id: `cand-${Date.now()}`,
      name: data.fullName,
      fullName: data.fullName,
      initials: data.fullName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "CD",
      cne: data.cne || "CNE-2026",
      cin: data.cin || "BE123456",
      email: data.email || userEmail || "candidat@usmba.ac.ma",
      phone: data.phone || "+212 6 00 00 00 00",
      address: data.address || "Fès, Maroc",
      subject: subjectTitle,
      selectedTopic: subjectTitle,
      date: "Soumis aujourd'hui",
      submittedAt: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
      score: 85,
      academicScore: 85,
      status: "received",
      university: data.university || "Faculté des Sciences de Fès",
      bacDiploma: data.bacDiploma,
      bacYear: data.bacYear,
      bacUniversity: data.bacUniversity,
      licenceDiploma: data.licenceDiploma,
      licenceYear: data.licenceYear,
      licenceUniversity: data.licenceUniversity,
      masterDiploma: data.masterDiploma,
      masterYear: data.masterYear,
      masterUniversity: data.masterUniversity,
      selectedSubjects: data.selectedSubjects,
      files: data.files,
    };

    // Prepend new candidate to shared candidates list immediately
    setCandidates((prev) => [newCandidate, ...prev.filter((c) => c.cne !== newCandidate.cne)]);

    // Add alert notification for manager
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "Nouvelle candidature reçue",
        description: `${data.fullName} a déposé son dossier pour "${subjectTitle}".`,
        tone: "blue",
        read: false,
      },
      ...prev,
    ]);
  };

  // Offline connectivity detection
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);

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

  // Definitive deletion of candidate application and/or draft
  const handleDefinitiveDeleteCandidate = (candidateCneOrId?: string) => {
    // 1. Clear local draft
    try {
      localStorage.removeItem("gcd_candidate_draft");
    } catch {
      // Ignore
    }

    // 2. Clear active application state
    const targetCne = candidateCneOrId || applicationData?.cne;
    const targetName = applicationData?.fullName;
    setApplicationData(undefined);
    setApplicationOpen(false);

    // 3. Remove candidate from shared database/state
    if (targetCne || targetName) {
      setCandidates((prev) =>
        prev.filter((c) => {
          if (targetCne && (c.cne === targetCne || c.id === targetCne)) return false;
          if (targetName && (c.fullName === targetName || c.name === targetName)) return false;
          return true;
        })
      );
    }

    // 4. Add confirmation notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "Candidature supprimée définitivement",
        description: "L'ensemble de votre dossier et toutes les pièces justificatives associées ont été supprimés.",
        tone: "amber",
        read: false,
      },
      ...prev,
    ]);
  };

  const allowedView = roleViews[role].includes(view) ? view : "dashboard";

  const roleDashboard = role === "candidat" ? (
    <Dashboard
      onNavigate={setView}
      role={role}
      userName={userName}
      applicationData={applicationData}
      onApply={() => setApplicationOpen(true)}
      onEditApplication={() => setApplicationOpen(true)}
      candidatesCount={candidates.length}
      onDeleteApplication={() => handleDefinitiveDeleteCandidate(applicationData?.cne)}
    />
  ) : role === "chef-these" ? (
    <SupervisorDashboard
      candidates={candidates}
      onStatusChange={handleCandidateStatusChange}
      onToggleDocumentVerify={handleToggleDocumentVerify}
    />
  ) : role === "chef-projet" ? (
    <CommissionDashboard
      candidates={candidates}
      onStatusChange={handleCandidateStatusChange}
      onToggleDocumentVerify={handleToggleDocumentVerify}
      onScoreChange={handleScoreChange}
    />
  ) : (
    <AdminValidationDashboard
      candidates={candidates}
      onStatusChange={handleCandidateStatusChange}
      onToggleDocumentVerify={handleToggleDocumentVerify}
    />
  );

  if (!auth) {
    return (
      <Login
        onLogin={(email, selectedRole) => {
          const isDemo = email.startsWith("demo.");
          setRole(selectedRole);
          setDemoMode(isDemo);
          setUserEmail(email);
          const computedName = isDemo
            ? (selectedRole === "candidat" ? "Candidat Exemple" : `Responsable ${roleLabels[selectedRole]}`)
            : email
                .split("@")[0]
                .split(/[._-]/)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" ");
          setUserName(computedName);

          // Restore demo candidate data if applicable
          if (selectedRole === "candidat") {
            const existing = candidates.find(
              (c) => c.email?.toLowerCase() === email.toLowerCase() || (isDemo && (c.fullName === "Candidat Exemple" || c.fullName === "Candidat #001"))
            );
            if (existing) {
              setApplicationData({
                fullName: existing.fullName,
                email: existing.email || email,
                cne: existing.cne,
                cin: existing.cin || "CD876543",
                phone: existing.phone || "+212 6 00 00 00 00",
                address: existing.address || "Fès, Maroc",
                bacDiploma: existing.bacDiploma || "Baccalauréat Sciences Mathématiques B",
                bacYear: existing.bacYear || "2020",
                bacUniversity: existing.bacUniversity || "Lycée d'Excellence, Fès",
                licenceDiploma: existing.licenceDiploma || "Licence Fondamentale en Informatique",
                licenceYear: existing.licenceYear || "2023",
                licenceUniversity: existing.licenceUniversity || "Faculté des Sciences Dhar El Mahraz",
                masterDiploma: existing.masterDiploma || "Master Recherche Systèmes Intelligents",
                masterYear: existing.masterYear || "2025",
                masterUniversity: existing.masterUniversity || "Faculté des Sciences Dhar El Mahraz",
                selectedSubjects: existing.selectedSubjects || (existing.subject ? [existing.subject] : []),
                university: existing.university || "Faculté des Sciences Dhar El Mahraz",
                files: existing.files || {},
              });
            }
          }
          setAuth(true);
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        view={allowedView}
        setView={(next) => {
          if (roleViews[role].includes(next)) setView(next);
          setSidebarOpen(false);
        }}
        open={sidebarOpen}
        role={role}
        userName={userName}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => {
          setAuth(false);
          setDemoMode(false);
          setApplicationData(undefined);
          setView("dashboard");
        }}
      />

      <div className="main-shell">
        {/* Offline notification banner */}
        {!isOnline && (
          <div
            style={{
              background: "#b45309",
              color: "#fff",
              padding: "9px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              fontSize: "12px",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            <WifiOff size={16} />
            <span>
              Mode hors-ligne détecté · Vos données et diplômes restent automatiquement conservés en brouillon local.
            </span>
          </div>
        )}

        <Header
          role={role}
          userName={userName}
          canSwitchRole={demoMode}
          onRoleChange={(nextRole) => {
            if (demoMode) {
              setRole(nextRole);
              setView("dashboard");
            }
          }}
          notifications={notifications}
          onMarkNotificationsRead={() =>
            setNotifications((items) => items.map((item) => ({ ...item, read: true })))
          }
          onMenu={() => setSidebarOpen(!sidebarOpen)}
        />

        <main>
          {allowedView === "dashboard" && roleDashboard}
          {allowedView === "subjects" && <SubjectsView />}
          {allowedView === "candidates" && (
            <CandidatesView
              candidates={candidates}
              onStatusChange={handleCandidateStatusChange}
              onToggleDocumentVerify={handleToggleDocumentVerify}
              onScoreChange={handleScoreChange}
            />
          )}
          {allowedView === "reregistration" &&
            (role === "candidat" ? <ReRegistrationDashboard /> : <ReregistrationView />)}
          {allowedView === "profile" && (
            <ProfileView
              role={role}
              userName={userName}
              email={userEmail}
              applicationData={applicationData}
              onNameChange={setUserName}
              onDeleteCandidate={() => handleDefinitiveDeleteCandidate(applicationData?.cne)}
            />
          )}
        </main>
      </div>

      {applicationOpen && role === "candidat" && (
        <RegistrationWizard
          initialData={applicationData}
          onClose={() => setApplicationOpen(false)}
          onSubmitted={handleApplicationSubmitted}
          onDeleteCandidate={() => handleDefinitiveDeleteCandidate(applicationData?.cne)}
        />
      )}
    </div>
  );
}

