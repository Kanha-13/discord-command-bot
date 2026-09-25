import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyDiscordRequest } from "../discord.crypto";

function createTestKeyPair() {
  return crypto.generateKeyPairSync("ed25519");
}

function getPublicKeyHex(
  publicKey: crypto.KeyObject,
) {
  const der = publicKey.export({
    type: "spki",
    format: "der",
  });

  return der.subarray(-32).toString("hex");
}

describe("verifyDiscordRequest", () => {
  it("accepts a valid Discord signature", () => {
    const { publicKey, privateKey } =
      createTestKeyPair();

    const timestamp = "1750000000";
    const body = Buffer.from(
      JSON.stringify({
        type: 1,
      }),
    );

    const message = Buffer.concat([
      Buffer.from(timestamp),
      body,
    ]);

    const signature = crypto
      .sign(null, message, privateKey)
      .toString("hex");

    const publicKeyHex =
      getPublicKeyHex(publicKey);

    expect(
      verifyDiscordRequest(
        publicKeyHex,
        signature,
        timestamp,
        body,
      ),
    ).toBe(true);
  });

  it("rejects a modified request body", () => {
    const { publicKey, privateKey } =
      createTestKeyPair();

    const timestamp = "1750000000";

    const originalBody = Buffer.from(
      JSON.stringify({
        type: 1,
      }),
    );

    const modifiedBody = Buffer.from(
      JSON.stringify({
        type: 2,
      }),
    );

    const message = Buffer.concat([
      Buffer.from(timestamp),
      originalBody,
    ]);

    const signature = crypto
      .sign(null, message, privateKey)
      .toString("hex");

    const publicKeyHex =
      getPublicKeyHex(publicKey);

    expect(
      verifyDiscordRequest(
        publicKeyHex,
        signature,
        timestamp,
        modifiedBody,
      ),
    ).toBe(false);
  });

  it("rejects an invalid signature", () => {
    const { publicKey } =
      createTestKeyPair();

    const body = Buffer.from(
      JSON.stringify({
        type: 1,
      }),
    );

    const publicKeyHex =
      getPublicKeyHex(publicKey);

    expect(
      verifyDiscordRequest(
        publicKeyHex,
        "invalid-signature",
        "1750000000",
        body,
      ),
    ).toBe(false);
  });
});