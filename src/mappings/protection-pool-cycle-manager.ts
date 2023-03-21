import { ProtectionPoolCycleCreated } from "../../generated/ProtectionPoolCycleManager/ProtectionPoolCycleManager";
import { ProtectionPool } from "../../generated/schema";

export function handleProtectionPoolCycleCreated(
  event: ProtectionPoolCycleCreated
): void {
  let protectionPool = ProtectionPool.load(
    event.params.poolAddress.toHexString()
  );
  if (!protectionPool) {
    protectionPool = new ProtectionPool(event.params.poolAddress.toHexString());
  }

  protectionPool.id = event.params.poolAddress.toHexString();
  protectionPool.cycleDuration = event.params.cycleDuration;
  protectionPool.openCycleDuration = event.params.openCycleDuration;
  protectionPool.currentCycleIndex = event.params.cycleIndex;
  protectionPool.currentCycleStartTime = event.params.cycleStartTime;

  protectionPool.save();
}

// add a handler to keep the protection pool information up to date. e.g. call getCurrentPoolCycle().
