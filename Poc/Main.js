// DelNet PoC main JS
// - Creates a simple local identity (no real crypto yet)
// - Establishes a WebRTC datachannel via a WebSocket signaling server
// - Sends/receives "CARD" messages using the DelNet envelope format

const signalingUrl = "ws://localhost:8080"; // change if needed
let signalingSocket = null;

let isHost = false;
let sessionId = null;

let pc = null;
let dataChannel = null;

let identity = null;

const displayNameInput = document.getElementById("displayName");
const saveIdentityBtn = document.getElementById("saveIdentityBtn");
const createSessionBtn = document.getElementById("createSessionBtn");
const joinSessionIdInput = document.getElementById("joinSessionId");
const joinSessionBtn = document.getElementById("joinSessionBtn");
const sessionIdText = document.getElementById("sessionIdText");
const connectionStatus = document.getElementById("connectionStatus");
const sendCardBtn = document.getElementById("sendCardBtn");
const cardTitleInput = document.getElementById("cardTitle");
const cardBodyInput = document.getElementById("cardBody");
const statusEl = document.getElementById("status");
const cardsListEl = document.getElementById("cardsList");

function log(msg) {
  console.log(msg);
  statusEl.textContent += msg + "\n";
}

function loadIdentity() {
  try {
    const stored = localStorage.getItem("delnet_identity");
    if (stored) {
      identity = JSON.parse(stored);
      if (identity.displayName) {
        displayNameInput.value = identity.displayName;
      }
      log("Loaded identity: " + identity.id);
    } else {
      identity = {
        id: "delnet:identity:" + randomId(),
        publicKey: null, // TODO: real Ed25519
        displayName: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        meta: {
          client: "delnet-poc",
          clientVersion: "0.1.0"
        }
      };
      localStorage.setItem("delnet_identity", JSON.stringify(identity));
      log("Created new identity: " + identity.id);
    }
  } catch (e) {
    log("Error loading identity: " + e.message);
  }
}

function saveIdentity() {
  identity.displayName = displayNameInput.value || "";
  identity.updatedAt = new Date().toISOString();
  localStorage.setItem("delnet_identity", JSON.stringify(identity));
  log("Saved identity with name: " + identity.displayName);
}

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function createEnvelope(type, body) {
  return {
    msgId: "delnet:msg:" + randomId(),
    protocol: "delnet",
    protocolVersion: 1,
    type,
    senderId: identity.id,
    createdAt: new Date().toISOString(),
    body
  };
}

// --- WebRTC + signaling ---

function connectSignaling() {
  return new Promise((resolve, reject) => {
    signalingSocket = new WebSocket(signalingUrl);
    signalingSocket.onopen = () => {
      log("Signaling connected");
      resolve();
    };
    signalingSocket.onerror = (err) => {
      log("Signaling error: " + err.message);
      reject(err);
    };
    signalingSocket.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (!msg.sessionId || msg.sessionId !== sessionId) return;

        if (msg.type === "offer" && !isHost) {
          log("Received offer");
          await handleOffer(msg);
        } else if (msg.type === "answer" && isHost) {
          log("Received answer");
          await handleAnswer(msg);
        } else if (msg.type === "candidate") {
          await handleCandidate(msg);
        }
      } catch (e) {
        log("Signaling message error: " + e.message);
      }
    };
  });
}

function sendSignalingMessage(payload) {
  if (!signalingSocket || signalingSocket.readyState !== WebSocket.OPEN) {
    log("Signaling not open");
    return;
  }
  const msg = JSON.stringify({ ...payload, sessionId });
  signalingSocket.send(msg);
}

async function createPeerConnection() {
  pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      sendSignalingMessage({ type: "candidate", candidate: event.candidate });
    }
  };

  pc.onconnectionstatechange = () => {
    log("PeerConnection state: " + pc.connectionState);
    if (pc.connectionState === "connected") {
      connectionStatus.textContent = "connected";
    }
  };

  if (!isHost) {
    pc.ondatachannel = (event) => {
      log("Data channel received");
      dataChannel = event.channel;
      setupDataChannel();
    };
  }
}

function setupDataChannel() {
  dataChannel.onopen = () => {
    log("Data channel open");
    connectionStatus.textContent = "connected";
    sendCardBtn.disabled = false;
    sendHELLO();
  };

  dataChannel.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      handleDelNetMessage(msg);
    } catch (e) {
      log("Error parsing datachannel message: " + e.message);
    }
  };

  dataChannel.onclose = () => {
    log("Data channel closed");
    connectionStatus.textContent = "disconnected";
    sendCardBtn.disabled = true;
  };
}

