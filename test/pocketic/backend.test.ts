import { PocketIc } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("returns API documentation without trapping", async () => {
  const doc = await actor.getApiDoc();
  expect(typeof doc).toBe("string");
  expect(doc.length).toBeGreaterThan(0);
});

it("returns a schema string without trapping", async () => {
  const schema = await actor.schema();
  expect(typeof schema).toBe("string");
});

it("reports the caller role and admin flag for a fresh caller", async () => {
  const role = await actor.getCallerUserRole();
  expect(role).toHaveProperty("guest");
  await expect(actor.isCallerAdmin()).resolves.toBe(false);
});

it("rejects a malformed OQL query instead of returning data", async () => {
  // The entity set is empty and `execute` validates its input, so a malformed
  // query traps rather than silently succeeding.
  await expect(actor.execute("{}")).rejects.toThrow(/OQL: invalid query/);
});

it("does not grant admin to a non-owner caller", async () => {
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(guest.isCallerAdmin()).resolves.toBe(false);
});
