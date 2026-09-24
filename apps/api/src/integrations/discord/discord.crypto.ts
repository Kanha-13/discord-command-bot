import crypto from "node:crypto";

export function verifyDiscordRequest(
  publicKeyHex: string,
  signatureHex: string,
  timestamp: string,
  rawBody: Buffer,
): boolean {
  try {
    const publicKey = crypto.createPublicKey({
      key: Buffer.concat([
        // Ed25519 SPKI DER prefix
        Buffer.from("302a300506032b6570032100", "hex"),
        Buffer.from(publicKeyHex, "hex"),
      ]),
      format: "der",
      type: "spki",
    });

    const message = Buffer.concat([
      Buffer.from(timestamp),
      rawBody,
    ]);

    return crypto.verify(
      null,
      message,
      publicKey,
      Buffer.from(signatureHex, "hex"),
    );
  } catch {
    return false;
  }
}