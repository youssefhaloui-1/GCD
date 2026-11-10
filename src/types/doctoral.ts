export interface CandidateInfo {
  fullName: string;
  email: string;
  cne: string;
  cin: string;
  phone: string;
  address: string;
}

export interface AcademicDegree {
  diploma: string;
  year: string;
  university: string;
}

export interface ThesisTopic {
  id: string;
  title: string;
  laboratory: string;
  cedoc: string;
  supervisor: string;
}

export interface ApplicationState extends CandidateInfo {
  bacDiploma: string;
  bacYear: string;
  bacUniversity: string;
  licenceDiploma: string;
  licenceYear: string;
  licenceUniversity: string;
  masterDiploma: string;
  masterYear: string;
  masterUniversity: string;
  selectedSubjects: string[];
  university: string;
  files: Record<string, string>;
}

export type UserRole = "candidate" | "supervisor" | "project-leader" | "admin";

export interface Candidate extends CandidateInfo {
  id: string;
  status: "received" | "shortlisted" | "accepted" | "rejected";
  academicScore: number;
  interviewScore?: number;
  selectedTopic: string;
}

export interface Application extends ApplicationState {
  id: string;
  submittedAt: string;
  status: "received" | "screening" | "shortlisted" | "interview" | "accepted" | "rejected";
  academicScore: number;
  selectedTopic: string;
}

export interface ProgressReport {
  id: string;
  candidateId: string;
  candidateName: string;
  year: string;
  fileName: string;
  status: "submitted" | "supervisor-review" | "cedoc-review" | "validated";
  advisoryOpinion?: string;
}

export interface CommitteeMember {
  id: string;
  name: string;
  role: string;
}
