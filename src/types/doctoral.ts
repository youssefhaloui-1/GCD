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
  file?: AttachedFile | string;
}

export interface ThesisTopic {
  id: string;
  title: string;
  laboratory: string;
  cedoc: string;
  supervisor: string;
}

export interface AttachedFile {
  name: string;
  size?: string;
  type?: string;
  dataUrl?: string;
  uploadedAt?: string;
  verified?: boolean;
  notes?: string;
}

export interface ApplicationState extends CandidateInfo {
  id?: string;
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
  files: Record<string, string | AttachedFile>;
}

export type UserRole = "candidate" | "supervisor" | "project-leader" | "admin";

export type ApplicationStatus = "received" | "screening" | "shortlisted" | "interview" | "scored" | "accepted" | "rejected";

export interface Candidate extends CandidateInfo {
  id: string;
  initials?: string;
  name?: string;
  status: ApplicationStatus;
  score?: number;
  academicScore?: number;
  interviewScore?: number;
  selectedTopic: string;
  subject?: string;
  date?: string;
  submittedAt?: string;
  university?: string;
  bacDiploma?: string;
  bacYear?: string;
  bacUniversity?: string;
  licenceDiploma?: string;
  licenceYear?: string;
  licenceUniversity?: string;
  masterDiploma?: string;
  masterYear?: string;
  masterUniversity?: string;
  selectedSubjects?: string[];
  files?: Record<string, string | AttachedFile>;
  notes?: string;
}

export interface Application extends ApplicationState {
  id: string;
  submittedAt: string;
  status: ApplicationStatus;
  academicScore: number;
  interviewScore?: number;
  selectedTopic: string;
  notes?: string;
}

export interface ProgressReport {
  id: string;
  candidateId: string;
  candidateName: string;
  year: string;
  fileName: string;
  fileDataUrl?: string;
  status: "submitted" | "supervisor-review" | "cedoc-review" | "validated";
  advisoryOpinion?: string;
}

export interface CommitteeMember {
  id: string;
  name: string;
  role: string;
}
