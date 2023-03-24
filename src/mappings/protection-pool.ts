import { BigInt } from "@graphprotocol/graph-ts";
import {
  ProtectionPool as ProtectionPoolContract,
  ProtectionPoolInitialized,
  ProtectionSold,
  ProtectionBought,
  WithdrawalRequested,
  WithdrawalMade
} from "../../generated/ProtectionPool/ProtectionPool";
import {
  ProtectionPool,
  User,
  SToken,
  Protection,
  WithdrawalRequest
} from "../../generated/schema";
import { ZERO_BIG_INT } from "../utils/constants";

export function handleProtectionPoolInitialized(
  event: ProtectionPoolInitialized
): void {
  let protectionPool = ProtectionPool.load(event.address.toHexString());
  if (!protectionPool) {
    protectionPool = new ProtectionPool(event.address.toHexString());
    protectionPool.id = event.address.toHexString();
    protectionPool.cycleDuration = ZERO_BIG_INT;
    protectionPool.openCycleDuration = ZERO_BIG_INT;
    protectionPool.currentCycleIndex = ZERO_BIG_INT;
    protectionPool.currentCycleStartTime = ZERO_BIG_INT;
  }

  protectionPool.underlyingToken = event.params.underlyingToken;
  protectionPool.referenceLendingPools = event.params.referenceLendingPools;

  const protectionPoolContract = ProtectionPoolContract.bind(event.address);
  const protectionPoolDetails = protectionPoolContract.getPoolDetails();
  const leverageRatio = protectionPoolContract.calculateLeverageRatio();
  const protectionPoolParams = protectionPoolContract.getPoolInfo().params;

  protectionPool.totalSTokenUnderlying =
    protectionPoolDetails.get_totalSTokenUnderlying();
  protectionPool.totalProtection = protectionPoolDetails.get_totalProtection();
  protectionPool.leverageRatio = leverageRatio;
  protectionPool.minProtectionDurationInSeconds =
    protectionPoolParams.minProtectionDurationInSeconds;
  protectionPool.protectionRenewalGracePeriodInSeconds =
    protectionPoolParams.protectionRenewalGracePeriodInSeconds;

  protectionPool.save();
}

export function handleProtectionSold(event: ProtectionSold): void {
  const transactionHash = event.transaction.hash.toHexString();
  let sToken = SToken.load(transactionHash);
  if (!sToken) {
    sToken = new SToken(transactionHash);
    sToken.id = transactionHash;
    sToken.userAddress = event.params.protectionSeller;
    sToken.sTokenAmount = ZERO_BIG_INT;
  }
  const protectionPoolContract = ProtectionPoolContract.bind(event.address);
  const sTokenAmount = protectionPoolContract.convertToSToken(
    event.params.protectionAmount
  );
  sToken.sTokenAmount = sToken.sTokenAmount.plus(sTokenAmount);
  sToken.save();

  const sellerAddressId = event.params.protectionSeller.toHexString();
  let user = User.load(sellerAddressId);
  if (!user) {
    user = new User(sellerAddressId);
    user.id = sellerAddressId;
    user.sTokenAmount = ZERO_BIG_INT;
    user.protections = [];
    user.withdrawalRequests = [];
  }
  user.sTokenAmount = user.sTokenAmount.plus(sToken.sTokenAmount);
  user.save();
}

// export function handleProtectionBought(event: ProtectionBought): void {
//   const transactionHash = event.transaction.hash.toHexString();
//   let protection = Protection.load(transactionHash);
//   if (!protection) {
//     protection = new Protection(transactionHash);
//     protection.id = transactionHash;
//     protection.userAddress = event.params.buyer;
//   }
//   protection.nftLpTokenId = ZERO_BIG_INT; // add data
//   protection.premiumAmount = event.params.premium;
//   protection.lendingPool = event.params.lendingPoolAddress.toHexString();
//   protection.protectionAmount = event.params.protectionAmount;
//   protection.startTimestamp = ZERO_BIG_INT;
//   protection.protectionDurationInSeconds = ZERO_BIG_INT; // add data
//   // add all the values to the protection entity
//   const protectionPoolContract = ProtectionPoolContract.bind(event.address);
//   const activeProtections = protectionPoolContract.getActiveProtections(
//     event.params.buyer
//   );

//   const buyerAddressId = event.params.buyer.toHex();
//   let user = User.load(buyerAddressId);
//   if (!user) {
//     user = new User(buyerAddressId);
//     user.id = buyerAddressId;
//     user.withdrawalRequests = [];
//   }
//   user.protections.push(protection);
//   user.save();
// }

// export function handleWithdrawalRequested(event: WithdrawalRequested): void {
//   const transactionHash = event.transaction.hash.toHexString();
//   let withdrawalRequest = WithdrawalRequest.load(transactionHash);
//   if (!withdrawalRequest) {
//     withdrawalRequest = new WithdrawalRequest(transactionHash);
//     withdrawalRequest.id = transactionHash;
//     withdrawalRequest.userAddress = event.params.seller;
//   }
//   withdrawalRequest.sTokenAmount = event.params.sTokenAmount;
//   withdrawalRequest.withdrawalCycleIndex = event.params.withdrawalCycleIndex;
//   withdrawalRequest.save();

//   const sellerAddressId = event.params.seller.toHex();
//   let user = User.load(sellerAddressId);
//   if (!user) {
//     user = new User(sellerAddressId);
//     user.id = sellerAddressId;
//     user.protections = [];
//   }
//   user.withdrawalRequests.push(withdrawalRequest);
//   user.save();
// }

export function handleWithdrawalMade(event: WithdrawalMade): void {
  const transactionHash = event.transaction.hash.toHexString();
  let sToken = SToken.load(transactionHash);
  if (!sToken) {
    sToken = new SToken(transactionHash);
    sToken.id = transactionHash;
    sToken.userAddress = event.params.seller;
    sToken.sTokenAmount = ZERO_BIG_INT;
  }
  sToken.sTokenAmount = sToken.sTokenAmount.minus(event.params.tokenAmount);
  sToken.save();

  const sellerAddressId = event.params.seller.toHexString();
  let user = User.load(sellerAddressId);
  if (!user) {
    user = new User(sellerAddressId);
    user.id = sellerAddressId;
    user.sTokenAmount = ZERO_BIG_INT;
    user.protections = [];
    user.withdrawalRequests = [];
  }
  user.sTokenAmount = user.sTokenAmount.minus(event.params.tokenAmount);
  user.save();
}
