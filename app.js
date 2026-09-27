const clock = document.querySelector("#clock");
const clockWrap = document.querySelector("#clockWrap");
const minuteHand = document.querySelector("#minuteHand");
const hourHand = document.querySelector("#hourHand");
const digitalTime = document.querySelector("#digitalTime");
const periodToggle = document.querySelector("#periodToggle");
const spokenTime = document.querySelector("#spokenTime");
const timeHint = document.querySelector("#timeHint");
const tickMarks = document.querySelector("#tickMarks");
const clockNumbers = document.querySelector("#clockNumbers");
const soundButton = document.querySelector("#soundButton");
const hearButton = document.querySelector("#hearButton");
const practicePanel = document.querySelector("#practicePanel");
const lessonSteps = document.querySelector("#lessonSteps");
const clockControls = document.querySelector("#clockControls");
const promptKicker = document.querySelector("#promptKicker");
const promptText = document.querySelector("#promptText");
const challengeKind = document.querySelector("#challengeKind");
const challengeText = document.querySelector("#challengeText");
const answerOptions = document.querySelector("#answerOptions");
const hourControls = document.querySelector("#hourControls");
const checkButton = document.querySelector("#checkButton");
const repeatChallengeButton = document.querySelector("#repeatChallengeButton");
const feedback = document.querySelector("#feedback");
const settingsDialog = document.querySelector("#settingsDialog");
const settingsForm = document.querySelector("#settingsForm");
const installButton = document.querySelector("#installButton");
const installMessage = document.querySelector("#installMessage");

const STORAGE_KEY = "la-hora-progress-v2";
const COMPLETION_TARGET = 4;
const hourNames = ["doce", "una", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once"];
const minuteNames = new Map([
  [0, "en punto"], [5, "y cinco"], [10, "y diez"], [15, "y cuarto"], [20, "y veinte"], [25, "y veinticinco"],
  [30, "y media"], [35, "menos veinticinco"], [40, "menos veinte"], [45, "menos cuarto"], [50, "menos diez"], [55, "menos cinco"],
]);
const levelMinutes = {
  1: [0],
  2: [0, 30],
  3: [0, 15, 30],
  4: [0, 15, 30, 45],
  5: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
};
const levelNames = ["", "En punto", "Y media", "Y cuarto", "Menos cuarto", "Gran mezcla"];
const rewardRules = [
  { id: "sun", stars: 3, name: "Sol curioso" },
  { id: "cake", stars: 8, name: "Pastel de cuartos" },
  { id: "rocket", stars: 15, name: "Cohete del tiempo" },
  { id: "clock", stars: 25, name: "Maestra del reloj" },
];
const lessonSets = {
  1: [
    { hour: 1, minutes: 0, title: "Las horas empiezan en el 12", text: "Cuando la aguja larga apunta al 12, decimos «en punto»." },
    { hour: 5, minutes: 0, title: "Busca la aguja corta", text: "La aguja corta señala la hora: aquí son las cinco en punto." },
    { hour: 8, minutes: 0, title: "La larga no se ha movido", text: "Aunque cambie la hora, la aguja larga sigue en el 12." },
    { hour: 12, minutes: 0, title: "¡Ya conoces las horas!", text: "Ahora puedes practicar distintas horas en punto." },
  ],
  2: [
    { hour: 3, minutes: 0, title: "Empezamos en punto", text: "La aguja larga inicia su recorrido en el 12." },
    { hour: 3, minutes: 15, title: "Recorre un cuarto", text: "Al llegar al 3 han pasado quince minutos." },
    { hour: 3, minutes: 30, title: "Medio reloj", text: "Al llegar al 6 ha pasado media hora: son las tres y media." },
    { hour: 6, minutes: 30, title: "La corta queda entre dos horas", text: "A las seis y media, la aguja corta está a medio camino del siete." },
  ],
  3: [
    { hour: 4, minutes: 0, title: "Partimos de las cuatro", text: "La aguja larga comienza en el 12." },
    { hour: 4, minutes: 15, title: "Un cuarto de reloj", text: "Del 12 al 3 hay quince minutos: son las cuatro y cuarto." },
    { hour: 7, minutes: 15, title: "Siempre termina en el 3", text: "Cuando decimos «y cuarto», la aguja larga señala el 3." },
    { hour: 10, minutes: 15, title: "¡Cuarto aprendido!", text: "Fíjate en la aguja corta para saber de qué hora hemos partido." },
  ],
  4: [
    { hour: 2, minutes: 0, title: "Empezamos a las dos", text: "La aguja larga sale del 12 y comienza su vuelta." },
    { hour: 2, minutes: 15, title: "Ha pasado un cuarto", text: "En el 3 decimos «las dos y cuarto»." },
    { hour: 2, minutes: 30, title: "Ya va por la mitad", text: "En el 6 son las dos y media. La aguja corta se acerca al tres." },
    { hour: 2, minutes: 45, title: "Miramos la hora que viene", text: "Solo faltan quince minutos para las tres: son las tres menos cuarto.", countdown: true },
  ],
  5: [
    { hour: 1, minutes: 5, title: "Minutos después de la hora", text: "Cada rayita representa un minuto. Aquí son la una y cinco." },
    { hour: 3, minutes: 25, title: "Todavía sumamos", text: "Hasta la media contamos los minutos que ya han pasado." },
    { hour: 8, minutes: 40, title: "Después de la media, restamos", text: "Faltan veinte minutos para las nueve: son las nueve menos veinte." },
    { hour: 10, minutes: 55, title: "Casi una nueva hora", text: "Faltan cinco minutos para las once: son las once menos cinco." },
  ],
};

function defaultProgress() {
  return {
    profileComplete: false,
    name: "",
    character: "🦉",
    theme: "sunny",
    timeFormat: "12",
    voice: true,
    hints: true,
    digital: true,
    stars: 0,
    streak: 0,
    bestStreak: 0,
    level: 1,
    unlockedLevel: 1,
    levelCorrect: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    mistakes: { 0: 0, 15: 0, 30: 0, 45: 0, other: 0 },
    rewards: [],
  };
}

function loadProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored || typeof stored !== "object") return defaultProgress();
    const fallback = defaultProgress();
    return {
      ...fallback,
      ...stored,
      levelCorrect: { ...fallback.levelCorrect, ...(stored.levelCorrect || {}) },
      mistakes: { ...fallback.mistakes, ...(stored.mistakes || {}) },
      rewards: Array.isArray(stored.rewards) ? stored.rewards : [],
    };
  } catch {
    return defaultProgress();
  }
}

