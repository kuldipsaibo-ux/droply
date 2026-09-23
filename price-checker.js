import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAuQvRtusTqOmb_tA0xQm12VJPQQYnvzfA",
  authDomain: "droply-fa6f6.firebaseapp.com",
  projectId: "droply-fa6f6",
  storageBucket: "droply-fa6f6.firebasestorage.app",
  messagingSenderId: "993632750410",
  appId: "1:993632750410:web:373d3d6399ad705d874fb3",
  measurementId: "G-MQ7JRR824Q"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// Check whether a price has reached the user's target
function checkPrice(alert, currentPrice) {

  const targetPrice = Number(alert.targetPrice);

  if (currentPrice <= targetPrice) {
    return {
      triggered: true,
      message: `🔥 PRICE DROP! ₹${currentPrice} is below your target of ₹${targetPrice}`
    };
  }

  return {
    triggered: false,
    message: `Watching — current ₹${currentPrice}, target ₹${targetPrice}`
  };
}


// Load all saved alerts
async function checkAllAlerts() {

  const snapshot = await getDocs(
    collection(db, "priceAlerts")
  );

  if (snapshot.empty) {
    console.log("No price alerts found.");
    return;
  }

  snapshot.forEach((doc) => {

    const alert = doc.data();

    // TEMPORARY fake price.
    // This does NOT use FetchLayer.
    const fakeCurrentPrice = 1999;

    const result = checkPrice(
      alert,
      fakeCurrentPrice
    );

    console.log("--------------------------------");
    console.log("Product:", alert.productUrl);
    console.log(result.message);

    if (result.triggered) {
      console.log("🔔 Notification should be sent here.");
    }

  });
}


// Start checker
checkAllAlerts();