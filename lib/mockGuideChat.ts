import type {
  GuideChatMessage,
  GuideChatMessagesResponse,
  SendGuideChatMessageResponse,
} from '../types/guideChat';

const store = new Map<string, GuideChatMessage[]>();

function createId(): string {
  return `mock-chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildMockReply(question: string, guideTitle: string, poiName: string): string {
  const trimmed = question.trim();
  const lower = trimmed.toLowerCase();

  if (lower.includes('quand') || lower.includes('date') || lower.includes('époque')) {
    return `Dans « ${guideTitle} », les repères chronologiques sont essentiels pour comprendre l’histoire de ${poiName}. Je peux vous aider à situer un événement ou une période si vous précisez ce qui vous intéresse.`;
  }

  if (lower.includes('où') || lower.includes('comment aller') || lower.includes('accès')) {
    return `${poiName} se visite facilement une fois sur place. Si votre question porte sur un lieu précis mentionné dans l’audioguide, indiquez-le et je vous orienterai à partir du contenu du guide « ${guideTitle} ».`;
  }

  if (lower.includes('pourquoi') || lower.includes('comment')) {
    return `Bonne question. L’audioguide « ${guideTitle} » développe ce point en reliant l’histoire de ${poiName} à son contexte. En résumé : cela s’inscrit dans une évolution plus large que le guide détaille — souhaitez-vous que j’approfondisse un aspect en particulier ?`;
  }

  return `Merci pour votre question sur « ${guideTitle} ». D’après le contenu de l’audioguide consacré à ${poiName}, je peux vous apporter des précisions sur les personnages, les dates ou les anecdotes évoquées. Que souhaitez-vous explorer davantage ?`;
}

export async function fetchMockGuideChatMessages(
  poiId: string,
): Promise<GuideChatMessagesResponse> {
  await delay(400);
  return {
    messages: store.get(poiId) ?? [],
    creditsBalance: 12,
  };
}

export async function sendMockGuideChatMessage(
  poiId: string,
  content: string,
  context: { guideTitle: string; poiName: string },
): Promise<SendGuideChatMessageResponse> {
  await delay(1200);

  const now = new Date().toISOString();
  const userMessage: GuideChatMessage = {
    id: createId(),
    role: 'user',
    content: content.trim(),
    createdAt: now,
  };

  const assistantMessage: GuideChatMessage = {
    id: createId(),
    role: 'assistant',
    content: buildMockReply(content, context.guideTitle, context.poiName),
    createdAt: new Date().toISOString(),
  };

  const existing = store.get(poiId) ?? [];
  store.set(poiId, [...existing, userMessage, assistantMessage]);

  return {
    userMessage,
    assistantMessage,
    creditsBalance: 12,
  };
}
