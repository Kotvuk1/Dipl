import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'

let cfg = {
  apiKey: 'AIzaSyDSSYb-UFRs4L08QBseIVaa90psDK-vg8w',
  authDomain: 'kotvukai.firebaseapp.com',
  projectId: 'kotvukai',
  storageBucket: 'kotvukai.firebasestorage.app',
  messagingSenderId: '484790089032',
  appId: '1:484790089032:web:3dc1b77fc99c69cb476f7d',
}

let fbApp = initializeApp(cfg)
let auth = getAuth(fbApp)
let googleProv = new GoogleAuthProvider()

async function enterWithGoogle() {
  let result = await signInWithPopup(auth, googleProv)
  return result.user
}

function leave() {
  return signOut(auth)
}

function watchAuth(cb) {
  return onAuthStateChanged(auth, cb)
}

async function bearerToken() {
  let u = auth.currentUser
  if (!u) return null
  return u.getIdToken()
}

export { auth, enterWithGoogle, leave, watchAuth, bearerToken }
