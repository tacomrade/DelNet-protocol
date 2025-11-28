---

## `docs/roadmap.md`

```markdown
# DelNet Roadmap

This document outlines the planned evolution of the DelNet protocol and its reference implementations.

---

## Phase 1 — v0.1 (Current)

- ✅ Define basic DelNet data model
  - Identity
  - Card (content object)
  - Wire message envelope
- ✅ Define minimal message types
  - HELLO, CARD_OFFER, CARD_REQUEST, CARD, ACK
- ✅ Implement a browser PoC
  - WebRTC DataChannel between two peers
  - Basic JSON message exchange
  - Simple UI for creating and receiving cards
- 🚧 Document limitations and security caveats

---

## Phase 2 — v0.2 (Crypto + Types)

- Implement real Ed25519 signing & verification in the PoC
- Introduce encrypted payloads (X25519 / WebCrypto-based)
- Add new card types:
  - `mission`
  - `event`
  - `proposal`
- Define basic error messages and error handling patterns

---

## Phase 3 — v0.3 (Replication + Circles)

- Allow multi-peer replication (small mesh of peers)
- Introduce "circles" or "groups" for scoped sharing
- Define presence / availability semantics (who’s online)
- Introduce simple trust graph ideas:
  - direct contacts
  - mutual contacts

---

## Phase 4 — v1.0 (Production-Ready)

- Stable protocol version and versioning policy
- Formal security review of protocol and reference implementations
- SDKs for:
  - Web / JS
  - Mobile (Android/iOS)
  - Possibly CLI / desktop
- Tools for backup/restore and identity portability

---

## Phase 5 — Ecosystem

- Example DelNet-based applications:
  - Local-first social / messaging
  - Mission / task sharing
  - Community governance prototypes
- Bridges to other protocols where meaningful
- Community-driven proposals (DIPs: DelNet Improvement Proposals)
