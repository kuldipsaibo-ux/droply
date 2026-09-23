function checkPrice(alert, currentPrice) {
  const targetPrice = Number(alert.targetPrice);

  if (currentPrice <= targetPrice) {
    return {
      triggered: true,
      message: `🔥 Price dropped to ₹${currentPrice}! Target: ₹${targetPrice}`
    };
  }

  return {
    triggered: false,
    message: `Still watching. Current: ₹${currentPrice} | Target: ₹${targetPrice}`
  };
}

// TEST ALERT
const alert = {
  targetPrice: 2200
};

// Fake current price for testing
const currentPrice = 1999;

const result = checkPrice(alert, currentPrice);

console.log(result.message);