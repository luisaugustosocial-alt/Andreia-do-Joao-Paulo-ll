import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDMGGQjhuG3LEfsBek9LT_1k_69RksWn-A",
  authDomain: "site-andreia-jp2.firebaseapp.com",
  projectId: "site-andreia-jp2",
  storageBucket: "site-andreia-jp2.firebasestorage.app",
  messagingSenderId: "178960697179",
  appId: "1:178960697179:web:63c425e669f66f7b22fc7e"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
