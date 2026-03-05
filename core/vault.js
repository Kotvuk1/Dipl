const Groq = require('groq-sdk');

let _pool = [];
let _cursor = 0;
let _blocked = new Map();

for (let k = 1; k <= 15; k++) {
  let val = process.env[`GROQ_KEY_${k}`];
  if (val) _pool.push(val);
}

function _pick() {
  let now = Date.now();
  let tried = 0;
  while (tried < _pool.length) {
    let idx = _cursor % _pool.length;
    _cursor++;
    let stamp = _blocked.get(idx);
    if (stamp && now - stamp < 60000) {
      tried++;
      continue;
    }
    _blocked.delete(idx);
    return { idx, key: _pool[idx] };
  }
  _blocked.clear();
  let idx = _cursor % _pool.length;
  _cursor++;
  return { idx, key: _pool[idx] };
}

async function runPrompt(txt, retries) {
  retries = retries || 3;
  let lastErr;
  for (let r = 0; r < retries; r++) {
    let chosen = _pick();
    let client = new Groq({ apiKey: chosen.key });
    try {
      let resp = await client.chat.completions.create({
        model: 'moonshotai/kimi-k2-instruct',
        messages: [{ role: 'user', content: txt }],
        temperature: 0.3,
        max_tokens: 2048,
      });
      let raw = resp.choices[0].message.content;
      return raw;
    } catch (ex) {
      lastErr = ex;
      if (ex.status === 429 || (ex.error && ex.error.code === 'rate_limit_exceeded')) {
        _blocked.set(chosen.idx, Date.now());
        continue;
      }
      throw ex;
    }
  }
  throw lastErr;
}

module.exports = { runPrompt };
