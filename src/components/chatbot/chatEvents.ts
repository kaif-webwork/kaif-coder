export function openKairoAIChat(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-kairo-ai'));
  }
}

export const openKivoAIChat = openKairoAIChat;
export const openKaifAIChat = openKairoAIChat;
