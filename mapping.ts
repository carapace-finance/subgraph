import {
  ProtectionPoolInitialized,
  ProtectionSold,
} from "./generated/ProtectionPool/ProtectionPool";
import { Deposit, ProtectionPool, User } from "./generated/schema";

export function handleProtectionPoolInitialized(
  event: ProtectionPoolInitialized
): void {
  const protectionPool = new ProtectionPool(event.transaction.from.toHex());
  protectionPool.underlyingToken = event.params.underlyingToken;
  protectionPool.referenceLendingPools = event.params.referenceLendingPools;
  protectionPool.save();
}

export function handleProtectionSold(event: ProtectionSold): void {
  console.log("handleProtectionSold");

  const protectionPoolId = event.transaction.from.toHex();
  // const protectionPool = ProtectionPool.load(protectionPoolId);
  // if (protectionPool == null) {
  //   // TODO: can we do anything else here?
  //   throw new Error("Protection pool not found, id: " + protectionPoolId);
  //   return;
  // }

  let user = User.load(event.params.protectionSeller.toHex());
  if (user == null) {
    user = new User(event.params.protectionSeller.toHex());
    user.deposits = [];
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

  console.log("handleProtectionSold done");
}
