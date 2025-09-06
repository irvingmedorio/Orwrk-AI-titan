export async function sendVoiceAgentWebhook(payload: any) {
  // Cambia la URL por la de tu backend/webhook externo
  await fetch('https://tu-backend.com/webhook/voice-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}