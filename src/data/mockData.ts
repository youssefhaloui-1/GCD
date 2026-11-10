import type { Application, Candidate, CommitteeMember, ProgressReport } from "../types/doctoral";
import { mockTopics } from "./mockTopics";
import { candidates as seedCandidates } from "../domain/gcd";

export { mockTopics };

export const mockCandidates: Candidate[] = seedCandidates.map((c) => ({
  id: c.id,
  fullName: c.fullName || c.name,
  name: c.name,
  initials: c.initials,
  email: c.email || `${c.name.toLowerCase().replace(/\s+/g, ".")}@usmba.ac.ma`,
  cne: c.cne,
  cin: c.cin || "BE123456",
  phone: c.phone || "+212 6 00 00 00 00",
  address: c.address || "Fès, Maroc",
  status: c.status === "scored" ? "shortlisted" : c.status,
  academicScore: c.score,
  interviewScore: c.interviewScore || (c.status === "interview" ? 85 : c.status === "accepted" ? 92 : undefined),
  selectedTopic: c.selectedTopic || c.subject,
  subject: c.subject,
  date: c.date,
  submittedAt: c.submittedAt || "06 novembre 2026",
  university: c.university || "Faculté des Sciences de Fès",
  bacDiploma: c.bacDiploma || "Baccalauréat sciences",
  bacYear: c.bacYear || "2018",
  bacUniversity: c.bacUniversity || "Académie Fès-Meknès",
  licenceDiploma: c.licenceDiploma || "Licence Sciences",
  licenceYear: c.licenceYear || "2021",
  licenceUniversity: c.licenceUniversity || "Université Sidi Mohamed Ben Abdellah",
  masterDiploma: c.masterDiploma || "Master spécialisé",
  masterYear: c.masterYear || "2023",
  masterUniversity: c.masterUniversity || "Faculté des Sciences de Fès",
  selectedSubjects: c.selectedSubjects || [mockTopics[0].id],
  files: c.files || { "Relevés de notes": "releves-notes.pdf", "Diplôme Master": "diplome-master.pdf" },
}));

export const mockApplications: Application[] = mockCandidates.map((candidate, index) => ({
  ...candidate,
  id: candidate.id.startsWith("app-") ? candidate.id : `app-${candidate.id}`,
  submittedAt: candidate.submittedAt || "06 novembre 2026",
  status: candidate.status === "received" ? "screening" : candidate.status === "shortlisted" ? "interview" : candidate.status,
  academicScore: candidate.academicScore ?? 80,
  selectedTopic: candidate.selectedTopic,
  bacDiploma: candidate.bacDiploma || "Baccalauréat sciences",
  bacYear: candidate.bacYear || "2018",
  bacUniversity: candidate.bacUniversity || "Académie Fès-Meknès",
  licenceDiploma: candidate.licenceDiploma || "Licence Sciences",
  licenceYear: candidate.licenceYear || "2021",
  licenceUniversity: candidate.licenceUniversity || "Université Sidi Mohamed Ben Abdellah",
  masterDiploma: candidate.masterDiploma || "Master spécialisé",
  masterYear: candidate.masterYear || "2023",
  masterUniversity: candidate.masterUniversity || "Faculté des Sciences de Fès",
  selectedSubjects: candidate.selectedSubjects || [mockTopics[index % mockTopics.length].id],
  university: candidate.university || "Faculté des Sciences de Fès",
  files: candidate.files || { "Relevés de notes": "releves-notes.pdf", "Diplôme Master": "diplome-master.pdf" },
}));

export const mockProgressReports: ProgressReport[] = [
  { id: "report-01", candidateId: "c1", candidateName: "Candidat #001", year: "2026 / 2027", fileName: "rapport-candidat-001.pdf", status: "submitted" },
  { id: "report-02", candidateId: "c2", candidateName: "Candidat #002", year: "2026 / 2027", fileName: "rapport-candidat-002.pdf", status: "supervisor-review" },
  { id: "report-03", candidateId: "c3", candidateName: "Candidat #003", year: "2026 / 2027", fileName: "rapport-candidat-003.pdf", status: "cedoc-review" },
];

export const mockCommittee: CommitteeMember[] = [
  { id: "member-01", name: "Pr. Présidence Commission", role: "Présidente" },
  { id: "member-02", name: "Pr. Rapporteur Thèse", role: "Rapporteur" },
  { id: "member-03", name: "Dr. Membre CEDOC", role: "Membre CEDOC" },
];
