import {
  ProtectionPoolInitialized,
  ProtectionSold,
} from "../generated/ProtectionPool/ProtectionPool";
import { ProtectionPool, User, Deposit } from "../generated/schema";

export function handleProtectionPoolInitialized(
  event: ProtectionPoolInitialized
): void {
  const protectionPool = new ProtectionPool(event.transaction.from.toHex());
  protectionPool.underlyingToken = event.params.underlyingToken;
  protectionPool.referenceLendingPools = event.params.referenceLendingPools;

  // TODO: need to pool this value from contract
  protectionPool.totalSTokenUnderlying = 0;
  protectionPool.totalProtection = 0;
  protectionPool.leverageRatio = 0;
  protectionPool.cycleDuration = 0;
  protectionPool.openCycleDuration = 0;
  protectionPool.currentCycleIndex = 0;
  protectionPool.remainingDaysInCurrentCycle = 0;
  protectionPool.renewalAllowancePeriod = 0;
  protectionPool.minProtectionDurationInSeconds = 0;
  protectionPool.maxProtectionDurationInSeconds = 0;

  // persist the protection pool
  protectionPool.save();
}

export function handleProtectionSold(event: ProtectionSold): void {
  const protectionPoolId = event.transaction.from.toHex();

  let user = User.load(event.params.protectionSeller.toHex());
  if (user == null) {
    user = new User(event.params.protectionSeller.toHex());
    user.deposits = [];
    user.protections = [];
    user.withdrawalRequests = [];
  }

  // Create and persist a new deposit
  const deposit = new Deposit(event.transaction.hash.toHex());
  deposit.protectionPool = protectionPoolId;
  deposit.underlyingAmount = event.params.protectionAmount;
  deposit.save();

  // Add the deposit to the user's deposits and save the user
  const deposits = user.deposits || [];
  deposits.push(deposit.id);
  user.deposits = deposits;
  user.save();
}
