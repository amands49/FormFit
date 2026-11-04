import { SquatTracker } from "./squatTracker";
import { PushupTracker } from "./pushupTracker";
import { LungeTracker } from "./lungeTracker";

const TRACKERS = {
  squat: SquatTracker,
  pushup: PushupTracker,
  lunge: LungeTracker,
};

export function createTracker(exerciseId) {
  const TrackerClass = TRACKERS[exerciseId] ?? SquatTracker;
  return new TrackerClass();
}
