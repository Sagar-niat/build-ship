export interface PIIScanResult {
  piiTypesDetected: string[];
  detectedCount: number;
  originalText: string;
  redactedText: string;
  matches: Array<{ type: string; value: string }>;
}

export function scanAndRedactPII(text: string): PIIScanResult {
  const matches: Array<{ type: string; value: string }> = [];
  let redacted = text;
  const detectedTypes = new Set<string>();

  // 1. Email Address
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = text.match(emailRegex);
  if (emails) {
    emails.forEach(e => {
      detectedTypes.add('EMAIL');
      matches.push({ type: 'EMAIL', value: e });
    });
    redacted = redacted.replace(emailRegex, '[EMAIL_REDACTED]');
  }

  // 2. Phone Numbers (Indian / International formats)
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3,5}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{4}/g;
  const phones = text.match(phoneRegex);
  if (phones) {
    phones.forEach(p => {
      if (p.replace(/\D/g, '').length >= 10) {
        detectedTypes.add('PHONE');
        matches.push({ type: 'PHONE', value: p });
      }
    });
    redacted = redacted.replace(phoneRegex, (m) => m.replace(/\D/g, '').length >= 10 ? '[PHONE_REDACTED]' : m);
  }

  // 3. Aadhaar Number (12 digits)
  const aadhaarRegex = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
  const aadhaars = text.match(aadhaarRegex);
  if (aadhaars) {
    aadhaars.forEach(a => {
      detectedTypes.add('AADHAAR_ID');
      matches.push({ type: 'AADHAAR_ID', value: a });
    });
    redacted = redacted.replace(aadhaarRegex, '[AADHAAR_REDACTED]');
  }

  // 4. PAN Card Number (10 alphanumeric chars e.g. ABCDE1234F)
  const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g;
  const pans = text.match(panRegex);
  if (pans) {
    pans.forEach(p => {
      detectedTypes.add('PAN_ID');
      matches.push({ type: 'PAN_ID', value: p });
    });
    redacted = redacted.replace(panRegex, '[PAN_REDACTED]');
  }

  // 5. Credit/Debit Card Pattern (16 digits)
  const cardRegex = /\b(?:\d[ -]*?){13,16}\b/g;
  const cards = text.match(cardRegex);
  if (cards) {
    cards.forEach(c => {
      if (c.replace(/\D/g, '').length >= 13) {
        detectedTypes.add('CREDIT_CARD');
        matches.push({ type: 'CREDIT_CARD', value: c });
      }
    });
    redacted = redacted.replace(cardRegex, (m) => m.replace(/\D/g, '').length >= 13 ? '[CARD_REDACTED]' : m);
  }

  // 6. IP Addresses
  const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
  const ips = text.match(ipRegex);
  if (ips) {
    ips.forEach(ip => {
      detectedTypes.add('IP_ADDRESS');
      matches.push({ type: 'IP_ADDRESS', value: ip });
    });
    redacted = redacted.replace(ipRegex, '[IP_REDACTED]');
  }

  return {
    piiTypesDetected: Array.from(detectedTypes),
    detectedCount: matches.length,
    originalText: text,
    redactedText: redacted,
    matches
  };
}