let progress = loadProgress();
let deferredInstallPrompt = null;
const state = {
  hour: 2,
  minutes: 45,
  period: "am",
  mode: "explore",
  challenge: { hour: 4, minutes: 45, period: "am", kind: "set" },
  challengeSerial: 0,
  challengeSolved: false,
  dragging: null,
  lessonStep: 0,
};

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    showMessage("El navegador no ha podido guardar el progreso.");
  }
}

function createClockFace() {
  for (let index = 0; index < 60; index += 1) {
    const tick = document.createElement("span");
    tick.className = "tick";
    tick.style.transform = `rotate(${index * 6}deg)`;
    if (index % 5 === 0) {
      tick.style.height = "13px";
      tick.style.width = "3px";
      tick.style.opacity = "0.7";
    }
    tickMarks.append(tick);
  }

  for (let number = 1; number <= 12; number += 1) {
    const label = document.createElement("span");
    const angle = (number * 30 - 90) * (Math.PI / 180);
    label.className = "number";
    label.dataset.number = String(number);
    label.textContent = String(number);
    label.style.left = `${50 + Math.cos(angle) * 39}%`;
    label.style.top = `${50 + Math.sin(angle) * 39}%`;
    clockNumbers.append(label);
  }
}

function spokenLabel(hour, minutes) {
  const usesNextHour = minutes > 30;
  const displayHour = usesNextHour ? (hour + 1) % 12 : hour % 12;
  const article = displayHour === 1 ? "Es la" : "Son las";
  return `${article} ${hourNames[displayHour]} ${minuteNames.get(minutes)}`;
}

