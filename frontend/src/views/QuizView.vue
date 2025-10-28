<template>
  <main class="quiz">
    <!-- Topbar -->
    <nav class="topbar">
      <button class="back" @click="goBack" aria-label="Go back">Back</button>
    </nav>

    <!-- Header -->
    <header class="head">
      <h1>Wine Knowledge Quiz</h1>

      <!-- Progress -->
      <div class="qprogress-wrap" title="Question progress">
        <div class="qprogress" :style="{ width: questionProgress + '%' }"></div>
      </div>

      <!-- Progress) -->
      <div class="progress-wrap" title="Score progress">
        <div class="progress" :style="{ width: progress + '%' }"></div>
      </div>

      <p class="score">
        Score: <strong>{{ correct }}</strong> / {{ questions.length }} ({{ percent }}%)
      </p>
      <p class="meta">Question {{ index + 1 }} of {{ questions.length }}</p>
    </header>

    <!-- Questions) -->
    <section v-if="!finished" class="card compact">
      <h2 class="question">{{ current.q }}</h2>

      <div class="options">
        <button
            v-for="(opt, i) in current.options"
            :key="i"
            class="opt"
            :disabled="answered"
            :class="{
            chosen: answered && i === chosen,
            correct: answered && i === current.answerIndex,
            wrong: answered && i === chosen && chosen !== current.answerIndex
          }"
            @click="choose(i)"
        >
          {{ opt }}
        </button>
      </div>

      <p
          v-if="answered"
          class="feedback"
          :class="{ ok: chosen === current.answerIndex, nope: chosen !== current.answerIndex }"
      >

      </p>
    </section>

    <!-- Results -->
    <section v-else class="card result compact">
      <h2>Quiz completed</h2>
      <p class="summary">
        You scored <strong>{{ correct }}</strong> / {{ questions.length }} ({{ percent }}%).
      </p>
      <div class="actions">
        <button class="ghost" @click="restart">Try Again</button>
        <button class="reset" @click="resetAll">Reset Score</button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
function goBack() {
  if (history.length > 1) router.back()
  else router.push('/')
}

