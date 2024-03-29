import { ProtectionPoolCycleCreated } from "../../generated/ProtectionPoolCycleManager/ProtectionPoolCycleManager";
import { ProtectionPool } from "../../generated/schema";
import { ZERO_BIG_INT, ZERO_BYTES } from "../utils/constants";

export function handleProtectionPoolCycleCreated(
  event: ProtectionPoolCycleCreated
): void {
  let protectionPool = ProtectionPool.load(
    event.params.poolAddress.toHexString()
  );
  if (!protectionPool) {
    protectionPool = new ProtectionPool(event.params.poolAddress.toHexString());
    protectionPool.id = event.params.poolAddress.toHexString();
    protectionPool.underlyingToken = ZERO_BYTES;
    protectionPool.referenceLendingPools = ZERO_BYTES;
    protectionPool.totalSTokenUnderlying = ZERO_BIG_INT;
    protectionPool.totalProtection = ZERO_BIG_INT;
    protectionPool.leverageRatio = ZERO_BIG_INT;
    protectionPool.minProtectionDurationInSeconds = ZERO_BIG_INT;
    protectionPool.protectionRenewalGracePeriodInSeconds = ZERO_BIG_INT;
  }

  protectionPool.cycleDuration = event.params.cycleDuration;
  protectionPool.openCycleDuration = event.params.openCycleDuration;
  protectionPool.currentCycleIndex = event.params.cycleIndex;
  protectionPool.currentCycleStartTime = event.params.cycleStartTime;

  protectionPool.save();
}

// add a handler to keep the protection pool information up to date. e.g. call getCurrentPoolCycle().
