# DelNet Protocol v0.1  
*A peer-to-peer, local-first protocol for sharing signed content objects (“cards”).*

---

## 0. Purpose

The **DelNet Protocol** defines a minimal, open, browser-friendly method for:

- Generating and exchanging decentralized identities  
- Creating signed content objects (“cards”)  
- Sharing them between peers over peer-to-peer WebRTC connections  
- Verifying authenticity and integrity locally  
- Maintaining local ownership of all data  

This v0.1 specification focuses on a PoC-level feature set and is **not** production-ready.

---

## 1. Design Principles

1. **Peer-to-peer first** – Devices talk directly (WebRTC DataChannels).  
2. **Open and platform-agnostic** – JSON-only data model.  
3. **Local-first** – Each peer stores and owns its data.  
4. **Cryptographic authenticity (planned)** – Ed25519 signatures for authorship and integrity.  
5. **Minimal core** – Only the essentials needed to demonstrate the concept.

> Implementation note: The PoC code may use placeholder signatures.  
> The protocol spec is written as if real crypto is in place.

---

## 2. Identities

### 2.1 Local Keypair

Each client SHOULD generate an Ed25519 keypair (future requirement):

- Private key: stored only on the device.  
- Public key: shareable, used as identity.

### 2.2 Identity Object

```json
{
  "id": "did:delnet:ed25519:8f93a0f3...",
  "publicKey": "8f93a0f3b9c1...",
  "displayName": "Karl",
  "avatarUrl": null,
  "createdAt": "2025-11-28T01:23:45.000Z",
  "updatedAt": "2025-11-28T01:23:45.000Z",
  "meta": {
    "client": "delnet-poc",
    "clientVersion": "0.1.0"
  }
}