// questions
const questions = ref([
  { q: 'Which country is Barolo from?', options: ['France', 'Italy', 'Spain', 'USA'], answerIndex: 1 },
  { q: 'Rioja is a wine region in…', options: ['Spain', 'Argentina', 'Portugal', 'Greece'], answerIndex: 0 },
  { q: 'Bordeaux belongs to which country?', options: ['France', 'Italy', 'Germany', 'USA'], answerIndex: 0 },
  { q: 'Chianti comes from the region of…', options: ['Rioja', 'Tuscany', 'Douro', 'Pfalz'], answerIndex: 1 },
  { q: 'Marlborough is famous in…', options: ['Australia', 'South Africa', 'New Zealand', 'Chile'], answerIndex: 2 },
  { q: 'Napa Valley is located in…', options: ['USA', 'France', 'Argentina', 'Spain'], answerIndex: 0 },
  { q: 'Douro is a historic wine region in…', options: ['Portugal', 'Italy', 'Greece', 'Hungary'], answerIndex: 0 },
  { q: 'Barossa Valley is a renowned wine region in…', options: ['USA', 'Australia', 'Chile', 'South Africa'], answerIndex: 1 },
  { q: 'Mosel is best known for Riesling wines from…', options: ['Germany', 'Austria', 'France', 'Switzerland'], answerIndex: 0 },
  { q: 'Cava is a sparkling wine traditionally from…', options: ['Spain', 'Italy', 'France', 'Argentina'], answerIndex: 0 },
  { q: 'Piedmont (Piemonte) is a key wine region in…', options: ['Italy', 'Spain', 'France', 'Croatia'], answerIndex: 0 },
  { q: 'Stellenbosch is a major wine region in…', options: ['Australia', 'South Africa', 'USA', 'Chile'], answerIndex: 1 },
  { q: 'Chablis is made primarily from which grape?', options: ['Riesling', 'Chardonnay', 'Sauvignon Blanc', 'Semillon'], answerIndex: 1 },
  { q: 'Sancerre is best known for which grape?', options: ['Sauvignon Blanc', 'Pinot Noir', 'Chardonnay', 'Chenin Blanc'], answerIndex: 0 },
  { q: 'Tempranillo is most associated with…', options: ['Spain', 'Italy', 'France', 'Argentina'], answerIndex: 0 },
  { q: 'Malbec is strongly associated with…', options: ['Chile', 'Argentina', 'USA', 'South Africa'], answerIndex: 1 },
  { q: 'Brunello di Montalcino uses which grape?', options: ['Nebbiolo', 'Sangiovese', 'Barbera', 'Montepulciano'], answerIndex: 1 },
  { q: 'Beaujolais is primarily made from…', options: ['Pinot Noir', 'Gamay', 'Merlot', 'Syrah'], answerIndex: 1 },
  { q: 'Pouilly-Fumé is a Loire wine made from…', options: ['Chenin Blanc', 'Sauvignon Blanc', 'Chardonnay', 'Viognier'], answerIndex: 1 },
  { q: 'Amarone della Valpolicella is produced in…', options: ['Tuscany', 'Veneto', 'Sicily', 'Piedmont'], answerIndex: 1 },
  { q: 'Priorat is a prestigious region in…', options: ['Portugal', 'Spain', 'Italy', 'Greece'], answerIndex: 1 },
  { q: 'Barolo and Barbaresco are made from…', options: ['Sangiovese', 'Nebbiolo', 'Barbera', 'Dolcetto'], answerIndex: 1 },
  { q: 'Châteauneuf-du-Pape is in…', options: ['Bordeaux', 'Rhône Valley', 'Loire', 'Languedoc'], answerIndex: 1 },
  { q: 'Vinho Verde comes from…', options: ['Spain', 'Italy', 'Portugal', 'France'], answerIndex: 2 },
  { q: 'Champagne must come from…', options: ['Any sparkling region', 'France (any)', 'Champagne, France', 'Prosecco area'], answerIndex: 2 },
  { q: 'Prosecco is primarily made from…', options: ['Glera', 'Trebbiano', 'Verdicchio', 'Pinot Grigio'], answerIndex: 0 },
  { q: 'Crianza/Reserva/Gran Reserva terms are from…', options: ['Italy', 'France', 'Spain', 'Portugal'], answerIndex: 2 },
  { q: 'Which grape dominates Rioja blends?', options: ['Garnacha', 'Tempranillo', 'Mazuelo', 'Graciano'], answerIndex: 1 },
  { q: 'Which region is famous for Sauvignon Blanc in NZ?', options: ['Hawke’s Bay', 'Central Otago', 'Marlborough', 'Wairarapa'], answerIndex: 2 },
  { q: 'Tokaji Aszú wines come from…', options: ['Romania', 'Hungary', 'Austria', 'Slovakia'], answerIndex: 1 }
])

// state
const index = ref(0)
const chosen = ref(-1)
const answered = ref(false)
const correct = ref(0)
const finished = ref(false)
const best = ref(null)

// derived
const current = computed(() => questions.value[index.value])

// Progress (grey)
const questionProgress = computed(() => {
  const done = index.value + (answered.value || finished.value ? 1 : 0)
  return Math.round((done / questions.value.length) * 100)
})

// Progress (red)
const progress = computed(() => Math.round((correct.value / questions.value.length) * 100))
const percent = computed(() => Math.round((correct.value / questions.value.length) * 100))

onMounted(() => {
  const saved = localStorage.getItem('wineQuizBestCorrect')
  best.value = saved ? Number(saved) : null
})