function formatDigital(hour, minutes, period = state.period) {
  if (progress.timeFormat === "24") {
    let formattedHour = hour % 12;
    if (period === "pm") formattedHour += 12;
    return `${String(formattedHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }
  return `${hour}:${String(minutes).padStart(2, "0")}`;
}

function explanation(hour, minutes) {
  const nextHour = hourNames[(hour + 1) % 12];
  const currentHour = hourNames[hour % 12];
  if (minutes === 45) return `<strong>Falta un cuarto</strong> para llegar a ${nextHour === "una" ? "la una" : `las ${nextHour}`}.`;
  if (minutes > 30) return `Miramos la hora que viene: <strong>${nextHour}</strong>.`;
  if (minutes === 30) return `Ya ha pasado <strong>medio reloj</strong> desde las ${currentHour}.`;
  if (minutes === 15) return `Ha pasado <strong>un cuarto</strong> desde las ${currentHour}.`;
  if (minutes === 0) return `La aguja larga empieza un <strong>nuevo recorrido</strong>.`;
  return `Han pasado <strong>${minutes} minutos</strong> desde las ${currentHour}.`;
}

function updateClock(options = {}) {
  const { announce = false } = options;
  minuteHand.style.transform = `rotate(${state.minutes * 6}deg)`;
  hourHand.style.transform = `rotate(${(state.hour % 12) * 30 + state.minutes * 0.5}deg)`;
  digitalTime.textContent = formatDigital(state.hour, state.minutes);
  periodToggle.textContent = state.period === "am" ? "Mañana" : "Tarde";
  periodToggle.hidden = progress.timeFormat !== "24";
  spokenTime.textContent = spokenLabel(state.hour, state.minutes);
  timeHint.innerHTML = explanation(state.hour, state.minutes);
  clock.dataset.quarter = state.minutes === 45 ? "4" : String(Math.ceil(state.minutes / 15));
  clock.setAttribute("aria-label", `Reloj marcando ${spokenLabel(state.hour, state.minutes)}`);
  hourHand.setAttribute("aria-label", `Aguja de la hora en ${hourNames[state.hour % 12]}. Arrástrala para cambiar la hora`);
  minuteHand.setAttribute("aria-label", `Aguja de los minutos en ${state.minutes}. Arrástrala para cambiar los minutos`);
  const nextHour = state.hour % 12 + 1;
  document.querySelectorAll(".number").forEach((number) => number.classList.toggle("is-next-hour", state.minutes === 45 && Number(number.dataset.number) === nextHour));
  clock.classList.toggle("minus-lesson", state.mode === "learn" && progress.level === 4 && state.minutes === 45);
  if (announce) speak(spokenLabel(state.hour, state.minutes));
}

function setTime(hour, minutes, options = {}) {
  const total = ((hour * 60 + minutes) % 720 + 720) % 720;
  state.hour = Math.floor(total / 60) || 12;
  state.minutes = total % 60;
  updateClock(options);
}

function stepTime(minutes) {
  const normalizedMinutes = Math.round((state.minutes + minutes) / 5) * 5;
  setTime(state.hour, normalizedMinutes);
  feedback.textContent = "";
}

function speak(text) {
  if (!progress.voice || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  utterance.rate = 0.86;
  utterance.pitch = 1.12;
  window.speechSynthesis.speak(utterance);
}

function angleFromPointer(event) {
  const bounds = clock.getBoundingClientRect();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const angle = (Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180) / Math.PI + 90;
  return (angle + 360) % 360;
}

function timeFromPointer(event) {
  return Math.round((angleFromPointer(event) / 6) / 5) * 5 % 60;
}

function dragMinuteTo(event) {
  const previous = state.minutes;
  const next = timeFromPointer(event);
  if (previous >= 50 && next <= 10) state.hour = state.hour % 12 + 1;
  if (previous <= 10 && next >= 50) state.hour = state.hour === 1 ? 12 : state.hour - 1;
  state.minutes = next;
  updateClock();
}

function dragHourTo(event) {
  const selectedHour = Math.round(angleFromPointer(event) / 30) % 12;
  state.hour = selectedHour === 0 ? 12 : selectedHour;
  updateClock();
}

function startDrag(event, hand) {
  if (clock.classList.contains("is-readonly")) return;
  state.dragging = hand;
  clock.classList.add("is-dragging");
  event.currentTarget.setPointerCapture(event.pointerId);
  if (hand === "minute") dragMinuteTo(event);
  else dragHourTo(event);
  feedback.textContent = "";
}

function stopDrag(event) {
  if (!state.dragging) return;
  state.dragging = null;
  clock.classList.remove("is-dragging");
  if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  if (state.mode !== "practice") speak(spokenLabel(state.hour, state.minutes));
}

function handleHandKeydown(event, hand) {
  if (clock.classList.contains("is-readonly")) return;
  if (!["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp"].includes(event.key)) return;
  event.preventDefault();
  const direction = event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 1;
  if (hand === "hour") setTime(state.hour + direction, state.minutes);
  else setTime(state.hour, state.minutes + direction * 5);
}

function setClockEditable(editable) {
  clock.classList.toggle("is-readonly", !editable);
  [hourHand, minuteHand].forEach((hand) => {
    hand.tabIndex = editable ? 0 : -1;
    hand.setAttribute("aria-disabled", String(!editable));
  });
  hourControls.hidden = !editable;
  checkButton.hidden = !editable;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function normalizeTime(hour, minutes) {
  const total = ((hour * 60 + minutes) % 720 + 720) % 720;
  return { hour: Math.floor(total / 60) || 12, minutes: total % 60 };
}

function challengeTypesForLevel(level) {
  if (level === 1) return ["set", "choose"];
  if (level === 2) return ["set", "choose", "digital"];
  if (level === 3) return ["set", "choose", "digital", "listen"];
  return ["set", "choose", "digital", "listen", "fix"];
}

function optionTimes(target, offsets) {
  const choices = offsets.map((offset) => normalizeTime(target.hour, target.minutes + offset));
  return choices.filter((choice, index, all) => all.findIndex((item) => item.hour === choice.hour && item.minutes === choice.minutes) === index);
}

function renderAnswerOptions(options, correctValue) {
  answerOptions.replaceChildren();
  answerOptions.hidden = false;
  options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "answer-option";
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => answerChoice(button, option === correctValue));
    answerOptions.append(button);
  });
}

function shuffled(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function chooseChallenge() {
  const availableMinutes = levelMinutes[progress.level];
  const kindOptions = challengeTypesForLevel(progress.level);
  const nextKind = kindOptions[state.challengeSerial % kindOptions.length];
  state.challengeSerial += 1;
  let target;
  do {
    target = {
      hour: Math.floor(Math.random() * 12) + 1,
      minutes: randomItem(availableMinutes),
      period: Math.random() > 0.5 ? "pm" : "am",
      kind: nextKind,
    };
  } while (target.hour === state.challenge.hour && target.minutes === state.challenge.minutes);
  state.challenge = target;
  state.challengeSolved = false;
  state.period = target.period;
  feedback.textContent = "";
  feedback.className = "feedback";
  answerOptions.hidden = true;
  answerOptions.replaceChildren();
  repeatChallengeButton.hidden = true;

  if (nextKind === "choose") {
    challengeKind.textContent = "¿CÓMO SE LEE ESTE RELOJ?";
    challengeText.textContent = "Elige la frase correcta";
    setTime(target.hour, target.minutes);
    setClockEditable(false);
    const options = optionTimes(target, [0, 15, -15]).map((time) => spokenLabel(time.hour, time.minutes));
    renderAnswerOptions(shuffled(options), spokenLabel(target.hour, target.minutes));
  } else if (nextKind === "digital") {
    challengeKind.textContent = "RELOJ ANALÓGICO + DIGITAL";
    challengeText.textContent = "Elige la hora digital correcta";
    setTime(target.hour, target.minutes);
    setClockEditable(false);
    const options = optionTimes(target, [0, 30, -15]).map((time) => formatDigital(time.hour, time.minutes, target.period));
    renderAnswerOptions(shuffled(options), formatDigital(target.hour, target.minutes, target.period));
  } else if (nextKind === "listen") {
    challengeKind.textContent = "ESCUCHA Y COLOCA";
    challengeText.textContent = "Escucha con atención";
    repeatChallengeButton.hidden = false;
    setClockEditable(true);
    setTime(12, 0);
    speak(`Coloca las agujas en ${spokenLabel(target.hour, target.minutes)}`);
  } else if (nextKind === "fix") {
    challengeKind.textContent = "ENCUENTRA Y CORRIGE EL ERROR";
    challengeText.textContent = `Debería marcar ${spokenLabel(target.hour, target.minutes).toLowerCase()}`;
    setClockEditable(true);
    const wrong = normalizeTime(target.hour, target.minutes + (Math.random() > 0.5 ? 15 : -15));
    setTime(wrong.hour, wrong.minutes);
  } else {
    challengeKind.textContent = "COLOCA LAS AGUJAS EN…";
    challengeText.textContent = spokenLabel(target.hour, target.minutes);
    setClockEditable(true);
    setTime(12, 0);
    speak(`Coloca las agujas en ${spokenLabel(target.hour, target.minutes)}`);
  }
}

function mistakeKey(minutes) {
  return [0, 15, 30, 45].includes(minutes) ? String(minutes) : "other";
}

function recordFailure() {
  progress.streak = 0;
  const key = mistakeKey(state.challenge.minutes);
  progress.mistakes[key] = (progress.mistakes[key] || 0) + 1;
  saveProgress();
  renderProgress();
}

function unlockRewards() {
  const newlyUnlocked = [];
  rewardRules.forEach((reward) => {
    if (progress.stars >= reward.stars && !progress.rewards.includes(reward.id)) {
      progress.rewards.push(reward.id);
      newlyUnlocked.push(reward.name);
    }
  });
  return newlyUnlocked;
}

function recordSuccess() {
  if (state.challengeSolved) return;
  state.challengeSolved = true;
  progress.stars += 1;
  progress.streak += 1;
  progress.bestStreak = Math.max(progress.bestStreak, progress.streak);
  const levelKey = String(progress.level);
  progress.levelCorrect[levelKey] = (progress.levelCorrect[levelKey] || 0) + 1;
  let unlockedMessage = "";
  if (progress.levelCorrect[levelKey] >= COMPLETION_TARGET && progress.level < 5 && progress.unlockedLevel <= progress.level) {
    progress.unlockedLevel = progress.level + 1;
    unlockedMessage = ` Has desbloqueado el nivel ${progress.unlockedLevel}.`;
  }
  const rewards = unlockRewards();
  const rewardMessage = rewards.length ? ` Nueva pegatina: ${rewards.join(", ")}.` : "";
  saveProgress();
  renderProgress();
  feedback.textContent = `¡Eso es! Has ganado una estrella.${unlockedMessage}${rewardMessage}`;
  feedback.className = "feedback is-success";
  speak(`¡Eso es! Has ganado una estrella.${unlockedMessage}${rewardMessage}`);
  celebrate();
}

function clueForChallenge() {
  const target = state.challenge;
  if (target.minutes === 45) return "La aguja larga va en el 9 y la pequeña casi llega a la hora siguiente.";
  if (target.minutes === 30) return "La aguja larga va en el 6: ha recorrido medio reloj.";
  if (target.minutes === 15) return "La aguja larga va en el 3: ha recorrido un cuarto.";
  if (target.minutes === 0) return "La aguja larga va en el 12 y la corta señala la hora.";
  return `Cuenta las rayitas de cinco en cinco hasta llegar a ${target.minutes} minutos.`;
}

function showIncorrectFeedback() {
  recordFailure();
  const clue = progress.hints ? ` Pista: ${clueForChallenge()}` : " Prueba una vez más.";
  feedback.textContent = `Casi.${clue}`;
  feedback.className = "feedback is-try-again";
  speak(feedback.textContent);
}

function checkChallenge() {
  if (state.challengeSolved) return;
  const isCorrect = state.hour % 12 === state.challenge.hour % 12 && state.minutes === state.challenge.minutes;
  if (isCorrect) recordSuccess();
  else showIncorrectFeedback();
}

function answerChoice(button, isCorrect) {
  if (state.challengeSolved) return;
  if (isCorrect) {
    button.classList.add("is-correct");
    recordSuccess();
    answerOptions.querySelectorAll("button").forEach((option) => { option.disabled = true; });
  } else {
    button.classList.add("is-wrong");
    button.disabled = true;
    showIncorrectFeedback();
  }
}

function celebrate() {
  const colors = ["var(--coral)", "var(--sun)", "var(--mint)", "var(--sky)"];
  const celebration = document.querySelector("#celebration");
  celebration.replaceChildren();
  for (let index = 0; index < 30; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[index % colors.length];
    piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 180}px`);
    piece.style.animationDelay = `${Math.random() * 0.3}s`;
    celebration.append(piece);
  }
}

