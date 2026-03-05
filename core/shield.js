const admin = require('firebase-admin');

let _ready = false;

function boot() {
  if (_ready) return;
  try {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    _ready = true;
  } catch (e) {
    if (e.code !== 'app/duplicate-app') throw e;
    _ready = true;
  }
}

async function wall(req, res, next) {
  let hdr = req.headers.authorization;
  if (!hdr || !hdr.startsWith('Bearer ')) {
    return res.status(401).json({ err: 'no_token' });
  }
  let tkn = hdr.slice(7);
  try {
    boot();
    let decoded = await admin.auth().verifyIdToken(tkn);
    req.fbUser = decoded;
    next();
  } catch (ex) {
    return res.status(401).json({ err: 'bad_token' });
  }
}

module.exports = { wall, boot };
