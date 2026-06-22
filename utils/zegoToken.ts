import crypto from "crypto";

function writeUInt64BE(value: number) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(value));
  return buffer;
}

function writeUInt16BE(value: number) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16BE(value);
  return buffer;
}

function normalizeKey(secret: string) {
  if (/^[0-9a-fA-F]{64}$/.test(secret)) {
    return Buffer.from(secret, "hex");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

export function generateZegoToken04({
  appId,
  userId,
  secret,
  effectiveTimeInSeconds = 3600,
  payload = "",
}: {
  appId: number;
  userId: string;
  secret: string;
  effectiveTimeInSeconds?: number;
  payload?: string;
}) {
  const now = Math.floor(Date.now() / 1000);
  const expire = now + effectiveTimeInSeconds;
  const nonce = crypto.randomInt(1, 2147483647);
  const plainText = JSON.stringify({
    app_id: appId,
    user_id: userId,
    nonce,
    ctime: now,
    expire,
    payload,
  });

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", normalizeKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tokenBuffer = Buffer.concat([
    writeUInt64BE(expire),
    writeUInt16BE(iv.length),
    iv,
    writeUInt16BE(encrypted.length),
    encrypted,
  ]);

  return `04${tokenBuffer.toString("base64")}`;
}
