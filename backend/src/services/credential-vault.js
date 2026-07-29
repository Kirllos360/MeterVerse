import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const KEY = process.env.CONNECTION_ENCRYPTION_KEY
  ? Buffer.from(process.env.CONNECTION_ENCRYPTION_KEY, "base64")
  : crypto.scryptSync("meterverse-conn-vault-default-key-change-in-prod", "salt", 32)
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

export function encrypt(plaintext) {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  let encrypted = cipher.update(plaintext, "utf8", "hex")
  encrypted += cipher.final("hex")
  const authTag = cipher.getAuthTag().toString("hex")
  return `${iv.toString("hex")}:${authTag}:${encrypted}`
}

export function decrypt(ciphertext) {
  const parts = ciphertext.split(":")
  if (parts.length !== 3) throw new Error("Invalid ciphertext format")
  const iv = Buffer.from(parts[0], "hex")
  const authTag = Buffer.from(parts[1], "hex")
  const encrypted = parts[2]
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

export function rotateKey(newKey) {
  // Placeholder for key rotation — re-encrypts all credentials with new key
  return { success: true, message: "Key rotation requires re-encryption of all stored credentials" }
}
