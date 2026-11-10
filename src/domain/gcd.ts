import { BookOpen, Clock3, Bell, Activity } from "lucide-react";

export type Role = "candidat" | "chef-projet" | "chef-these" | "directeur";
export type CandidateStatus = "received" | "interview" | "scored" | "accepted";
export type SubjectStep = { label: string; owner: string; date: string };
export type DoctoralSubject = { id: string; title: string; doctorant: string; cne: string; laboratoire: string; currentStep: number; status: "En attente" | "Validé" | "Rejeté" };
export type Candidate = { id: string; name: string; initials: string; cne: string; subject: string; date: string; score: number; status: CandidateStatus };
export type DashboardStats = { label: string; value: string; trend: string; tone: string; icon: "subjects" | "pending" | "oral" | "activity" };

export const subjectSteps: SubjectStep[] = [
  { label: "Structure de recherche", owner: "Laboratoire LSI", date: "Validé · 24 oct. 2026" },
  { label: "Centre CED", owner: "Centre d’études doctorales", date: "En attente de validation" },
  { label: "Pôle doctoral", owner: "Pôle Sciences & Technologies", date: "À venir" },
];

export const subjects: DoctoralSubject[] = [
  { id: "s1", title: "Modèles hybrides pour la détection des anomalies réseau", doctorant: "Yassine Benslimane", cne: "D142093841", laboratoire: "LSI · IA & Data", currentStep: 1, status: "En attente" },
  { id: "s2", title: "Gouvernance des données publiques au Maroc", doctorant: "Sara Aït Lahcen", cne: "D118420938", laboratoire: "LAREF · Droit public", currentStep: 2, status: "Validé" },
  { id: "s3", title: "Optimisation énergétique des bâtiments universitaires", doctorant: "Mehdi El Idrissi", cne: "D196023847", laboratoire: "LIM · Génie civil", currentStep: 0, status: "En attente" },
  { id: "s4", title: "Apprentissage fédéré pour les environnements sensibles", doctorant: "Nadia Chafik", cne: "D174802931", laboratoire: "LSI · IA & Data", currentStep: 2, status: "Validé" },
];

export const candidates: Candidate[] = [
  { id: "c1", name: "Khadija El Fassi", initials: "KE", cne: "CNE-20481", subject: "Vision par ordinateur et patrimoine", date: "Entretien demain · 09:00", score: 86, status: "received" },
  { id: "c2", name: "Omar Benjelloun", initials: "OB", cne: "CNE-20476", subject: "Systèmes distribués résilients", date: "Dossier reçu · il y a 2 h", score: 78, status: "received" },
  { id: "c3", name: "Salma Tazi", initials: "ST", cne: "CNE-20462", subject: "Économie circulaire et territoires", date: "Entretien aujourd’hui · 11:30", score: 91, status: "interview" },
  { id: "c4", name: "Anas Amrani", initials: "AA", cne: "CNE-20459", subject: "Sécurité des applications web", date: "Entretien demain · 10:30", score: 83, status: "interview" },
  { id: "c5", name: "Lina Berrada", initials: "LB", cne: "CNE-20432", subject: "Données ouvertes et politiques publiques", date: "Évaluation collaborative", score: 88, status: "scored" },
  { id: "c6", name: "Rachid Alaoui", initials: "RA", cne: "CNE-20398", subject: "Matériaux composites biosourcés", date: "Évaluation collaborative", score: 74, status: "scored" },
  { id: "c7", name: "Imane Naciri", initials: "IN", cne: "CNE-20374", subject: "Santé numérique et inclusion", date: "Admis · 25 oct. 2026", score: 94, status: "accepted" },
];

export const dashboardStats: DashboardStats[] = [
  { label: "Sujets à valider", value: "03", trend: "+2 depuis lundi", tone: "violet", icon: "subjects" },
  { label: "Dossiers en attente", value: "12", trend: "4 prioritaires", tone: "amber", icon: "pending" },
  { label: "Prochains oraux", value: "03", trend: "dans les 7 jours", tone: "blue", icon: "oral" },
  { label: "Doctorants suivis", value: "48", trend: "+6 cette année", tone: "green", icon: "activity" },
];

export const activities = [
  { id: "a1", title: "Rapport annuel validé", description: "Yassine Benslimane · Réinscription 2026/27", time: "Il y a 35 min", tone: "green", icon: "check" },
  { id: "a2", title: "Nouveau sujet soumis", description: "Nadia Chafik · Centre CED", time: "Il y a 2 h", tone: "violet", icon: "subject" },
  { id: "a3", title: "Entretien planifié", description: "Salma Tazi · 30 octobre à 11:30", time: "Hier", tone: "blue", icon: "users" },
];

export const statIcons = { BookOpen, Clock3, Bell, Activity };
