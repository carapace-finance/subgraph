import { ProtectionPoolInitialized } from "./generated/ProtectionPool/ProtectionPool";
import { ProtectionPool } from "./generated/schema";

export function handleProtectionPoolInitialized(
  event: ProtectionPoolInitialized
): void {
  let protectionPool = new ProtectionPool(event.transaction.from.toHex());
  protectionPool.underlyingToken = event.params.underlyingToken.toHexString();
  protectionPool.referenceLendingPools =
    event.params.referenceLendingPools.toHexString();
  protectionPool.save();
}
