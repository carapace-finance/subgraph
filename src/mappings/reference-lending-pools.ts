import { ReferenceLendingPoolAdded } from "../../generated/ReferenceLendingPools/ReferenceLendingPools";
import { LendingPool } from "../../generated/schema";
import { ZERO_BIG_INT } from "../utils/constants";

export function handleReferenceLendingPoolAdded(
  event: ReferenceLendingPoolAdded
): void {
  let lendingPool = LendingPool.load(
    event.params.lendingPoolAddress.toHexString()
  );
  if (!lendingPool) {
    lendingPool = new LendingPool(
      event.params.lendingPoolAddress.toHexString()
    );
  }
  lendingPool.id = event.params.lendingPoolAddress.toHexString();
  lendingPool.protocol =
    event.params.lendingPoolProtocol === 0 ? "Goldfinch" : "NA";
  lendingPool.addedTimestamp = event.params.addedTimestamp;
  lendingPool.protectionPurchaseLimitTimestamp =
    event.params.protectionPurchaseLimitTimestamp;
  lendingPool.totalProtection = ZERO_BIG_INT;
}
