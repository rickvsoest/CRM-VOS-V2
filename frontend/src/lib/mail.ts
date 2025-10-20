// Eenvoudige stub - later vervangen door echte API-call
export async function sendAccountInvite(email: string, inviteLink: string) {
  // Simuleer netwerkvertraging
  await new Promise((r) => setTimeout(r, 400));
  // Log nu alleen; vervang dit later door fetch naar je backend
  console.log("[mail] Account invite ->", { email, inviteLink });
  return { ok: true as const };
}

// (optioneel) helper voor basisvalidatie
export function isValidEmail(email?: string | null): email is string {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
