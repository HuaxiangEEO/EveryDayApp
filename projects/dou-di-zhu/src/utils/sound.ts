/**
 * 极简音效系统：Web Audio 合成（不依赖任何外部音频文件）。
 *
 * 思路：用 OscillatorNode + GainNode 拼出 4 类音效：
 *  - play   出牌：轻快短促（800Hz，60ms）
 *  - pass   不要：低沉短促（300Hz，70ms）
 *  - bomb   炸弹：低频→高频快速 sweep（200ms）
 *  - rocket 王炸：连续上升音阶（300ms）
 *  - win    胜利：和弦（C E G，450ms）
 *
 * 由调用方根据 settings.soundEnabled 决定是否播放。
 */

type SoundKind = 'play' | 'pass' | 'bomb' | 'rocket' | 'win' | 'lose';

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  return ctx;
}

interface ToneSpec {
  freq: number;
  /** 起始 (秒，相对 now) */
  start: number;
  /** 持续时间 (秒) */
  dur: number;
  /** 振荡器类型 */
  type?: OscillatorType;
  /** 峰值音量 0~1 */
  gain?: number;
  /** 频率 sweep 终值 */
  endFreq?: number;
}

function playTone(spec: ToneSpec) {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = spec.type ?? 'sine';
  osc.frequency.setValueAtTime(spec.freq, now + spec.start);
  if (spec.endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(1, spec.endFreq),
      now + spec.start + spec.dur,
    );
  }
  const peak = spec.gain ?? 0.18;
  gain.gain.setValueAtTime(0, now + spec.start);
  gain.gain.linearRampToValueAtTime(peak, now + spec.start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + spec.start + spec.dur);
  osc.connect(gain).connect(c.destination);
  osc.start(now + spec.start);
  osc.stop(now + spec.start + spec.dur + 0.05);
}

function playSequence(specs: ToneSpec[]) {
  for (const s of specs) playTone(s);
}

export function playSound(kind: SoundKind): void {
  switch (kind) {
    case 'play':
      playTone({ freq: 760, start: 0, dur: 0.07, type: 'triangle', gain: 0.16 });
      break;
    case 'pass':
      playTone({ freq: 320, start: 0, dur: 0.09, type: 'sine', gain: 0.14 });
      playTone({ freq: 240, start: 0.04, dur: 0.08, type: 'sine', gain: 0.12 });
      break;
    case 'bomb':
      playSequence([
        { freq: 120, start: 0, dur: 0.18, type: 'sawtooth', gain: 0.22, endFreq: 60 },
        { freq: 480, start: 0, dur: 0.16, type: 'square', gain: 0.10, endFreq: 240 },
      ]);
      break;
    case 'rocket':
      playSequence([
        { freq: 440, start: 0.00, dur: 0.10, type: 'square', gain: 0.18 },
        { freq: 660, start: 0.08, dur: 0.10, type: 'square', gain: 0.18 },
        { freq: 880, start: 0.16, dur: 0.14, type: 'square', gain: 0.20 },
        { freq: 1320, start: 0.30, dur: 0.18, type: 'triangle', gain: 0.18 },
      ]);
      break;
    case 'win':
      playSequence([
        { freq: 523.25, start: 0.0, dur: 0.30, type: 'triangle', gain: 0.18 },
        { freq: 659.25, start: 0.05, dur: 0.30, type: 'triangle', gain: 0.16 },
        { freq: 783.99, start: 0.10, dur: 0.40, type: 'triangle', gain: 0.18 },
        { freq: 1046.50, start: 0.30, dur: 0.30, type: 'triangle', gain: 0.18 },
      ]);
      break;
    case 'lose':
      playSequence([
        { freq: 392, start: 0.0, dur: 0.18, type: 'sine', gain: 0.16 },
        { freq: 329.63, start: 0.14, dur: 0.18, type: 'sine', gain: 0.16 },
        { freq: 261.63, start: 0.28, dur: 0.30, type: 'sine', gain: 0.18 },
      ]);
      break;
  }
}
