const admin = require("firebase-admin");

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function getAmazonPrice(productUrl) {
  const apiKey = process.env.FETCHLAYER_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("FETCHLAYER_API_KEY is missing.");
  }

  const response = await fetch(
    "https://api.fetchlayer.dev/amazon/price-check",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        asins: [productUrl],
        marketplace: "in"
      })
    }
  );

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `FetchLayer error: ${response.status} - ${responseText}`
    );
  }

  const data = JSON.parse(responseText);
  const item = data.items?.[0];

  if (!item || item.status !== "ok" || !item.price) {
    throw new Error("Could not get a current price.");
  }

  return {
    price: item.price.amount,
    title: item.title || "Amazon product",
    url: item.url || productUrl
  };
}

async function sendEmail(to, product, currentPrice, targetPrice) {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Droply <onboarding@resend.dev>",
      to: [to],
      subject: "🚨 Droply: Price dropped!",
      html: `
        <h2>🚨 Price Drop!</h2>
        <p><strong>${product.title}</strong></p>
        <p>Current price: <strong>₹${currentPrice}</strong></p>
        <p>Your target: <strong>₹${targetPrice}</strong></p>
        <p><a href="${product.url}">View product</a></p>
      `
    })
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Resend error: ${response.status} - ${responseText}`
    );
  }

  console.log("📧 Email sent successfully.");
}

async function checkAlerts() {
  const snapshot = await db
    .collection("priceAlerts")
    .where("status", "==", "watching")
    .get();

  console.log(`Found ${snapshot.size} active alert(s).`);

  for (const doc of snapshot.docs) {
    const alert = doc.data();

    console.log("----------------------");
    console.log("Alert ID:", doc.id);
    console.log("Product URL:", alert.productUrl);
    console.log("Target price:", alert.targetPrice);

    try {
      const product = await getAmazonPrice(alert.productUrl);

      console.log("Product:", product.title);
      console.log("Current price:", product.price);

      if (product.price <= Number(alert.targetPrice)) {
        console.log("🚨 PRICE DROP!");

        if (alert.email) {
          await sendEmail(
            alert.email,
            product,
            product.price,
            alert.targetPrice
          );
        } else {
          console.log("⚠️ No email address saved for this alert.");
        }
      } else {
        console.log("🟡 No price drop yet.");
      }
    } catch (error) {
      console.error("Price check failed:", error.message);
    }
  }
}

checkAlerts().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});