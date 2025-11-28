# DelNet Protocol — v0.1  
**DelNet** is an open, peer-to-peer protocol for secure, local-first content sharing.

DelNet defines a small, JSON-based protocol for exchanging signed “cards” (content objects) directly between devices using WebRTC, without relying on a central database or proprietary identity provider.

This repository contains:

- The **DelNet Protocol v0.1** specification
- JSON schemas for identities, cards, and wire messages
- A minimal browser-based proof-of-concept (PoC)
- A roadmap for future protocol versions

DelNet is intended as a foundational protocol for new forms of local-first social apps, mission-driven communities, and peer-to-peer coordination tools.

---

## ✨ Key Ideas

- 🔐 **Cryptographic identity** (future): Decentralized identities built from Ed25519 keypairs  
- 🧾 **Signed content objects**: “Cards” representing notes, missions, links, etc.  
- 🔄 **Peer-to-peer transport**: WebRTC DataChannels for direct connections  
- 💾 **Local-first storage**: Each peer owns its own data; no default cloud backend  
- 🧱 **JSON all the way down**: Human-readable, language-agnostic data model  

> Note: The v0.1 PoC code focuses on the transport + data model.  
> Proper Ed25519 signing is specified in the protocol but not yet implemented in the PoC (marked as TODO).

---

## 🧱 Repository Structure

```text
.
├── docs/
│   ├── protocol-v0.1.md      # Full DelNet protocol spec
│   ├── roadmap.md            # Future evolution of DelNet
│   └── contributing.md       # How to get involved
├── schema/
│   ├── identity.json         # JSON Schema: identity object
│   ├── card.json             # JSON Schema: card/content object
│   └── message.json          # JSON Schema: wire message envelope
├── poc/
│   ├── index.html            # Browser PoC UI
│   ├── main.js               # WebRTC + DelNet message handling
│   └── signaling-server-example.js  # Minimal Node.js signaling server
├── LICENSE
└── README.md
