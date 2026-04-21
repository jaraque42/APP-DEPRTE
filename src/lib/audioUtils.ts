let audioCtx: AudioContext | null = null;

const getAudioCtx = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

/**
 * Inicializa o reanuda el contexto de audio. 
 * Debe llamarse desde un evento de usuario (click).
 */
export const initAudio = async () => {
  const ctx = getAudioCtx();
  if (ctx && ctx.state === 'suspended') {
    await ctx.resume();
  }
};

/**
 * Reproduce un sonido de pitido (beep) usando la Web Audio API.
 */
export const playBeep = async (frequency = 440, duration = 0.2, volume = 0.5) => {
  const ctx = getAudioCtx();
  if (!ctx) return;

  try {
    // Los navegadores bloquean el audio hasta que hay una interacción. 
    // Intentamos reanudar el contexto si está suspendido.
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Tipo 'triangle' suena más a "beep" clásico que 'sine'
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    // Envolvente de volumen para evitar "clicks" al final
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn("AudioContext bloqueado o error de reproducción:", e);
  }
};

/**
 * Sonido para el final de la cuenta atrás (agudo y doble)
 */
export const playSuccessSound = () => {
    playBeep(880, 0.15, 0.6);
    setTimeout(() => playBeep(1100, 0.3, 0.6), 150);
};

/**
 * Sonido para cada segundo (más corto y grave)
 */
export const playTickSound = () => {
    playBeep(550, 0.1, 0.4);
};
