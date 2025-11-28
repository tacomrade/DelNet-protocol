{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "DelNet Card",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "version": { "type": "integer" },
    "authorId": { "type": "string" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" },
    "type": { "type": "string" },
    "payload": { "type": "object" },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    },
    "visibility": { "type": ["string", "null"] },
    "expiresAt": { "type": ["string", "null"], "format": "date-time" },
    "signature": {
      "type": "object",
      "properties": {
        "algo": { "type": "string" },
        "publicKey": { "type": ["string", "null"] },
        "value": { "type": ["string", "null"] },
        "signedAt": { "type": ["string", "null"], "format": "date-time" }
      }
    },
    "encryption": {
      "type": "object",
      "properties": {
        "isEncrypted": { "type": "boolean" },
        "recipients": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    }
  },
  "required": ["id", "version", "authorId", "type", "payload"]
  }
