/**
 * Tiny intro gate so the Hero (and anything else) can defer its entrance
 * animation until the Preloader has finished and started lifting away.
 *
 * Late subscribers still fire immediately if the intro is already released,
 * so there is no way to "miss" the signal regardless of mount order.
 */
/**
 * Playback rate of the whole first-load choreography (mark assembly, word
 * roll, curtain, hero + nav entrance). 1.25 = every step takes 80% as long.
 * The word roll multiplies this by a further 1.25 × 1.25 (ROLL_SPEED in
 * HeroLockup).
 */
export const INTRO_SPEED = 1.25;

let released = false;
const subscribers = new Set<() => void>();

/** Called by the Preloader once it begins its exit (or immediately when skipped). */
export function releaseIntro() {
  if (released) return;
  released = true;
  subscribers.forEach((cb) => cb());
  subscribers.clear();
}

/**
 * Run `cb` when the intro is released. If it already happened, runs on the
 * next tick. Returns an unsubscribe function.
 */
export function onIntroReady(cb: () => void): () => void {
  if (released) {
    cb();
    return () => {};
  }
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

export function isIntroReleased() {
  return released;
}