function renderLessonStep() {
  const slides = lessonSets[progress.level];
  const slide = slides[state.lessonStep];
  document.querySelector("#lessonStepNumber").textContent = String(state.lessonStep + 1);
  document.querySelector("#lessonStepTitle").textContent = slide.title;
  document.querySelector("#lessonStepText").textContent = slide.text;
  document.querySelector("#previousLessonButton").disabled = state.lessonStep === 0;
  document.querySelector("#nextLessonButton").textContent = state.lessonStep === slides.length - 1 ? "Practicar" : "Siguiente";
  document.querySelectorAll("#lessonDots i").forEach((dot, index) => dot.classList.toggle("is-active", index === state.lessonStep));
  document.querySelector("#countdownVisual").hidden = !slide.countdown;
  setTime(slide.hour, slide.minutes, { announce: true });
}

function moveLesson(direction) {
  const slides = lessonSets[progress.level];
  if (direction > 0 && state.lessonStep === slides.length - 1) {
    setMode("practice");
    return;
  }
  state.lessonStep = Math.min(slides.length - 1, Math.max(0, state.lessonStep + direction));
  renderLessonStep();
}

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll(".mode-tab").forEach((tab) => {
    const isActive = tab.dataset.mode === mode;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });
  practicePanel.hidden = mode !== "practice";
  lessonSteps.hidden = mode !== "learn";
  clockControls.hidden = mode === "practice";
  setClockEditable(mode !== "learn");

  if (mode === "explore") {
    promptKicker.textContent = "PRUEBA A MOVERLA";
    promptText.textContent = "Arrastra cualquiera de las dos agujas.";
    setClockEditable(true);
    setTime(2, 45);
  } else if (mode === "learn") {
    promptKicker.textContent = `NIVEL ${progress.level} · ${levelNames[progress.level].toUpperCase()}`;
    promptText.textContent = "Observa cómo se mueven juntas las dos agujas.";
    state.lessonStep = 0;
    renderLessonStep();
  } else {
    promptKicker.textContent = `NIVEL ${progress.level} · TU TURNO`;
    promptText.textContent = "Resuelve cuatro actividades para completar el nivel.";
    chooseChallenge();
  }
}

