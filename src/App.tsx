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
  FileCheck2,
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RegistrationWizard from "./components/candidate/RegistrationWizard";
import ReRegistrationDashboard from "./components/candidate/ReRegistrationDashboard";
import RoleSwitcher from "./components/layout/RoleSwitcher";
import SupervisorDashboard from "./components/supervisor/SupervisorDashboard";
import CommissionDashboard from "./components/project_leader/CommissionDashboard";
import AdminValidationDashboard from "./components/admin/AdminValidationDashboard";
import type { ApplicationState } from "./types/doctoral";
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
          <div className="brand-mark"><GraduationCap size={24} /></div>
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
              {registrationStep === 1 && <div className="registration-panel stack"><label>Nom complet<input placeholder="Ex. Amina El Mansouri" /></label><label>Email universitaire<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="prenom.nom@usmba.ac.ma" /></label><div className="form-grid"><label>CNE / CIN<input placeholder="Votre identifiant" /></label><label>Établissement<input placeholder="Université / faculté" /></label></div></div>}
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
  return <header className="topbar">
    <button className="mobile-menu" onClick={onMenu} aria-label="Ouvrir le menu"><Menu size={21} /></button>
    <div className="topbar-actions">
      <div className="notification-wrap"><button className="icon-button notification" onClick={() => setNotificationsOpen((open) => !open)} aria-label="Notifications" aria-expanded={notificationsOpen}><Bell size={18} />{unreadCount > 0 && <i />}</button>{notificationsOpen && <div className="notification-panel"><div className="notification-heading"><strong>Notifications</strong><button onClick={onMarkNotificationsRead}>Tout marquer comme lu</button></div>{notifications.length === 0 ? <p className="notification-empty">Aucune notification.</p> : notifications.map((notification) => <div className={`notification-item ${notification.read ? "read" : ""}`} key={notification.id}><span className={`notification-dot ${notification.tone}`} /><div><strong>{notification.title}</strong><p>{notification.description}</p></div></div>)}</div>}</div>
      {canSwitchRole ? <RoleSwitcher role={role} onChange={onRoleChange} /> : <div className="role-picker"><span className="role-dot" /><strong>{roleLabels[role]}</strong></div>}
      <div className="avatar">{userName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
    </div>
  </header>;
}

