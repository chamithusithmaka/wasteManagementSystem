/**
 * Calculates checkout details based on bills, rewards, and wallet
 */
export const calculateCheckout = (
  selectedBills,
  rewards,
  wallet,
  applyRewards,
  useWalletFirst
) => {
  // Calculate subtotal from all bills
  const subtotal = selectedBills.reduce((sum, bill) => sum + bill.amount, 0);
  
  // Calculate total rewards available
  const totalRewardsAvailable = rewards.reduce((sum, reward) => sum + reward.amount, 0);
  
  // Calculate rewards to apply (up to the bill total)
  const rewardsApplied = applyRewards ? Math.min(totalRewardsAvailable, subtotal) : 0;
  
  // Previous dues (in a real app, this would come from the backend)
  const previousDues = 0;
  
  // Tax (in a real app, this would be calculated based on policy)
  const tax = 0;
  
  // Calculate net payable
  const netPayable = subtotal - rewardsApplied + previousDues + tax;
  
  // Calculate wallet usage
  let walletUse = 0;
  let externalPay = netPayable;
  let walletCreditOverflow = undefined;
  
  if (rewardsApplied > subtotal) {
    // If rewards exceed bill amount, calculate overflow to wallet
    walletCreditOverflow = rewardsApplied - subtotal;
  }
  
  if (useWalletFirst) {
    // Use wallet funds first
    walletUse = Math.min(wallet.balance, netPayable);
    externalPay = netPayable - walletUse;
  }
  
  return {
    subtotal,
    rewardsApplied,
    previousDues,
    tax,
    netPayable,
    walletUse,
    externalPay,
    walletCreditOverflow
  };
};