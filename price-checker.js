// Droply Test Price Checker
// This version uses fake prices.
// It does NOT use your FetchLayer points.

function checkPrice(currentPrice, targetPrice) {
  if (currentPrice <= targetPrice) {
    return {
      triggered: true,
      message: `🔥 Price dropped to ₹${currentPrice}! Your target was ₹${targetPrice}.`
    };
  }

  return {
    triggered: false,
    message: `Price is ₹${currentPrice}. Target is ₹${targetPrice}.`
  };
}

// TEST
const result = checkPrice(1999, 2200);

console.log(result.message);