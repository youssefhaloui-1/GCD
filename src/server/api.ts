import type { Candidate, CandidateStatus, DoctoralSubject, Role } from "../domain/gcd";

export type ApiResponse<T> = { data: T; requestId: string };
export type GlobalSearchParams = { query: string; role?: Role; status?: string; year?: string; establishment?: string };

const wait = (ms = 180) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function getDashboard() {
  await wait();
  return { data: { generatedAt: new Date().toISOString() }, requestId: crypto.randomUUID() } satisfies ApiResponse<{ generatedAt: string }>;
}

export async function searchGlobal(params: GlobalSearchParams) {
  await wait();
  return { data: { params, results: [] as (DoctoralSubject | Candidate)[] }, requestId: crypto.randomUUID() } satisfies ApiResponse<{ params: GlobalSearchParams; results: (DoctoralSubject | Candidate)[] }>;
}

export async function updateSubjectValidation(subjectId: string, step: number, decision: "approve" | "reject", comment?: string) {
  await wait();
  return { data: { subjectId, step, decision, comment, updatedAt: new Date().toISOString() }, requestId: crypto.randomUUID() };
}

export async function bulkUpdateCandidates(candidateIds: string[], status: CandidateStatus) {
  await wait();
  return { data: { candidateIds, status }, requestId: crypto.randomUUID() };
}

export async function validateIdentity(payload: { cne: string; cin: string }) {
  await wait();
  const valid = /^D?\d{8,10}$/.test(payload.cne) && /^[A-Z]{1,2}\d{5,8}$/.test(payload.cin.toUpperCase());
  return { data: { valid, fields: payload }, requestId: crypto.randomUUID() };
}