function choose(i) {
  if (answered.value) return
  chosen.value = i
  answered.value = true
  if (i === current.value.answerIndex) correct.value++

  // Auto-next
  setTimeout(() => {
    if (index.value < questions.value.length - 1) {
      index.value++
      chosen.value = -1
      answered.value = false
    } else {
      finish()
    }
  }, 1200)
}

function finish() {
  finished.value = true
  if (best.value == null || correct.value > best.value) {
    best.value = correct.value
    localStorage.setItem('wineQuizBestCorrect', String(best.value))
  }
}

function restart() {
  index.value = 0
  chosen.value = -1
  answered.value = false
  correct.value = 0
  finished.value = false
}

function resetAll() {
  localStorage.removeItem('wineQuizBestCorrect')
  restart()
  best.value = null
}
</script>

<style scoped>
.quiz {
  min-height: 100vh;
  padding: 16px;
  display: grid;
  gap: 16px;
  justify-items: center;
  background: #fff;
  color: #111;
  font-synthesis-weight: none;
}

/* Topbar */
.topbar {
  width: min(840px, 94%);
  display: flex;
  justify-content: flex-start;
}
.back {
  appearance: none;
  border: none;           /* ingen ruta */
  background: transparent;
  color: #111;
  font-weight: 700;
  padding: 6px 0;
  cursor: pointer;
}
.back:hover { text-decoration: underline; }

/* Header */
.head {
  width: min(640px, 92%);
  text-align: center;
}
h1 {
  margin: 0;
  font-size: clamp(22px, 4vw, 28px);
  font-weight: 800;
  letter-spacing: -0.01em;
}

/* Question progress (grey) */
.qprogress-wrap {
  height: 12px;
  border-radius: 999px;
  background: #efefef;
  overflow: hidden;
  margin: 10px auto 6px;
}
.qprogress {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #cfcfcf, #9f9f9f);
  border-radius: 999px;
  transition: width 0.35s ease;
}

/* Score progress (red) */
.progress-wrap {
  height: 12px;
  border-radius: 999px;
  background: #eee;
  overflow: hidden;
  margin: 8px auto 8px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
}
.progress {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #7b1113, #a8181c);
  border-radius: 999px;
  transition: width 0.4s ease;
}

.score, .meta {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* Question card */
.card.compact {
  width: min(640px, 92%);
  display: block;
  height: auto !important;
  min-height: 0 !important;
  padding: 16px;
  border: 1px solid #e9e9e9;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

/* Options */
.options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 0;
}

.card.compact::after,
.card.compact::before {
  content: none !important;
}
@media (max-width: 520px) { .options { grid-template-columns: 1fr; } }

.opt {
  text-align: left;
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  font-weight: 6000;
  transition: transform .08s ease, background .15s ease, border-color .15s ease, box-shadow .15s ease;
  will-change: transform;
}
.opt:hover:not(:disabled) {
  background: #f9f9f9;
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0,0,0,0.06);
}
.opt:active:not(:disabled) { transform: translateY(0); }
.opt:disabled { opacity: 0.95; cursor: default; }
.opt.chosen { border-color: #bbb; }
.opt.correct { border-color: #1a7f37; background: #e9f6ed; }
.opt.wrong { border-color: #b00020; background: #fde8eb; }

/* Feedback */
.feedback { margin: 8px 0 0; font-weight: 600; }
.feedback.ok { color: #1a7f37; }
.feedback.nope { color: #b00020; }

/* Result */
.result { text-align: center; }
.summary { font-size: 18px; margin: 8px 0; }
.actions { display: flex; justify-content: center; gap: 12px; margin-top: 12px; }
.ghost, .reset {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
}
.ghost {
  background: #fff;
  border: 1px solid #e9e9e9;
  color: #111;
}
.ghost:hover { background: #f8f8f8; }
.reset {
  background: #fff;
  color: #7b1113;
  border: 1px solid #7b1113;
}
.reset:hover { background: #fff3f3; }
</style>
