const admin = require("firebase-admin");

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function getAmazonPrice(productUrl) {
  const response = await fetch(
    "https://api.fetchlayer.dev/amazon/price-check",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.FETCHLAYER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        asins: [productUrl],
        marketplace: "in",
        postalCode: "173212"
      })
    }
  );

  if (!response.ok) {
    throw new Error(`FetchLayer error: ${response.status}`);
  }

  const data = await response.json();

  const item = data.items?.[0];

  if (!item || item.status !== "ok" || !item.price) {
    throw new Error("Could not get a current price.");
  }

  return item.price.amount;
}

async function checkAlerts() {
  const snapshot = await db
    .collection("priceAlerts")
    .where("status", "==", "watching")
    .get();

  console.log(`Found ${snapshot.size} active alert(s).`);

  for (const doc of snapshot.docs) {
    const alert = doc.data();

    console.log("Checking:", alert.productUrl);

    try {
      const currentPrice = await getAmazonPrice(alert.productUrl);

      console.log("Target:", alert.targetPrice);
      console.log("Current:", currentPrice);

      if (currentPrice <= Number(alert.targetPrice)) {
        console.log("🚨 PRICE DROP!");
      } else {
        console.log("🟡 No price drop yet.");
      }
    } catch (error) {
      console.error("Price check failed:", error.message);
    }
  }
}

checkAlerts().catch((error) => {
  console.error(error);
  process.exit(1);
});