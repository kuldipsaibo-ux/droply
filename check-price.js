const targetPrice = 16300;

// Fake current price for testing
const currentPrice = 15999;

console.log("Target price:", targetPrice);
console.log("Current price:", currentPrice);

if (currentPrice <= targetPrice) {
  console.log("🚨 PRICE DROP!");
  console.log(`Price dropped to ₹${currentPrice}`);
} else {
  console.log("🟡 No price drop yet.");
}