function recommendationText() {
  const labels = { 0: "las horas en punto", 15: "«y cuarto»", 30: "«y media»", 45: "«menos cuarto»", other: "los minutos de cinco en cinco" };
  const entries = Object.entries(progress.mistakes);
  const highest = entries.reduce((best, current) => current[1] > best[1] ? current : best, entries[0]);
  if (highest[1] > 0) return `Conviene reforzar ${labels[highest[0]]}. Repite una actividad breve y pregunta cómo lo ha pensado.`;
  if (progress.unlockedLevel < 5) return `Está preparada para seguir practicando ${levelNames[progress.unlockedLevel].toLowerCase()}.`;
  return "Va dominando todos los conceptos. Combina reloj, audio y hora digital.";
}

function tipForLevel() {
  if (progress.level === 1) return ["Pregúntale: “¿Dónde está la aguja corta?”", "La aguja corta indica la hora y la larga debe estar en el 12."];
  if (progress.level === 2) return ["Pregúntale: “¿Ha recorrido medio reloj?”", "Cuando la aguja larga llega al 6, han pasado treinta minutos."];
  if (progress.level === 3) return ["Pregúntale: “¿Cuántos minutos tiene un cuarto?”", "Del 12 al 3 hay quince minutos: un cuarto de reloj."];
  if (progress.level === 4) return ["Pregúntale: “¿A qué hora estamos a punto de llegar?”", "Cuando la aguja larga está en el 9, miramos la hora que viene."];
  return ["Pregúntale: “¿Sumamos lo pasado o restamos lo que falta?”", "Antes de la media sumamos; después de la media miramos cuánto falta."];
}

