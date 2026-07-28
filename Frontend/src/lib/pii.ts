// PII masking utilities — hides sensitive data from non-privileged users
// Uses the minimal safe display while keeping data functional for authorized roles

export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email
  const [local, domain] = email.split("@")
  if (local.length <= 2) return `${local[0]}***@${domain}`
  return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return phone
  return phone.slice(0, 3) + "***" + phone.slice(-2)
}

export function maskName(name: string): string {
  if (!name) return name
  const parts = name.split(" ")
  if (parts.length === 1) return parts[0][0] + "***"
  return parts[0] + " " + parts[parts.length - 1][0] + "."
}

export function isPrivilegedRole(role?: string): boolean {
  if (!role) return false
  return ["super_admin", "admin", "finance", "support"].includes(role)
}
