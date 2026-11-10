import { Building2, BriefcaseBusiness, GraduationCap, UserRound } from "lucide-react";
import type { Role } from "../../domain/gcd";

type Props = { role: Role; onChange: (role: Role) => void };
const roles: { key: Role; label: string; icon: typeof UserRound }[] = [
  { key: "candidat", label: "Candidat", icon: UserRound },
  { key: "chef-these", label: "Encadrant", icon: GraduationCap },
  { key: "chef-projet", label: "Chef de projet / CEDOC", icon: BriefcaseBusiness },
  { key: "directeur", label: "Directeur administratif", icon: Building2 },
];

export default function RoleSwitcher({ role, onChange }: Props) {
  return <div className="role-switcher" aria-label="Changer de portail">{roles.map(({ key, label, icon: Icon }) => <button key={key} className={role === key ? "active" : ""} onClick={() => onChange(key)} title={label}><Icon size={14} /><span>{label}</span></button>)}</div>;
}