function renderProgress() {
  document.querySelector("#starCount").textContent = String(progress.stars);
  document.querySelector("#rewardStars").textContent = String(progress.stars);
  document.querySelector("#levelProgressText").textContent = `Nivel ${progress.level} · ${Math.min(progress.levelCorrect[progress.level] || 0, COMPLETION_TARGET)} de ${COMPLETION_TARGET} estrellas`;
  document.querySelectorAll(".level-button").forEach((button) => {
    const level = Number(button.dataset.level);
    const isCurrent = level === progress.level;
    button.disabled = level > progress.unlockedLevel;
    button.classList.toggle("is-current", isCurrent);
    button.classList.toggle("is-complete", (progress.levelCorrect[level] || 0) >= COMPLETION_TARGET);
    button.setAttribute("aria-pressed", String(isCurrent));
  });
  document.querySelectorAll(".reward-card").forEach((card) => card.classList.toggle("is-unlocked", progress.rewards.includes(card.dataset.reward)));
  document.querySelector("#parentStars").textContent = String(progress.stars);
  document.querySelector("#parentStreak").textContent = String(progress.bestStreak);
  document.querySelector("#parentLevel").textContent = String(progress.level);
  document.querySelector("#parentRecommendation").textContent = recommendationText();
  const [title, tip] = tipForLevel();
  document.querySelector("#parentTitle").textContent = title;
  document.querySelector("#parentTip").textContent = tip;
}

