const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const mongoDbName = process.env.MONGODB_DB || 'disease_app';
let predictionsCollection = null;

const diseases = [
  {
    "name": "Vertigo / Dizziness",
    "category": "Easily Contracted",
    "description": "Dizziness and vertigo often occur with wind-related imbalance or circulatory disturbance.",
    "keywords": ["dizziness", "vertigo", "wind"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Tension Headache",
    "category": "Easily Contracted",
    "description": "Headache caused by stress, fatigue or muscle tension.",
    "keywords": ["headache", "fatigue", "stress"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Tinnitus",
    "category": "Easily Contracted",
    "description": "Ear ringing or buzzing frequently linked to circulation or nerve irritation.",
    "keywords": ["tinnitus", "ringing", "ear"],
    "ageRange": "adult",
    "gender": "all"
  },
  {
    "name": "Dry Mouth / Dry Tongue",
    "category": "Easily Contracted",
    "description": "Dry mouth and tongue indicate fluid imbalance or low saliva production.",
    "keywords": ["dry mouth", "dry tongue", "thirst"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Blurred Vision",
    "category": "Easily Contracted",
    "description": "Blurred vision may result from headache, eye strain or internal imbalance.",
    "keywords": ["blurred vision", "vision", "eye"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Neuralgic Toothache",
    "category": "Easily Contracted",
    "description": "Sharp tooth pain from nerve irritation or gingival sensitivity.",
    "keywords": ["toothache", "neuralgic toothache", "teeth"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Fatigue Syndrome",
    "category": "Easily Contracted",
    "description": "Constant yawning, fatigue and low energy due to body weakness.",
    "keywords": ["yawning", "fatigue", "tired"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Chest Tightness / Congestion",
    "category": "Easily Contracted",
    "description": "Chest tightness or congestion often occurs with respiratory or nervous strain.",
    "keywords": ["chest tightness", "congestion", "pressure"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Heart Palpitations",
    "category": "Easily Contracted",
    "description": "Palpitations may be linked to stress, anemia, or circulatory imbalance.",
    "keywords": ["palpitations", "heart palpitations", "palpitation"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Gastric Bloating",
    "category": "Easily Contracted",
    "description": "Abdominal bloating and pain often occur with digestive imbalance or gas.",
    "keywords": ["bloating", "abdominal bloating", "stomach pain"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Chronic Phlegm Disorder",
    "category": "Chronic",
    "description": "Persistent phlegm symptoms commonly linked to dampness or lung imbalance.",
    "keywords": ["phlegm", "mucus", "cough"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Chronic Bile Disorder (Jaundice)",
    "category": "Chronic",
    "description": "Jaundice and chronic bile issues indicate liver or gallbladder disharmony.",
    "keywords": ["jaundice", "bile", "yellow"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Chronic Kidney Disease",
    "category": "Chronic",
    "description": "Long-term kidney weakness with back pain, fatigue, or fluid imbalance.",
    "keywords": ["lower back stiffness", "fatigue", "urine"],
    "ageRange": "adult",
    "gender": "all"
  },
  {
    "name": "Chronic Lung Disease",
    "category": "Chronic",
    "description": "Lung weakness with cough, congestion, or breathing difficulty.",
    "keywords": ["dry cough", "chest tightness", "breathing"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Chronic Arthritis / Rheumatism",
    "category": "Chronic",
    "description": "Long-term joint pain and stiffness often caused by cold or damp invasion.",
    "keywords": ["joint pain", "back stiffness", "stiffness"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Dry Heaving / Retching",
    "category": "Easily Contracted",
    "description": "Episodes of dry retching often related to gastrointestinal upset or nervous causes.",
    "keywords": ["retching", "dry heaving", "nausea"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Stomach Rumbling (Borborygmi)",
    "category": "Easily Contracted",
    "description": "Audible bowel sounds associated with digestion, gas or mild GI disturbance.",
    "keywords": ["rumbling", "stomach rumbling", "borborygmi"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Talkativeness / Loquacity",
    "category": "Easily Contracted",
    "description": "Increased talkativeness or rapid speech sometimes seen with anxiety or neurological states.",
    "keywords": ["talkative", "loquacity", "talkativeness"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Wandering Joint Pain (Acute)",
    "category": "Easily Contracted",
    "description": "Intermittent joint pains that migrate between joints, often inflammatory or infectious.",
    "keywords": ["joint pain", "wandering", "migratory joint pain"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Lower Back Stiffness",
    "category": "Easily Contracted",
    "description": "Stiffness and discomfort in the lower back often from strain or chronic conditions.",
    "keywords": ["back stiffness", "lower back stiffness", "lumbar pain"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Chills / Shivering",
    "category": "Easily Contracted",
    "description": "Shivering or chills commonly accompany infection, fever, or cold exposure.",
    "keywords": ["chills", "shivering", "fever"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Insomnia",
    "category": "Easily Contracted",
    "description": "Difficulty initiating or maintaining sleep; may be acute or chronic and related to stress.",
    "keywords": ["insomnia", "sleep difficulty", "sleeplessness"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Anxiety and Panic",
    "category": "Easily Contracted",
    "description": "Episodes of intense anxiety, fear, and panic attacks often accompanied by palpitations and breathlessness.",
    "keywords": ["anxiety", "panic", "fear", "palpitations"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Chronic Infectious Fever",
    "category": "Chronic",
    "description": "Persistent or recurrent fever often due to chronic infection or inflammatory disease.",
    "keywords": ["fever", "chronic fever", "infection"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Lymphatic System Disorder",
    "category": "Chronic",
    "description": "Disorders affecting lymph nodes or lymphatic circulation, causing swelling or recurrent infections.",
    "keywords": ["lymph", "lymph nodes", "swelling", "lymphatic"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Chronic Ulcers / Non-healing Wounds",
    "category": "Chronic",
    "description": "Long-standing ulcers or wounds that fail to heal, often related to circulation or metabolic issues.",
    "keywords": ["ulcer", "chronic ulcer", "non-healing wound"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Tumor / Neoplasm",
    "category": "Chronic",
    "description": "Abnormal tissue growths (benign or malignant) that may cause localized symptoms depending on site.",
    "keywords": ["tumor", "neoplasm", "mass"],
    "ageRange": "adult",
    "gender": "all"
  },
  {
    "name": "Recurrent Chronic Illness",
    "category": "Chronic",
    "description": "Recurring long-term illnesses that flare periodically and may have systemic symptoms.",
    "keywords": ["recurrent", "chronic", "relapse"],
    "ageRange": "all",
    "gender": "all"
  },
  {
    "name": "Chronic Fatigue Syndrome",
    "category": "Chronic",
    "description": "Long-term, debilitating fatigue not relieved by rest and often associated with multiple other symptoms.",
    "keywords": ["chronic fatigue", "fatigue", "tired"],
    "ageRange": "all",
    "gender": "all"
  }
];

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Disease Predictor</title>
  <style>
    :root {
      --bg: #f2f7fb;
      --surface: #ffffff;
      --text: #1f2937;
      --muted: #6b7280;
      --accent: #2563eb;
      --accent-soft: #dbeafe;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Inter, system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
    }

    .container {
      max-width: 960px;
      margin: 0 auto;
      padding: 24px;
    }

    header {
      text-align: center;
      margin-bottom: 24px;
    }

    header h1 {
      margin: 0;
      font-size: 2.1rem;
    }

    header p {
      color: var(--muted);
    }

    main {
      display: grid;
      gap: 24px;
    }

    .field-row {
      display: grid;
      gap: 8px;
      margin-bottom: 16px;
    }

    .admin-link {
      display: inline-block;
      margin-top: 10px;
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;
    }

    .admin-link:hover {
      text-decoration: underline;
    }

    .field-row label {
      font-weight: 600;
    }

    input[type="number"], select {
      width: 120px;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 10px;
      font-size: 1rem;
    }

    .symptoms-section {
      background: var(--surface);
      border: 1px solid #e5e7eb;
      border-radius: 18px;
      padding: 18px;
    }

    .symptoms-section h2 {
      margin-top: 0;
    }

    .symptom-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 12px;
    }

    .symptom-grid label {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 12px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      cursor: pointer;
    }

    button[type="submit"] {
      width: 100%;
      padding: 14px 16px;
      border: none;
      border-radius: 14px;
      background: var(--accent);
      color: white;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
    }

    button[type="submit"]:hover {
      background: #1d4ed8;
    }

    .result-box {
      background: var(--surface);
      border: 1px solid #e5e7eb;
      border-radius: 18px;
      padding: 18px;
    }

    #result-content {
      color: var(--muted);
    }

    .prediction-item {
      margin-bottom: 18px;
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      background: #f8fbff;
    }

    .prediction-item h3 {
      margin: 0 0 8px;
    }

    .primary-prediction {
      border-color: #60a5fa;
      background: linear-gradient(90deg, #f0f9ff, #e6f2ff);
      box-shadow: 0 6px 18px rgba(37,99,235,0.08);
    }

    .prediction-item small {
      color: var(--muted);
    }

    .match-list {
      margin: 10px 0 0;
      padding-left: 18px;
    }

    .error {
      color: #b91c1c;
    }

    @media (max-width: 640px) {
      .container {
        padding: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Disease Diagnosis Helper</h1>
      <p>Select age, gender, and symptoms to get suggested conditions.</p>
      <p><a class="admin-link" href="/logs">View prediction logs</a></p>
    </header>

    <main>
      <form id="prediction-form">
        <div class="field-row">
          <label for="age">Age</label>
          <input type="number" id="age" name="age" min="1" max="120" value="30" required />
        </div>

        <div class="field-row">
          <label for="gender">Gender</label>
          <select id="gender" name="gender" required>
            <option value="all">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div class="field-row">
          <label for="maxResults">Number of results</label>
          <select id="maxResults" name="maxResults">
            <option value="3">3 results</option>
            <option value="4">4 results</option>
            <option value="5">5 results</option>
            <option value="6">6 results</option>
            <option value="7">7 results</option>
            <option value="8" selected>8 results</option>
          </select>
        </div>

        <section class="symptoms-section">
          <h2>Symptoms</h2>
          <div class="symptom-grid">
            <label><input type="checkbox" name="symptoms" value="dizziness" /> Dizziness / Vertigo</label>
            <label><input type="checkbox" name="symptoms" value="headache" /> Headache</label>
            <label><input type="checkbox" name="symptoms" value="tinnitus" /> Tinnitus</label>
            <label><input type="checkbox" name="symptoms" value="dry mouth" /> Dry mouth</label>
            <label><input type="checkbox" name="symptoms" value="dry tongue" /> Dry tongue</label>
            <label><input type="checkbox" name="symptoms" value="blurred vision" /> Blurred vision</label>
            <label><input type="checkbox" name="symptoms" value="toothache" /> Neuralgic toothache</label>
            <label><input type="checkbox" name="symptoms" value="yawning" /> Constant yawning / fatigue</label>
            <label><input type="checkbox" name="symptoms" value="fatigue" /> Chronic fatigue</label>
            <label><input type="checkbox" name="symptoms" value="chest tightness" /> Chest tightness / congestion</label>
            <label><input type="checkbox" name="symptoms" value="palpitations" /> Heart palpitations</label>
            <label><input type="checkbox" name="symptoms" value="retching" /> Dry heaving / retching</label>
            <label><input type="checkbox" name="symptoms" value="bloating" /> Abdominal bloating / pain</label>
            <label><input type="checkbox" name="symptoms" value="rumbling" /> Stomach rumbling</label>
            <label><input type="checkbox" name="symptoms" value="talkative" /> Talkativeness</label>
            <label><input type="checkbox" name="symptoms" value="joint pain" /> Wandering joint pain</label>
            <label><input type="checkbox" name="symptoms" value="back stiffness" /> Lower back stiffness</label>
            <label><input type="checkbox" name="symptoms" value="chills" /> Chills / shivering</label>
            <label><input type="checkbox" name="symptoms" value="insomnia" /> Insomnia</label>
            <label><input type="checkbox" name="symptoms" value="dry cough" /> Dry cough</label>
            <label><input type="checkbox" name="symptoms" value="anxiety" /> Anxiety / panic</label>
          </div>
        </section>

        <button type="submit">Predict Condition</button>
      </form>

      <section id="result" class="result-box">
        <h2>Prediction Result</h2>
        <div id="result-content">Enter your symptoms and click Predict.</div>
      </section>
    </main>
  </div>

  <script>
    const form = document.getElementById('prediction-form');
    const resultContent = document.getElementById('result-content');

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const formData = new FormData(form);
      const age = formData.get('age');
      const gender = formData.get('gender');
      const symptoms = formData.getAll('symptoms');
      const maxResults = formData.get('maxResults') || 3;

      resultContent.innerHTML = '<p>Loading prediction...</p>';

      try {
        const response = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ age, gender, symptoms, maxResults })
        });

        const data = await response.json();
        if (!response.ok) {
          const p = document.createElement('p');
          p.className = 'error';
          p.textContent = data.error || 'Prediction failed.';
          resultContent.innerHTML = '';
          resultContent.appendChild(p);
          return;
        }

        if (!data.predictions.length) {
          resultContent.innerHTML = '<p>No likely conditions found. Try adjusting symptoms or age.</p>';
          return;
        }

        const primaryName = data.primary ? data.primary.name : data.predictions[0].name;

        resultContent.innerHTML = data.predictions.map((prediction, idx) => `
          <div class="prediction-item ${prediction.name === primaryName ? 'primary-prediction' : ''}">
            <h3>${prediction.name} ${prediction.name === primaryName ? '<small>(Most likely)</small>' : ''}</h3>
            <p><strong>Category:</strong> ${prediction.category}</p>
            <p>${prediction.description}</p>
            <p><strong>Matched symptoms:</strong> ${prediction.matchedSymptoms.join(', ')}</p>
            <p><strong>Probability:</strong> ${(prediction.probability * 100).toFixed(1)}%</p>
            <p><strong>First aid / Advice:</strong> ${prediction.advice}</p>
          </div>
        `).join('');
      } catch (error) {
        resultContent.innerHTML = '<p class="error">Network error occurred.</p>';
      }
    });
  </script>
</body>
</html>`;

const logsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Prediction Logs</title>
  <style>
    :root {
      --bg: #f2f7fb;
      --surface: #ffffff;
      --text: #1f2937;
      --muted: #6b7280;
      --accent: #2563eb;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Inter, system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
    }

    .container {
      max-width: 960px;
      margin: 0 auto;
      padding: 24px;
    }

    header {
      text-align: center;
      margin-bottom: 24px;
    }

    header h1 {
      margin: 0;
      font-size: 2.1rem;
    }

    header p {
      color: var(--muted);
    }

    .admin-link {
      display: inline-block;
      margin-top: 10px;
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;
    }

    .admin-link:hover {
      text-decoration: underline;
    }

    .prediction-item {
      margin-bottom: 18px;
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      background: #f8fbff;
    }

    .prediction-item h3 {
      margin: 0 0 8px;
    }

    .error {
      color: #b91c1c;
    }

    details {
      margin-top: 10px;
    }

    @media (max-width: 640px) {
      .container {
        padding: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Prediction Logs</h1>
      <p>Recent prediction history stored in MongoDB.</p>
      <p><a class="admin-link" href="/">Back to diagnosis</a></p>
    </header>

    <main>
      <div id="logs-container">
        <p>Loading logs...</p>
      </div>
    </main>
  </div>

  <script>
    async function loadLogs() {
      const container = document.getElementById('logs-container');
      try {
        const response = await fetch('/api/logs');
        const data = await response.json();

        if (!response.ok) {
          container.innerHTML = `<p class="error">${data.error || 'Failed to load logs.'}</p>`;
          return;
        }

        if (!data.logs.length) {
          container.innerHTML = '<p>No logs available yet.</p>';
          return;
        }

        container.innerHTML = data.logs.map(log => `
          <div class="prediction-item">
            <h3>${new Date(log.created_at).toLocaleString()}</h3>
            <p><strong>Age:</strong> ${log.age} | <strong>Gender:</strong> ${log.gender}</p>
            <p><strong>Symptoms:</strong> ${log.symptoms.join(', ')}</p>
            <p><strong>Top prediction:</strong> ${log.top_prediction}</p>
            <details>
              <summary>View predictions</summary>
              <ul>
                ${log.predictions.map(pred => `
                  <li><strong>${pred.name}</strong> (${(pred.probability*100).toFixed(1)}%) - ${pred.category}</li>
                `).join('')}
              </ul>
            </details>
          </div>
        `).join('');
      } catch (error) {
        container.innerHTML = '<p class="error">Network error loading logs.</p>';
      }
    }

    loadLogs();
  </script>
</body>
</html>`;

app.use(express.json());

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function scoreDisease(disease, selectedSymptoms, age, gender) {
  const symptomMatches = disease.keywords.filter(keyword => selectedSymptoms.includes(keyword));
  const matchCount = symptomMatches.length;
  const kwCount = Math.max(1, (Array.isArray(disease.keywords) ? disease.keywords.length : 1));
  let score = matchCount + (matchCount / kwCount);

  if (disease.ageRange && disease.ageRange !== 'all') {
    const ar = String(disease.ageRange).toLowerCase();
    if (ar === 'adult') {
      if (age < 18) score -= 0.5; else score += 0.3;
    } else if (ar === 'senior') {
      if (age < 45) score -= 0.5; else score += 0.3;
    } else if (ar === 'child') {
      if (age >= 18) score -= 0.5; else score += 0.3;
    }
  }

  if (disease.gender && disease.gender !== 'all') {
    if (String(disease.gender).toLowerCase() === String(gender).toLowerCase()) {
      score += 0.3;
    } else {
      score -= 0.3;
    }
  }

  return { ...disease, score, matchedSymptoms: symptomMatches };
}

function getAdvice(disease) {
  if (disease.advice) return disease.advice;
  const kws = (disease.keywords || []).map(k => String(k).toLowerCase());

  if (kws.includes('chest tightness') || kws.includes('palpitations') || kws.includes('palpitation') || kws.includes('heart palpitations')) {
    return 'If you have chest pain, severe shortness of breath, or fainting, seek emergency care immediately.';
  }
  if (kws.includes('fever') || kws.includes('chronic fever')) {
    return 'If fever is high (>38°C) or persistent, see a healthcare provider; stay hydrated and rest.';
  }
  if (kws.includes('dry cough') || kws.includes('cough') || kws.includes('phlegm') || kws.includes('breathing')) {
    return 'For cough or breathing difficulty, rest, keep hydrated; seek medical advice if persistent or severe.';
  }
  if (kws.includes('bloating') || kws.includes('stomach pain') || kws.includes('nausea') || kws.includes('retching')) {
    return 'Rest, avoid solid food for a few hours, sip clear fluids; seek care if severe pain, vomiting, or blood in stools.';
  }
  if (kws.includes('joint pain') || kws.includes('back stiffness') || kws.includes('stiffness')) {
    return 'Rest the affected area, apply heat or cold as appropriate; see a clinician if pain is severe or lasts more than a few days.';
  }
  if (kws.includes('dizziness') || kws.includes('vertigo') || kws.includes('tinnitus')) {
    return 'Sit or lie down when dizzy; avoid driving or climbing; seek medical advice if persistent or worsening.';
  }

  return 'If symptoms are severe, worsening, or you are concerned, seek medical attention. Rest and stay hydrated.';
}

app.post('/api/predict', (req, res) => {
  const { age, gender, symptoms } = req.body;
  let { maxResults } = req.body;
  const ageNumber = Number(age);
  const selectedSymptoms = Array.isArray(symptoms)
    ? symptoms.map(normalizeText)
    : [];
  const normalizedGender = normalizeText(gender || 'all');

  if (!selectedSymptoms.length) {
    return res.status(400).json({ error: 'Please select at least one symptom.' });
  }

  maxResults = Number(maxResults) || 3;
  if (maxResults < 3) maxResults = 3;
  if (maxResults > 8) maxResults = 8;

  const scored = diseases
    .map(disease => scoreDisease(disease, selectedSymptoms, ageNumber, normalizedGender))
    .map(item => ({ ...item, score: Math.max(0, item.score) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  if (!scored.length) {
    return res.json({ predictions: [] });
  }

  const total = scored.reduce((s, it) => s + it.score, 0) || 1;
  const top = scored.slice(0, maxResults).map(item => ({
    name: item.name,
    category: item.category,
    description: item.description,
    matchedSymptoms: item.matchedSymptoms,
    score: item.score,
    probability: +(item.score / total).toFixed(3),
    advice: item.advice || getAdvice(item)
  }));

  const topPrediction = top[0].name;
  const logItem = {
    created_at: new Date(),
    age: ageNumber,
    gender: normalizedGender,
    symptoms: selectedSymptoms,
    top_prediction: topPrediction,
    predictions: top
  };

  if (predictionsCollection) {
    predictionsCollection.insertOne(logItem).catch(err => {
      console.error('MongoDB insert error:', err);
    });
  }

  res.json({ predictions: top, primary: top[0] });
});

app.get('/api/logs', async (req, res) => {
  if (!predictionsCollection) {
    return res.status(500).json({ error: 'MongoDB not connected.' });
  }

  try {
    const rows = await predictionsCollection.find({}).sort({ created_at: -1 }).limit(20).toArray();
    res.json({ logs: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs.' });
  }
});

app.get('/logs', (req, res) => {
  res.type('html').send(logsHtml);
});

app.get('*', (req, res) => {
  res.type('html').send(indexHtml);
});

async function initDatabase() {
  try {
    const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
    await client.connect();
    const db = client.db(mongoDbName);
    predictionsCollection = db.collection('prediction_logs');
    await predictionsCollection.createIndex({ created_at: -1 });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    predictionsCollection = null;
  }
}

async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
