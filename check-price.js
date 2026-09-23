const admin = require("firebase-admin");

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkAlerts() {
  const snapshot = await db.collection("priceAlerts").get();

  console.log(`Found ${snapshot.size} price alert(s).`);

  snapshot.forEach((doc) => {
    const alert = doc.data();

    console.log("Alert ID:", doc.id);
    console.log("Product URL:", alert.productUrl);
    console.log("Target price:", alert.targetPrice);
    console.log("Status:", alert.status);
    console.log("----------------------");
  });
}

checkAlerts().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});