function Sidebar({ view, setView, open, role, userName, onLogout }: { view: View; setView: (view: View) => void; open: boolean; role: Role; userName: string; onLogout: () => void }) {
  const allLinks: { key: View; label: string; icon: typeof LayoutDashboard; count?: string }[] = [
    { key: "dashboard", label: "Vue d’ensemble", icon: LayoutDashboard },
    { key: "subjects", label: "Sujets de recherche", icon: BookOpen, count: "3" },
    { key: "candidates", label: "Candidatures", icon: Users, count: "12" },
    { key: "reregistration", label: "Réinscription", icon: ClipboardCheck },
    { key: "profile", label: "Mon profil", icon: UserRound },
  ];
  const links = allLinks.filter((link) => roleViews[role].includes(link.key));
  return <aside className={`sidebar ${open ? "open" : ""}`}>
    <div className="sidebar-brand"><div className="brand-mark small"><GraduationCap size={19} /></div><div><strong>GCD<span>+</span></strong><small>Gestion du cycle doctoral</small></div><PanelLeftClose size={18} className="sidebar-close" /></div>
    <div className="context-badge"><span className="status-live" /><div><small>Profil actif</small><strong>{roleLabels[role]}</strong></div><MoreHorizontal size={17} /></div>
    <nav>{links.map(({ key, label, icon: Icon, count }) => <button key={key} className={view === key ? "active" : ""} onClick={() => setView(key)}><Icon size={18} /><span>{label}</span>{count && <em>{count}</em>}</button>)}</nav>
    <div className="sidebar-bottom"><div className="help-card"><Sparkles size={17} /><strong>Besoin d’aide ?</strong><p>Le guide du parcours doctoral sera bientôt disponible.</p></div><div className="profile-row"><div className="avatar">{userName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div><div><strong>{userName}</strong><small>{roleLabels[role]}</small></div><button className="logout-button" onClick={onLogout} aria-label="Se déconnecter" title="Se déconnecter"><LogOut size={15} /></button></div></div>
  </aside>;
}

function StatCard({ stat }: { stat: DashboardStats }) {
  const Icon = stat.icon === "subjects" ? BookOpen : stat.icon === "pending" ? Clock3 : stat.icon === "oral" ? Bell : Activity;
  return <GlassCard className="stat-card"><div className={`stat-icon ${stat.tone}`}><Icon size={19} /></div><div className="stat-copy"><span>{stat.label}</span><strong>{stat.value}</strong><small className={stat.trend.startsWith("+") ? "trend-up" : ""}>{stat.trend}</small></div><MoreHorizontal size={17} className="muted-icon" /></GlassCard>;
}

function CandidateApplication({ onClose, onSubmitted, initialData }: { onClose: () => void; onSubmitted: (data: ApplicationData) => void; initialData?: ApplicationData }) {
  const [step, setStep] = useState(1);
  const [subjectQuery, setSubjectQuery] = useState("");
  const [university, setUniversity] = useState(initialData?.university ?? "");
  const [fullName, setFullName] = useState(initialData?.fullName ?? "");
  const [cne, setCne] = useState(initialData?.cne ?? "");
  const [submitted, setSubmitted] = useState(false);
  const filteredSubjects = registrationSubjects.filter((item) => item.toLowerCase().includes(subjectQuery.toLowerCase()));
  const universities = ["Faculté des Sciences de Fès", "Faculté des Sciences et Techniques de Fès", "ENSA Fès"];
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialData?.selectedSubjects ?? []);

  const submitApplication = () => {
    setSubmitted(true);
    onSubmitted({ fullName, email: "candidat@usmba.ac.ma", cne, cin: "", phone: "", address: "", bacDiploma: "", bacYear: "", bacUniversity: "", licenceDiploma: "", licenceYear: "", licenceUniversity: "", masterDiploma: "", masterYear: "", masterUniversity: "", selectedSubjects, university, files: {} });
  };
  return <div className="modal-backdrop" onClick={onClose}><motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="modal application-modal" onClick={(event) => event.stopPropagation()}>
    <div className="modal-header"><div><p className="eyebrow">CANDIDATURE DOCTORALE</p><h2>{initialData ? "Consulter ou modifier ma candidature" : "Déposer une demande de sujet"}</h2><p>Votre progression est enregistrée à chaque étape.</p></div><button className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div>
    {!submitted ? <><div className="application-progress">{["Informations", "Sujet", "Université", "Confirmation"].map((label, index) => { const current = index + 1; return <div className={`application-step ${step >= current ? "complete" : ""} ${step === current ? "current" : ""}`} key={label}><span>{step > current ? <Check size={13} /> : current}</span><small>{label}</small></div>; })}</div>
    <div className="application-content">
      {step === 1 && <div className="stack"><label>Nom complet<input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Ex. Amina El Mansouri" /></label><label>CNE / CIN<input value={cne} onChange={(event) => setCne(event.target.value)} placeholder="Votre identifiant" /></label><label>Adresse email<input type="email" defaultValue="candidat@usmba.ac.ma" /></label></div>}
      {step === 2 && <div><div className="subject-selection-heading"><div><strong>Choisissez jusqu’à 3 sujets</strong><p>Sélectionnez une à trois préférences dans la même demande.</p></div><Badge tone={selectedSubjects.length === 3 ? "green" : "blue"}>{selectedSubjects.length}/3</Badge></div><div className="search-input registration-search"><Search size={16} /><input value={subjectQuery} onChange={(event) => setSubjectQuery(event.target.value)} placeholder="Rechercher parmi 15 sujets…" /></div><div className="subject-choice-list">{filteredSubjects.map((item) => <label className={`subject-choice ${selectedSubjects.includes(item) ? "selected" : ""}`} key={item}><input type="checkbox" checked={selectedSubjects.includes(item)} onChange={() => setSelectedSubjects((current) => current.includes(item) ? current.filter((value) => value !== item) : current.length < 3 ? [...current, item] : current)} /><span>{item}</span>{selectedSubjects.includes(item) && <Check size={16} />}</label>)}</div></div>}
      {step === 3 && <div className="stack"><label>Université d’accueil<select value={university} onChange={(event) => setUniversity(event.target.value)}><option value="">Sélectionnez une université</option>{universities.map((item) => <option key={item}>{item}</option>)}</select></label><p className="application-note"><Building2 size={17} /> Cette université recevra votre demande pour examiner l’accueil scientifique et administratif.</p></div>}
      {step === 4 && <div className="confirmation-panel"><div className="success-icon"><CheckCircle2 size={30} /></div><h3>{initialData ? "Vos informations actuelles" : "Vérifiez votre demande"}</h3><div className="summary-row"><span>Candidat</span><strong>{fullName || "Non renseigné"}</strong></div><div className="summary-row"><span>Sujets choisis</span><strong>{selectedSubjects.length}</strong></div><div className="selected-subject-summary">{selectedSubjects.map((item, index) => <span key={item}>{index + 1}. {item}</span>)}</div><div className="summary-row"><span>Université d’accueil</span><strong>{university || "Non sélectionnée"}</strong></div></div>}
    </div><div className="registration-actions"><button className="button button-secondary" disabled={step === 1} onClick={() => setStep((current) => current - 1)}>Retour</button><button className="button button-primary" disabled={(step === 1 && (!fullName || !cne)) || (step === 2 && selectedSubjects.length === 0) || (step === 3 && !university)} onClick={() => step === 4 ? submitApplication() : setStep((current) => current + 1)}>{step === 4 ? (initialData ? "Enregistrer les modifications" : "Envoyer la demande") : "Continuer"} <ArrowRight size={16} /></button></div></> : <div className="confirmation-panel application-sent"><div className="success-icon"><CheckCircle2 size={30} /></div><h3>Demande envoyée</h3><p>Votre demande de sujet a été enregistrée. Vous pourrez suivre les validations depuis votre espace candidat.</p><button className="button button-primary" onClick={onClose}>Retour à mon espace</button></div>}
  </motion.div></div>;
}

function ProfileView({ role, userName, email, applicationData, onNameChange }: { role: Role; userName: string; email: string; applicationData?: ApplicationData; onNameChange: (name: string) => void }) {
  const [name, setName] = useState(userName);
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saved, setSaved] = useState(false);

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onNameChange(name.trim() || userName);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return <div className="page profile-page">
    <div className="page-heading"><div><p className="eyebrow">ESPACE PERSONNEL</p><h1>Mon profil</h1><p className="subheading">Gérez vos informations et consultez les droits liés à votre rôle.</p></div><Badge tone="green"><ShieldCheck size={14} /> Compte sécurisé</Badge></div>
    <div className="profile-layout">
      <GlassCard className="profile-main-card"><div className="profile-cover"><div className="profile-large-avatar">{name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div><div><h2>{name}</h2><p>{roleLabels[role]} · {email}</p></div></div><form className="profile-form" onSubmit={saveProfile}><div className="form-grid"><label>Nom complet<input value={name} onChange={(event) => setName(event.target.value)} /></label><label>Email<input value={email} readOnly /></label><label>Téléphone<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+212 6 00 00 00 00" /></label><label>Rôle<input value={roleLabels[role]} readOnly /></label></div><div className="profile-form-actions"><button className="button button-primary" type="submit"><Save size={16} /> Enregistrer</button>{saved && <Badge tone="green"><Check size={13} /> Informations enregistrées</Badge>}</div></form></GlassCard>
      <GlassCard className="profile-side-card"><div className="section-heading"><div><h2>Mes droits d’accès</h2><p>Modules disponibles pour votre rôle</p></div></div><div className="permission-list">{roleViews[role].filter((view) => view !== "profile").map((view) => <div className="permission-item" key={view}><CheckCircle2 size={16} /><span>{view === "dashboard" ? "Tableau de bord" : view === "subjects" ? "Sujets de recherche" : view === "candidates" ? "Gestion des candidatures" : "Réinscription"}</span></div>)}</div></GlassCard>
      <GlassCard className="profile-security-card"><div className="section-heading"><div><h2>Sécurité</h2><p>Le mot de passe est conservé localement pour cette démonstration.</p></div></div><label className="security-field">Nouveau mot de passe<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="6 caractères minimum" /></label><button className="button button-secondary" disabled={newPassword.length < 6} onClick={() => setNewPassword("")}>Mettre à jour le mot de passe</button></GlassCard>
      {role === "candidat" && <GlassCard className="profile-application-card"><div className="section-heading"><div><h2>Ma candidature</h2><p>Accès rapide à votre dossier doctoral</p></div></div>{applicationData ? <><div className="profile-application-status"><Badge tone="amber">En cours de traitement</Badge><span>{applicationData.selectedSubjects.length} sujet(s) · {applicationData.university}</span></div><p className="profile-application-subject">{applicationData.selectedSubjects.join(" · ")}</p></> : <p className="profile-empty">Aucune candidature envoyée pour le moment.</p>}</GlassCard>}
    </div>
  </div>;
}

function Dashboard({ onNavigate, role, userName, onApply, onEditApplication, applicationData }: { onNavigate: (view: View) => void; role: Role; userName: string; onApply: () => void; onEditApplication: () => void; applicationData?: ApplicationData }) {
  const applicationSubmitted = Boolean(applicationData);
  if (role === "candidat") return <div className="page"><div className="page-heading"><div><p className="eyebrow">ESPACE CANDIDAT</p><h1>Bonjour, {userName} <span>👋</span></h1><p className="subheading">Déposez votre demande de sujet et suivez son traitement.</p></div>{!applicationSubmitted && <button className="button button-primary" onClick={onApply}><BookOpen size={17} /> Déposer une demande</button>}</div><div className="candidate-home-grid"><GlassCard className="candidate-apply-card"><div className="side-icon"><BookOpen size={20} /></div><h2>{applicationSubmitted ? "Demande en cours de traitement" : "Votre candidature doctorale"}</h2><p>{applicationSubmitted ? "Votre dossier a été transmis aux responsables. Vous pouvez consulter ou modifier les informations envoyées." : "Renseignez vos informations, choisissez jusqu’à 3 sujets et indiquez votre université d’accueil."}</p>{applicationSubmitted ? <button className="button button-secondary" onClick={onEditApplication}>Consulter / modifier ma candidature <ArrowRight size={16} /></button> : <button className="button button-primary" onClick={onApply}>Commencer ma demande <ArrowRight size={16} /></button>}</GlassCard><GlassCard className="candidate-status-card"><p className="eyebrow">SUIVI DU DOSSIER</p>{applicationSubmitted ? <><h2>Demande reçue</h2><div className="candidate-progress-list">{["Informations vérifiées", "Sujets sélectionnés", "Université d’accueil", "Étude de la candidature"].map((label, index) => <div className={`candidate-progress-item ${index < 3 ? "complete" : "current"}`} key={label}><span>{index < 3 ? <Check size={13} /> : index + 1}</span><div><strong>{label}</strong><small>{index < 3 ? "Terminé" : "En cours de traitement"}</small></div></div>)}</div></> : <><h2>Aucune demande envoyée</h2><p>Votre progression apparaîtra ici après l’envoi de votre candidature.</p></>}</GlassCard></div></div>;
  return <div className="page">
    <div className="page-heading"><div><p className="eyebrow">ESPACE {roleLabels[role].toUpperCase()}</p><h1>Bonjour {userName} <span>👋</span></h1><p className="subheading">Voici les actions autorisées dans votre espace {roleLabels[role].toLowerCase()}.</p></div>{role !== "chef-projet" && <button className="button button-secondary" onClick={() => onNavigate("reregistration")}><ClipboardCheck size={17} /> Nouvelle action</button>}</div>
    <div className="stats-grid">{dashboardStats.map((stat) => <StatCard key={stat.label} stat={stat} />)}</div>
    <div className="content-grid dashboard-grid">
      <GlassCard className="activity-card"><div className="section-heading"><div><h2>À traiter maintenant</h2><p>Les actions prioritaires de votre espace</p></div><button className="text-button">Tout voir <ArrowRight size={14} /></button></div><div className="task-list"><div className="task-item"><div className="task-icon amber"><FileCheck2 size={18} /></div><div><strong>Valider le rapport annuel de Yassine B.</strong><span>Réinscription · reçu il y a 2 h</span></div><Badge tone="amber">À valider</Badge><button className="round-arrow"><ArrowRight size={15} /></button></div><div className="task-item"><div className="task-icon violet"><BookOpen size={18} /></div><div><strong>3 sujets attendent votre avis</strong><span>Étape 1 sur 3 · Centre CED</span></div><Badge tone="violet">En cours</Badge><button className="round-arrow" onClick={() => onNavigate("subjects")}><ArrowRight size={15} /></button></div><div className="task-item"><div className="task-icon green"><Users size={18} /></div><div><strong>Entretiens de sélection demain</strong><span>8 candidats · 09:00 — 12:30</span></div><Badge tone="green">Planifié</Badge><button className="round-arrow" onClick={() => onNavigate("candidates")}><ArrowRight size={15} /></button></div></div></GlassCard>
      <GlassCard className="deadline-card"><div className="section-heading"><div><h2>Prochains oraux</h2><p>Votre agenda doctoral</p></div></div><div className="calendar-date"><strong>OCT</strong><span>30</span><small>JEU</small></div><div className="deadline-info"><strong>Soutenances de thèse</strong><span>3 doctorants · Salle des actes</span><div className="people-stack"><span>YB</span><span>SA</span><span>+1</span></div></div><div className="deadline-time"><strong>09:00</strong><span>dans 2 jours</span></div></GlassCard>
    </div>
    <GlassCard className="recent-card"><div className="section-heading"><div><h2>Activité récente</h2><p>Les dernières mises à jour de vos dossiers</p></div><button className="text-button">Voir l’historique <ArrowRight size={14} /></button></div><div className="activity-feed">{activities.map((item) => <div className="feed-row" key={item.id}><div className={`feed-icon ${item.tone}`}>{item.icon === "check" ? <CheckCircle2 size={17} /> : item.icon === "subject" ? <BookOpen size={17} /> : <Users size={17} />}</div><div><strong>{item.title}</strong><span>{item.description}</span></div><time>{item.time}</time></div>)}</div></GlassCard>
  </div>;
}

function SearchBar({ query, setQuery, showFilters, setShowFilters }: { query: string; setQuery: (value: string) => void; showFilters: boolean; setShowFilters: (value: boolean) => void }) {
  return <div className="search-panel"><div className="search-input"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher par nom, CNE ou mot-clé du sujet…" /><kbd>⌘ K</kbd>{query && <button onClick={() => setQuery("")}><X size={15} /></button>}</div><button className={`filter-button ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(!showFilters)}><Filter size={16} /> Filtres avancés <ChevronDown size={15} /></button>{showFilters && <div className="advanced-filters"><select><option>Établissement : tous</option><option>FST Fès</option><option>FSJES Fès</option></select><select><option>Statut : tous</option><option>En cours</option><option>Validé</option></select><select><option>Année : toutes</option><option>2026 / 2027</option><option>2025 / 2026</option></select><Badge tone="blue">3 filtres actifs <X size={13} /></Badge></div>}{query && <div className="search-meta">Résultats actualisés automatiquement · debounce 300 ms</div>}</div>;
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

function CandidatesView() {
  const [candidates, setCandidates] = useState(seedCandidates);
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const moveSelected = (status: CandidateStatus) => { setCandidates((items) => items.map((item) => selected.includes(item.id) ? { ...item, status } : item)); setSelected([]); };
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">ADMISSIONS DOCTORALES</p><h1>Candidatures</h1><p className="subheading">Un pipeline clair pour décider plus vite et à plusieurs.</p></div></div>{selected.length > 0 && <div className="bulk-bar"><strong>{selected.length} dossier(s) sélectionné(s)</strong><button onClick={() => moveSelected("interview")}>Planifier un entretien</button><button onClick={() => moveSelected("scored")}>Ouvrir l’évaluation</button><button onClick={() => setSelected([])}><X size={15} /></button></div>}<div className="kanban">{candidateColumns.map((column) => <div className="kanban-column" key={column.key}><div className="kanban-heading"><div><span className={`column-dot ${column.tone}`} /><strong>{column.label}</strong><em>{candidates.filter((item) => item.status === column.key).length}</em></div></div><div className="kanban-list">{candidates.filter((item) => item.status === column.key).map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} selected={selected.includes(candidate.id)} onToggle={() => toggle(candidate.id)} />)}</div></div>)}</div></div>;
}

function CandidateCard({ candidate, selected, onToggle }: { candidate: Candidate; selected: boolean; onToggle: () => void }) {
  return <motion.div layout className={`candidate-card ${selected ? "selected" : ""}`}><div className="candidate-top"><button className={`checkbox ${selected ? "checked" : ""}`} onClick={onToggle}>{selected && <Check size={13} />}</button><Badge tone={candidate.score >= 85 ? "green" : candidate.score >= 70 ? "amber" : "neutral"}>{candidate.score}/100</Badge><MoreHorizontal size={16} className="muted-icon" /></div><div className="candidate-person"><div className="subject-avatar">{candidate.initials}</div><div><strong>{candidate.name}</strong><span>{candidate.cne}</span></div></div><p>{candidate.subject}</p><div className="candidate-meta"><span><Clock3 size={14} /> {candidate.date}</span><span className={`mini-status ${candidate.status}`} /></div></motion.div>;
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
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">PARCOURS DOCTORAL · ANNÉE 3</p><h1>Réinscription</h1><p className="subheading">Un workflow hybride, guidé de la saisie jusqu’au bureau d’ordre.</p></div><Badge tone="green"><CheckCircle2 size={14} /> Dossier ouvert</Badge></div><div className="rereg-layout"><GlassCard className="workflow-card"><div className="workflow-progress">{steps.map((label, index) => <div className={`workflow-step ${index + 1 <= step ? "active" : ""}`} key={label}><span>{index + 1 < step ? <Check size={14} /> : index + 1}</span><div><strong>{label}</strong><small>{index + 1 < step ? "Terminé" : index + 1 === step ? "En cours" : "À venir"}</small></div></div>)}</div><div className="workflow-content">{done ? <div className="success-panel"><div className="success-icon"><QrCode size={38} /></div><p className="eyebrow">RÉCÉPISSÉ NUMÉRIQUE</p><h2>Votre dossier est prêt.</h2><p>Présentez ce QR code au bureau d’ordre pour synchroniser la réception physique.</p><div className="qr-placeholder"><QrCode size={106} /></div><strong>GCD-2026-00482</strong><button className="button button-primary button-wide"><Download size={16} /> Télécharger le récépissé</button></div> : <><div className="workflow-title"><div><h2>{steps[step - 1]}</h2><p>{workflowDescription}</p></div><span className="completion">{Math.round((step / steps.length) * 100)}%</span></div>{step === 1 && <div className="form-grid"><label>Avancement de la thèse<textarea defaultValue="Les travaux portent sur l’analyse des données collectées au sein du laboratoire."></textarea></label><label>Publications / communications<textarea placeholder="Ajoutez vos productions de l’année…"></textarea></label><label>Prochain objectif<input placeholder="Ex. Soumission de l’article et expérimentation finale" /></label><label>Demande de dérogation<select><option>Aucune dérogation</option><option>Dérogation année supplémentaire</option></select></label></div>}{step === 2 && <div className="review-callout"><CheckCircle2 size={22} /><div><strong>Rapport prêt pour signature</strong><p>Une notification sera envoyée à Pr. Amina El Mansouri. Vous pourrez suivre son avis depuis votre espace.</p></div><Badge tone="amber">En attente</Badge></div>}{step === 3 && <div className="physical-checklist">{["Rapport signé par l’encadrant", "Copie CIN / carte étudiant", "Attestation de couverture médicale"].map((item) => <label key={item}><input type="checkbox" defaultChecked /> <span>{item}</span><Check size={16} /></label>)}</div>}{step === 4 && <div className="review-callout green"><QrCode size={25} /><div><strong>Tout est prêt pour le récépissé</strong><p>Le QR code contiendra la référence, la date et l’empreinte de votre dossier.</p></div></div>}<div className="modal-actions"><button className="button button-secondary" disabled={step === 1} onClick={() => setStep(step - 1)}>Retour</button><button className="button button-primary" onClick={() => step === 4 ? setDone(true) : setStep(step + 1)}>{step === 4 ? "Générer le récépissé" : "Enregistrer et continuer"} <ArrowRight size={16} /></button></div></>}</div></GlassCard><GlassCard className="rereg-side"><div className="side-icon"><ShieldCheck size={20} /></div><h3>Éligibilité automatisée</h3><p>Votre progression est calculée à partir des activités déclarées et des validations reçues.</p><div className="eligibility"><div><span>Crédits de formation</span><strong>18 / 20</strong></div><div className="progress-line"><span style={{ width: "90%" }} /></div><div><span>Pièces justificatives</span><strong>4 / 4</strong></div><div className="progress-line green"><span style={{ width: "100%" }} /></div></div><div className="next-deadline"><Clock3 size={16} /><span>Date limite de dépôt<strong>15 novembre 2026</strong></span></div></GlassCard></div></div>;
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
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: "n1", title: "3 sujets attendent votre avis", description: "Ouvrez le module Sujets de recherche pour traiter les validations.", tone: "amber", read: false },
    { id: "n2", title: "Dossier reçu", description: "Une nouvelle candidature est disponible dans votre espace.", tone: "blue", read: false },
    { id: "n3", title: "Rapport annuel validé", description: "La réinscription de Yassine Benslimane a été mise à jour.", tone: "green", read: true },
  ]);
  const allowedView = roleViews[role].includes(view) ? view : "dashboard";
  const roleDashboard = role === "candidat" ? <Dashboard onNavigate={setView} role={role} userName={userName} applicationData={applicationData} onApply={() => setApplicationOpen(true)} onEditApplication={() => setApplicationOpen(true)} /> : role === "chef-these" ? <SupervisorDashboard /> : role === "chef-projet" ? <CommissionDashboard /> : <AdminValidationDashboard />;
  if (!auth) return <Login onLogin={(email, selectedRole) => { const isDemo = email.startsWith("demo."); setRole(selectedRole); setDemoMode(isDemo); setUserEmail(email); setUserName(isDemo ? "Demo" : email.split("@")[0].split(/[._-]/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")); setAuth(true); }} />;
  return <div className="app-shell"><Sidebar view={allowedView} setView={(next) => { if (roleViews[role].includes(next)) setView(next); setSidebarOpen(false); }} open={sidebarOpen} role={role} userName={userName} onLogout={() => { setAuth(false); setDemoMode(false); setApplicationData(undefined); setView("dashboard"); }} /><div className="main-shell"><Header role={role} userName={userName} canSwitchRole={demoMode} onRoleChange={(nextRole) => { if (demoMode) { setRole(nextRole); setView("dashboard"); } }} notifications={notifications} onMarkNotificationsRead={() => setNotifications((items) => items.map((item) => ({ ...item, read: true })))} onMenu={() => setSidebarOpen(!sidebarOpen)} /><main>{allowedView === "dashboard" && roleDashboard}{allowedView === "subjects" && <SubjectsView />}{allowedView === "candidates" && <CandidatesView />}{allowedView === "reregistration" && (role === "candidat" ? <ReRegistrationDashboard /> : <ReregistrationView />)}{allowedView === "profile" && <ProfileView role={role} userName={userName} email={userEmail} applicationData={applicationData} onNameChange={setUserName} />}</main></div>{applicationOpen && role === "candidat" && <RegistrationWizard initialData={applicationData} onClose={() => setApplicationOpen(false)} onSubmitted={(data) => { setApplicationData(data); setApplicationOpen(false); }} />}</div>;
}