function applyPreferences() {
  document.body.dataset.theme = progress.theme;
  document.body.classList.toggle("hide-digital", !progress.digital);
  document.querySelector("#heroCharacter").textContent = progress.character;
  document.querySelector("#nameGreeting").textContent = progress.name ? `, ${progress.name}?` : "?";
  soundButton.setAttribute("aria-pressed", String(progress.voice));
  soundButton.setAttribute("aria-label", progress.voice ? "Desactivar sonido" : "Activar sonido");
  soundButton.querySelector("span").textContent = progress.voice ? "♪" : "×";
  updateClock();
}

function fillSettingsForm() {
  document.querySelector("#childName").value = progress.name;
  const characterInput = settingsForm.querySelector(`input[name="character"][value="${progress.character}"]`);
  if (characterInput) characterInput.checked = true;
  document.querySelector("#colorTheme").value = progress.theme;
  document.querySelector("#timeFormat").value = progress.timeFormat;
  document.querySelector("#voiceSetting").checked = progress.voice;
  document.querySelector("#hintSetting").checked = progress.hints;
  document.querySelector("#digitalSetting").checked = progress.digital;
}

function saveSettings() {
  const selectedCharacter = settingsForm.querySelector('input[name="character"]:checked');
  progress.name = document.querySelector("#childName").value.trim();
  progress.character = selectedCharacter ? selectedCharacter.value : "🦉";
  progress.theme = document.querySelector("#colorTheme").value;
  progress.timeFormat = document.querySelector("#timeFormat").value;
  progress.voice = document.querySelector("#voiceSetting").checked;
  progress.hints = document.querySelector("#hintSetting").checked;
  progress.digital = document.querySelector("#digitalSetting").checked;
  progress.profileComplete = true;
  saveProgress();
  applyPreferences();
  renderProgress();
}

function showMessage(message) {
  installMessage.textContent = message;
  installMessage.hidden = false;
  window.setTimeout(() => { installMessage.hidden = true; }, 5000);
}

