// ═══════════════════════════════════════════════════════════
//  RPS.js  —  Rock Paper Scissors Game Logic
// ═══════════════════════════════════════════════════════════

// ── Constants ────────────────────────────────────────────
const CHOICES  = ['rock', 'paper', 'scissors'];
const EMOJIS   = { rock: '✊', paper: '🖐️', scissors: '✌️' };
const BEATS    = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
const DETAILS  = {
  'rock-scissors':    'Rock crushes Scissors!',
  'scissors-paper':   'Scissors cuts Paper!',
  'paper-rock':       'Paper covers Rock!',
};
const TIMER_MAX = 10;

// ── State ─────────────────────────────────────────────────
let scores       = { player: 0, cpu: 0, draws: 0 };
let streak       = 0;
let timerInterval = null;
let timeLeft     = TIMER_MAX;
let roundActive  = true;

// ── DOM References ─────────────────────────────────────────
const playerScoreEl = document.getElementById('playerScore');
const cpuScoreEl    = document.getElementById('cpuScore');
const drawScoreEl   = document.getElementById('drawScore');
const playerHandEl  = document.getElementById('playerHand');
const cpuHandEl     = document.getElementById('cpuHand');
const resultTextEl  = document.getElementById('resultText');
const resultDetailEl= document.getElementById('resultDetail');
const streakBadgeEl = document.getElementById('streakBadge');
const timerFillEl   = document.getElementById('timerFill');
const timerNumEl    = document.getElementById('timerNum');
const statusTextEl  = document.getElementById('statusText');

// ── Timer ──────────────────────────────────────────────────
function startTimer() {
  clearInterval(timerInterval);
  timeLeft = TIMER_MAX;
  updateTimerUI();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      // Auto-pick a random choice when time runs out
      play(CHOICES[Math.floor(Math.random() * 3)], true);
    }
  }, 1000);
}

function updateTimerUI() {
  const pct    = (timeLeft / TIMER_MAX) * 100;
  const urgent = timeLeft <= 3;

  timerFillEl.style.width = pct + '%';
  timerNumEl.textContent  = timeLeft;

  timerFillEl.classList.toggle('urgent', urgent);
  timerNumEl.classList.toggle('urgent', urgent);
}

// ── Helpers ────────────────────────────────────────────────
function setButtonsDisabled(disabled) {
  CHOICES.forEach(c => {
    document.getElementById('btn-' + c).disabled = disabled;
  });
}

function getComputerChoice() {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)];
}

function determineWinner(player, computer) {
  if (player === computer)       return 'draw';
  if (BEATS[player] === computer) return 'player';
  return 'computer';
}

// ── Score Update ───────────────────────────────────────────
function updateScores() {
  const map = {
    player:   playerScoreEl,
    cpu:      cpuScoreEl,
    draws:    drawScoreEl,
  };

  for (const [key, el] of Object.entries(map)) {
    el.textContent = scores[key];
    el.classList.remove('bump');
    void el.offsetWidth;          // force reflow to restart animation
    el.classList.add('bump');
  }
}

// ── Confetti ───────────────────────────────────────────────
function spawnConfetti() {
  const colors = ['#ff3c5f', '#ffcc00', '#00e5ff', '#00e5b0', '#ffffff'];
  const cx     = window.innerWidth  / 2;
  const cy     = window.innerHeight / 3;

  for (let i = 0; i < 30; i++) {
    const p    = document.createElement('div');
    p.className = 'particle';
    const size  = 5 + Math.random() * 8;

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${cx + (Math.random() - 0.5) * 200}px;
      top: ${cy}px;
      animation-delay: ${Math.random() * 0.3}s;
      animation-duration: ${0.8 + Math.random() * 0.8}s;
    `;

    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1600);
  }
}

// ── Main Play Function ─────────────────────────────────────
function play(playerChoice, autoPlay = false) {
  if (!roundActive) return;

  roundActive = false;
  clearInterval(timerInterval);
  setButtonsDisabled(true);

  // Highlight selected button
  document.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('btn-' + playerChoice).classList.add('selected');

  // Start shake animation
  playerHandEl.classList.add('shaking-p');
  cpuHandEl.classList.add('shaking-c');

  statusTextEl.textContent = autoPlay ? "⏱ Time's up! Random pick!" : '3... 2... 1...';

  const revealDelay = autoPlay ? 400 : 900;

  setTimeout(() => {
    const cpuChoice = getComputerChoice();

    // Stop shake, show hands
    playerHandEl.classList.remove('shaking-p');
    cpuHandEl.classList.remove('shaking-c');

    playerHandEl.textContent = EMOJIS[playerChoice];
    cpuHandEl.textContent    = EMOJIS[cpuChoice];

    playerHandEl.classList.add('pop');
    cpuHandEl.classList.add('pop');
    setTimeout(() => {
      playerHandEl.classList.remove('pop');
      cpuHandEl.classList.remove('pop');
    }, 400);

    // Determine result
    const winner = determineWinner(playerChoice, cpuChoice);
    let resultText, resultClass, detail;

    if (winner === 'draw') {
      resultText  = 'DRAW';
      resultClass = 'draw';
      detail      = `${EMOJIS[playerChoice]} ties ${EMOJIS[cpuChoice]}`;
      scores.draws++;
      streak = 0;

    } else if (winner === 'player') {
      resultText  = 'YOU WIN';
      resultClass = 'win';
      detail      = DETAILS[playerChoice + '-' + cpuChoice] || '';
      scores.player++;
      streak++;
      spawnConfetti();

    } else {
      resultText  = 'YOU LOSE';
      resultClass = 'lose';
      detail      = DETAILS[cpuChoice + '-' + playerChoice] || '';
      scores.cpu++;
      streak = 0;
    }

    // Show result
    resultTextEl.className  = 'result-text ' + resultClass;
    resultTextEl.textContent = resultText;
    resultDetailEl.textContent = detail;

    setTimeout(() => {
      resultTextEl.classList.add('show');
      resultDetailEl.classList.add('show');
    }, 50);

    // Update scores & streak badge
    updateScores();

    if (streak >= 2) {
      streakBadgeEl.textContent = `🔥 ${streak}x Streak`;
      streakBadgeEl.classList.add('show');
    } else {
      streakBadgeEl.classList.remove('show');
    }

    statusTextEl.textContent = 'Click a weapon to play again';

    // Re-enable after delay
    setTimeout(() => {
      resultTextEl.classList.remove('show');
      resultDetailEl.classList.remove('show');
      document.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
      setButtonsDisabled(false);
      statusTextEl.textContent = 'Choose your weapon!';
      roundActive = true;
      startTimer();
    }, 2200);

  }, revealDelay);
}

// ── Reset Game ─────────────────────────────────────────────
function resetGame() {
  clearInterval(timerInterval);

  scores  = { player: 0, cpu: 0, draws: 0 };
  streak  = 0;
  roundActive = true;

  updateScores();

  playerHandEl.textContent     = '✊';
  cpuHandEl.textContent        = '✊';
  resultTextEl.className       = 'result-text';
  resultTextEl.textContent     = '';
  resultDetailEl.textContent   = '';
  resultDetailEl.classList.remove('show');
  streakBadgeEl.classList.remove('show');
  statusTextEl.textContent     = 'Choose your weapon!';

  document.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
  setButtonsDisabled(false);

  startTimer();
}

// ── Init ───────────────────────────────────────────────────
startTimer();