import type { Application, Candidate, CommitteeMember, ProgressReport } from "../types/doctoral";
import { mockTopics } from "./mockTopics";

export { mockTopics };

export const mockCandidates: Candidate[] = [
  { id: "cand-01", fullName: "Khadija El Fassi", email: "khadija.elfassi@usmba.ac.ma", cne: "CNE204810", cin: "BE123456", phone: "+212 6 10 20 30 40", address: "Fès", status: "received", academicScore: 86, selectedTopic: mockTopics[4].title },
  { id: "cand-02", fullName: "Omar Benjelloun", email: "omar.benjelloun@usmba.ac.ma", cne: "CNE204761", cin: "AB234567", phone: "+212 6 11 22 33 44", address: "Meknès", status: "shortlisted", academicScore: 78, interviewScore: 84, selectedTopic: mockTopics[2].title },
  { id: "cand-03", fullName: "Salma Tazi", email: "salma.tazi@usmba.ac.ma", cne: "CNE204620", cin: "CD345678", phone: "+212 6 12 23 34 45", address: "Fès", status: "accepted", academicScore: 91, interviewScore: 89, selectedTopic: mockTopics[9].title },
  { id: "cand-04", fullName: "Anas Amrani", email: "anas.amrani@usmba.ac.ma", cne: "CNE204590", cin: "EF456789", phone: "+212 6 13 24 35 46", address: "Taza", status: "received", academicScore: 83, selectedTopic: mockTopics[1].title },
];

export const mockApplications: Application[] = mockCandidates.map((candidate, index) => ({
  ...candidate,
  bacDiploma: "Baccalauréat sciences",
  bacYear: "2018",
  bacUniversity: "Académie Fès-Meknès",
  licenceDiploma: "Licence Sciences",
  licenceYear: "2021",
  licenceUniversity: "Université Sidi Mohamed Ben Abdellah",
  masterDiploma: "Master spécialisé",
  masterYear: "2023",
  masterUniversity: "Faculté des Sciences de Fès",
  selectedSubjects: [mockTopics[index % mockTopics.length].id],
  university: "Faculté des Sciences de Fès",
  files: { "Relevés de notes": "releves-notes.pdf", "Diplôme Master": "diplome-master.pdf" },
  id: `app-${index + 1}`,
  submittedAt: "06 novembre 2026",
  status: candidate.status === "received" ? "screening" : candidate.status === "shortlisted" ? "interview" : candidate.status,
}));

export const mockProgressReports: ProgressReport[] = [
  { id: "report-01", candidateId: "cand-01", candidateName: "Khadija El Fassi", year: "2026 / 2027", fileName: "rapport-khadija-2026.pdf", status: "submitted" },
  { id: "report-02", candidateId: "cand-02", candidateName: "Omar Benjelloun", year: "2026 / 2027", fileName: "rapport-omar-2026.pdf", status: "supervisor-review" },
  { id: "report-03", candidateId: "cand-03", candidateName: "Salma Tazi", year: "2026 / 2027", fileName: "rapport-salma-2026.pdf", status: "cedoc-review" },
];

export const mockCommittee: CommitteeMember[] = [
  { id: "member-01", name: "Pr. Nadia Chafik", role: "Présidente" },
  { id: "member-02", name: "Pr. Omar Benjelloun", role: "Rapporteur" },
  { id: "member-03", name: "Dr. Sara Aït Lahcen", role: "Membre CEDOC" },
];
