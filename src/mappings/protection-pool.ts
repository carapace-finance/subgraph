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
  WithdrawalRequest,
  LendingPool
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

  let protectionPool = ProtectionPool.load(event.address.toHexString());
  if (!protectionPool) {
    protectionPool = new ProtectionPool(event.address.toHexString());
    protectionPool.id = event.address.toHexString();
  }
  const protectionPoolDetails = protectionPoolContract.getPoolDetails();
  protectionPool.totalSTokenUnderlying =
    protectionPoolDetails.get_totalSTokenUnderlying();
  protectionPool.leverageRatio =
    protectionPoolContract.calculateLeverageRatio();
  protectionPool.save();
}

export function handleProtectionBought(event: ProtectionBought): void {
  const transactionHash = event.transaction.hash.toHexString();
  let protection = Protection.load(transactionHash);
  if (!protection) {
    protection = new Protection(transactionHash);
    protection.id = transactionHash;
    protection.userAddress = event.params.buyer;
    protection.user = event.params.buyer.toHexString();
  }
  protection.premiumAmount = event.params.premium;
  protection.lendingPool = event.params.lendingPoolAddress.toHexString();
  protection.protectionAmount = event.params.protectionAmount;

  const protectionPoolContract = ProtectionPoolContract.bind(event.address);
  const activeProtections = protectionPoolContract.getActiveProtections(
    event.params.buyer
  );
  protection.nftLpTokenId = ZERO_BIG_INT; // add data
  protection.startTimestamp = ZERO_BIG_INT; // add data
  protection.protectionDurationInSeconds = ZERO_BIG_INT; // add data
  protection.save();

  const buyerAddressId = event.params.buyer.toHexString();
  let user = User.load(buyerAddressId);
  if (!user) {
    user = new User(buyerAddressId);
    user.id = buyerAddressId;
    user.sTokenAmount = ZERO_BIG_INT;
    user.protections = [];
    user.withdrawalRequests = [];
  }
  let protections = user.protections;
  protections.push(protection.id);
  user.protections = protections;
  user.save();

  let protectionPool = ProtectionPool.load(event.address.toHexString());
  if (!protectionPool) {
    protectionPool = new ProtectionPool(event.address.toHexString());
    protectionPool.id = event.address.toHexString();
  }
  const protectionPoolDetails = protectionPoolContract.getPoolDetails();
  protectionPool.totalProtection = protectionPoolDetails.get_totalProtection();
  protectionPool.leverageRatio =
    protectionPoolContract.calculateLeverageRatio();
  protectionPool.save();

  let lendingPool = LendingPool.load(
    event.params.lendingPoolAddress.toHexString()
  );
  if (!lendingPool) {
    lendingPool = new LendingPool(
      event.params.lendingPoolAddress.toHexString()
    );
    lendingPool.id = event.params.lendingPoolAddress.toHexString();
  }
  lendingPool.totalProtection = lendingPool.totalProtection.plus(
    event.params.protectionAmount
  );
  lendingPool.save();
}

export function handleWithdrawalRequested(event: WithdrawalRequested): void {
  const transactionHash = event.transaction.hash.toHexString();
  let withdrawalRequest = WithdrawalRequest.load(transactionHash);
  if (!withdrawalRequest) {
    withdrawalRequest = new WithdrawalRequest(transactionHash);
    withdrawalRequest.id = transactionHash;
    withdrawalRequest.userAddress = event.params.seller;
    withdrawalRequest.user = event.params.seller.toHexString();
    withdrawalRequest.sTokenAmount = ZERO_BIG_INT;
    withdrawalRequest.withdrawalCycleIndex = ZERO_BIG_INT;
  }
  withdrawalRequest.sTokenAmount = event.params.sTokenAmount;
  withdrawalRequest.withdrawalCycleIndex = event.params.withdrawalCycleIndex;
  withdrawalRequest.save();

  const sellerAddressId = event.params.seller.toHexString();
  let user = User.load(sellerAddressId);
  if (!user) {
    user = new User(sellerAddressId);
    user.id = sellerAddressId;
    user.sTokenAmount = ZERO_BIG_INT;
    user.protections = [];
    user.withdrawalRequests = [];
  }
  let withdrawalRequests = user.withdrawalRequests;
  withdrawalRequests.push(withdrawalRequest.id);
  user.withdrawalRequests = withdrawalRequests;
  user.save();
}

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

  let protectionPool = ProtectionPool.load(event.address.toHexString());
  if (!protectionPool) {
    protectionPool = new ProtectionPool(event.address.toHexString());
    protectionPool.id = event.address.toHexString();
  }
  const protectionPoolContract = ProtectionPoolContract.bind(event.address);
  const protectionPoolDetails = protectionPoolContract.getPoolDetails();
  protectionPool.totalSTokenUnderlying =
    protectionPoolDetails.get_totalSTokenUnderlying();
  protectionPool.leverageRatio =
    protectionPoolContract.calculateLeverageRatio();
  protectionPool.save();
}