document.querySelector("#backButton").addEventListener("click", () => stepTime(-15));
document.querySelector("#forwardButton").addEventListener("click", () => stepTime(15));
hearButton.addEventListener("click", () => speak(`${spokenLabel(state.hour, state.minutes)}. ${timeHint.textContent}`));
soundButton.addEventListener("click", () => {
  progress.voice = !progress.voice;
  saveProgress();
  applyPreferences();
  if (!progress.voice && "speechSynthesis" in window) window.speechSynthesis.cancel();
});
periodToggle.addEventListener("click", () => {
  state.period = state.period === "am" ? "pm" : "am";
  updateClock();
});
minuteHand.addEventListener("pointerdown", (event) => startDrag(event, "minute"));
minuteHand.addEventListener("pointermove", (event) => { if (state.dragging === "minute") dragMinuteTo(event); });
minuteHand.addEventListener("pointerup", stopDrag);
minuteHand.addEventListener("pointercancel", stopDrag);
minuteHand.addEventListener("keydown", (event) => handleHandKeydown(event, "minute"));
hourHand.addEventListener("pointerdown", (event) => startDrag(event, "hour"));
hourHand.addEventListener("pointermove", (event) => { if (state.dragging === "hour") dragHourTo(event); });
hourHand.addEventListener("pointerup", stopDrag);
hourHand.addEventListener("pointercancel", stopDrag);
hourHand.addEventListener("keydown", (event) => handleHandKeydown(event, "hour"));
document.querySelector("#newChallengeButton").addEventListener("click", chooseChallenge);
checkButton.addEventListener("click", checkChallenge);
repeatChallengeButton.addEventListener("click", () => speak(`Coloca las agujas en ${spokenLabel(state.challenge.hour, state.challenge.minutes)}`));
document.querySelector("#previousHourButton").addEventListener("click", () => setTime(state.hour - 1, state.minutes));
document.querySelector("#nextHourButton").addEventListener("click", () => setTime(state.hour + 1, state.minutes));
document.querySelector("#previousLessonButton").addEventListener("click", () => moveLesson(-1));
document.querySelector("#nextLessonButton").addEventListener("click", () => moveLesson(1));
document.querySelectorAll(".mode-tab").forEach((tab) => tab.addEventListener("click", () => setMode(tab.dataset.mode)));
document.querySelectorAll(".level-button").forEach((button) => button.addEventListener("click", () => {
  const level = Number(button.dataset.level);
  if (level > progress.unlockedLevel) return;
  progress.level = level;
  saveProgress();
  renderProgress();
  setMode("learn");
  document.querySelector("#activityCard").scrollIntoView({ behavior: "smooth", block: "start" });
}));
document.querySelectorAll(".quarter-card").forEach((card) => {
  const chooseQuarter = () => {
    setMode("explore");
    setTime(2, Number(card.dataset.minutes), { announce: true });
    document.querySelector("#activityCard").scrollIntoView({ behavior: "smooth", block: "center" });
  };
  card.addEventListener("click", chooseQuarter);
  card.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") chooseQuarter(); });
});
document.querySelector("#parentToggle").addEventListener("click", (event) => {
  const dashboard = document.querySelector("#parentDashboard");
  const willOpen = dashboard.hidden;
  dashboard.hidden = !willOpen;
  event.currentTarget.setAttribute("aria-expanded", String(willOpen));
  event.currentTarget.textContent = willOpen ? "Ocultar progreso" : "Ver progreso para adultos";
});
document.querySelector("#resetProgressButton").addEventListener("click", () => {
  if (!window.confirm("¿Quieres borrar todas las estrellas, niveles y preferencias guardadas en este dispositivo?")) return;
  progress = defaultProgress();
  saveProgress();
  applyPreferences();
  renderProgress();
  setMode("explore");
  fillSettingsForm();
  settingsDialog.showModal();
});
document.querySelector("#settingsButton").addEventListener("click", () => {
  fillSettingsForm();
  settingsDialog.showModal();
});
settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.submitter?.value === "cancel") {
    settingsDialog.close();
    return;
  }
  saveSettings();
  settingsDialog.close();
});
settingsDialog.addEventListener("click", (event) => {
  if (event.target === settingsDialog && progress.profileComplete) settingsDialog.close();
});
installButton.addEventListener("click", async () => {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    return;
  }
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  showMessage(isIos ? "En Safari, toca Compartir y después «Añadir a pantalla de inicio»." : "Abre el menú del navegador y elige «Instalar aplicación» o «Añadir a pantalla de inicio»." );
});
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
});
window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  installButton.hidden = true;
  showMessage("La aplicación ya está instalada.");
});

const resizeObserver = new ResizeObserver(([entry]) => {
  clock.style.setProperty("--clock-size", `${entry.contentRect.width}px`);
});
resizeObserver.observe(clockWrap);

for (let index = 0; index < 15; index += 1) {
  const dot = document.createElement("i");
  dot.style.setProperty("--dot", String(index));
  document.querySelector("#countdownDots").append(dot);
}

createClockFace();
fillSettingsForm();
applyPreferences();
renderProgress();
setMode("explore");

if (!progress.profileComplete) {
  window.setTimeout(() => settingsDialog.showModal(), 250);
}

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
}
