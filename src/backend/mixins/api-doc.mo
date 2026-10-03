/// Static, human- and agent-readable documentation of the public backend API.
///
/// This mixin declares no state and reads no runtime values: `getApiDoc`
/// returns a fixed Markdown document authored from the current backend source.
/// It is included from `main.mo` so the document is reachable as a query call.
mixin () {
  /// Returns the backend API documentation as Markdown.
  public query func getApiDoc() : async Text {
    "
# JARVIS AI ASSISTANT — Backend API

## Purpose

This canister is the backend for **JARVIS AI ASSISTANT**, a portfolio web
application. The assistant itself is intentionally client-side: chat history
and user settings live in the browser's `localStorage`, and the response engine
is a local rule-based system. The backend therefore holds **no domain data** —
no chat messages, no settings, no user profiles.

Its responsibilities today are:

1. **Authorization** — role-based access control for the app's principals.
2. **Data intelligence exposure** — an OQL surface (`schema` / `execute`) that
   currently exposes no entities, because there is no persisted domain data.

The response engine is structured behind a single seam in the frontend so a
real AI API can be connected later through this backend without changing the
UI. No such integration exists yet, and no API keys are stored here.

## Public methods

### `getApiDoc() : async Text` (query)

Returns this document. Read-only, no authentication required.

### `getCallerUserRole() : async UserRole` (query)

Returns the role of the calling principal.

- `UserRole` is the variant `{ #admin; #user; #guest }`.
- An **anonymous** caller always receives `#guest`.
- A **signed-in but unregistered** caller traps with
  `\"User is not registered\"` — see *Registration* below.
- A registered caller receives the role stored for it.

### `isCallerAdmin() : async Bool` (query)

Returns `true` only when the caller's role is `#admin`. An anonymous caller
returns `false`; an unregistered signed-in caller traps with
`\"User is not registered\"` (the underlying role lookup traps before the
comparison).

### `assignCallerUserRole(user : Principal, role : UserRole) : async ()` (update)

Assigns `role` to `user`. Only an **admin** caller may call this; any other
caller traps with
`\"Unauthorized: Only admins can assign user roles\"`. The assignment is
persisted and is idempotent in effect: assigning the same role again leaves the
same state.

### `_initialize_access_control() : async ()` (update)

Registers the calling principal. See *Registration*.

### `_internet_identity_sign_in_start() : async Blob` (update)

Begins the Internet Identity attribute-verification handshake and returns a
challenge blob. Used by the app's sign-in flow.

### `_internet_identity_sign_in_finish() : async Result<(), Error>` (update)

Completes the handshake, registers the caller, and returns `#ok` or `#err`.
Used by the app's sign-in flow.

## Authentication and identity

The app's frontend authenticates with **Internet Identity** and pins a
derivation origin, published at `/.well-known/ii-derivation-origin` when
available. An agent that already holds the user's Internet Identity
authorization derives the correct per-app principal against that origin, for
example:

```
icp identity link web <name> --app <host>
```

Such a delegation acts with the user's **full authority in this app** until it
expires. Treat the derived identity as the user.

## Registration

Registration is a prerequisite for every role-guarded call, including the
guarded queries `getCallerUserRole` and `isCallerAdmin`.

- A direct API caller registers by calling `_initialize_access_control()` once
  as a **signed-in** (non-anonymous) caller, before any role-guarded call.
- The **first** principal to register becomes `#admin`; every subsequent
  principal becomes `#user`.
- An **anonymous** caller is never registered: `_initialize_access_control`
  returns without recording anything, and role lookups return `#guest`.
- An **unregistered signed-in** caller receives the trap
  `\"User is not registered\"` on `getCallerUserRole` / `isCallerAdmin`, and
  `\"Unauthorized: Only admins can assign user roles\"` on
  `assignCallerUserRole`.

A caller can be unregistered even when the app already knows it: registration
happens only when a caller signs in through the app's own frontend. A principal
that never did so is unregistered even if it belongs to the app's owner, and a
signed-in caller derived against a different origin is a **different principal**
than the one the frontend registered.

## Authorization

- `#admin` — may assign roles via `assignCallerUserRole`.
- `#user` — registered, no administrative privileges.
- `#guest` — anonymous callers; read-only, no administrative privileges.

There is no admin principal hard-coded in this canister; the first registered
principal becomes admin at runtime.

## Data intelligence (OQL)

The canister includes the OQL `Expose` mixin, which adds the query methods
`schema()` and `execute(...)`. The entity list is currently **empty**
(`Expose({ entities = [] })`) because the backend persists no domain data.
`schema()` therefore reports no tables, and `execute(...)` has nothing to
query. Chat history and settings are client-side `localStorage` and are not
reachable through this canister.

## Units and encodings

- **Timestamps** — none are exposed by this API. The frontend records message
  timestamps in the browser.
- **Principals** — Internet Computer principals, passed as `Principal` values
  in Candid and rendered as text in the UI.
- **Roles** — the `UserRole` variant `{ #admin; #user; #guest }`.
- **Blobs** — `_internet_identity_sign_in_start` returns an opaque challenge
  `Blob`; treat it as an opaque token.

## Lifecycle and polling

- All methods are single-shot request/response calls; there is nothing to poll.
- `_internet_identity_sign_in_start` and `_internet_identity_sign_in_finish`
  form a two-step handshake and must be called in order by the same caller.
- `getApiDoc`, `getCallerUserRole`, and `isCallerAdmin` are `query` calls and
  return immediately without consensus.

## Mutation retry safety

- `_initialize_access_control` is **idempotent**: re-registering an already
  registered principal leaves its role unchanged. Retrying it is safe.
- `assignCallerUserRole` is idempotent in effect: re-assigning the same role
  leaves the same state. It is **not** safe to retry with a different role if
  the first call's outcome is unknown — the last successful call wins.
- The sign-in handshake methods are not idempotent as a pair; restart the
  handshake rather than retrying `_internet_identity_sign_in_finish` blindly.

## Errors, traps, and gotchas

- `\"User is not registered\"` — a signed-in caller that never registered calls a
  role-guarded method.
- `\"Unauthorized: Only admins can assign user roles\"` — a non-admin caller
  attempts `assignCallerUserRole`.
- Anonymous callers never trap on role lookups; they receive `#guest` / `false`.
- The backend stores no chat or settings data, so clearing browser storage
  clears the app's history and settings permanently.
- No secret API keys are stored in this canister.
";
  };
};