// --- DelNet messages over datachannel ---

function sendOverDataChannel(obj) {
  if (!dataChannel || dataChannel.readyState !== "open") {
    log("Data channel not open");
    return;
  }
  dataChannel.send(JSON.stringify(obj));
}

function sendHELLO() {
  const msg = createEnvelope("HELLO", {
    identity,
    capabilities: {
      supportsEncryption: false,
      maxBatchSize: 10
    }
  });
  sendOverDataChannel(msg);
}

function sendCard() {
  const title = cardTitleInput.value.trim();
  const body = cardBodyInput.value.trim();
  if (!title && !body) {
    alert("Enter a title or body first.");
    return;
  }

  const card = {
    id: "delnet:card:" + randomId(),
    version: 1,
    authorId: identity.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: "note",
    payload: {
      title,
      body,
      url: null
    },
    tags: [],
    visibility: "direct",
    expiresAt: null,
    signature: {
      algo: "none",
      publicKey: null,
      value: null,
      signedAt: null
    },
    encryption: {
      isEncrypted: false,
      recipients: []
    }
  };

  const msg = createEnvelope("CARD", { card });
  sendOverDataChannel(msg);
  addCardToList(card, true);

  cardTitleInput.value = "";
  cardBodyInput.value = "";
}

function handleDelNetMessage(msg) {
  log("DelNet message: " + msg.type);
  switch (msg.type) {
    case "HELLO":
      // For now just log
      log("HELLO from " + msg.senderId);
      break;
    case "CARD":
      if (msg.body && msg.body.card) {
        addCardToList(msg.body.card, false);
      }
      break;
    default:
      log("Unknown DelNet message type: " + msg.type);
  }
}

function addCardToList(card, isLocal) {
  if (cardsListEl.textContent.trim() === "No cards yet.") {
    cardsListEl.textContent = "";
  }
  const div = document.createElement("div");
  div.style.borderBottom = "1px solid #1f2937";
  div.style.padding = "0.4rem 0";

  const title = card.payload?.title || "(no title)";
  const body = card.payload?.body || "";
  const origin = isLocal ? "You" : "Peer";

  div.innerHTML = `
    <div><strong>${escapeHtml(title)}</strong> <span class="small">from ${origin}</span></div>
    <div>${escapeHtml(body)}</div>
    <div class="small">${card.id}</div>
  `;
  cardsListEl.prepend(div);
}

function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, (c) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return map[c] || c;
  });
}

// --- Host / Join flows ---

async function startHostSession() {
  isHost = true;
  sessionId = "session-" + randomId();
  sessionIdText.textContent = sessionId;

  await connectSignaling();
  await createPeerConnection();

  dataChannel = pc.createDataChannel("delnet");
  setupDataChannel();

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  sendSignalingMessage({ type: "offer", sdp: pc.localDescription });
  connectionStatus.textContent = "waiting for peer...";
  log("Offer sent");
}

async function joinSession() {
  const inputId = joinSessionIdInput.value.trim();
  if (!inputId) {
    alert("Enter a session ID to join.");
    return;
  }
  isHost = false;
  sessionId = inputId;
  sessionIdText.textContent = sessionId;

  await connectSignaling();
  await createPeerConnection();

  connectionStatus.textContent = "waiting for offer...";
  log("Joined session, waiting for offer...");
}

async function handleOffer(msg) {
  if (!pc) {
    await createPeerConnection();
  }
  await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  sendSignalingMessage({ type: "answer", sdp: pc.localDescription });
  log("Answer sent");
}

async function handleAnswer(msg) {
  await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
  log("Remote description set (answer)");
}

async function handleCandidate(msg) {
  if (!pc) return;
  try {
    await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
  } catch (e) {
    log("Error adding ICE candidate: " + e.message);
  }
}

// --- Event listeners ---

saveIdentityBtn.addEventListener("click", saveIdentity);
createSessionBtn.addEventListener("click", startHostSession);
joinSessionBtn.addEventListener("click", joinSession);
sendCardBtn.addEventListener("click", sendCard);

// Initialize
loadIdentity();
connectionStatus.textContent = "disconnected";
