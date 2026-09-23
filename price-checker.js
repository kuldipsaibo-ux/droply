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

async function loadAlerts() {
  const snapshot = await getDocs(collection(db, "priceAlerts"));

  snapshot.forEach((doc) => {
    const alert = doc.data();

    console.log("Watching:", alert.productUrl);
    console.log("Target price:", alert.targetPrice);
  });
}

loadAlerts();