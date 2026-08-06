import crypto from "crypto";

// Use BETTER_AUTH_SECRET or a fallback key to create a 32-byte key buffer
const SECRET = process.env.BETTER_AUTH_SECRET || "Z4jvDb2xGbPZwr2TZFBv5bjQb568YNIc";
const ENCRYPTION_KEY = Buffer.concat([Buffer.from(SECRET), Buffer.alloc(32)], 32); 
const IV_LENGTH = 16; 

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(text: string): string {
  try {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift()!, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    return "ডিক্রিপ্ট করা সম্ভব হয়নি";
  }
}
