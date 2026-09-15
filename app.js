const STORAGE_KEY = "trainingLog";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { exercises: {} };
  } catch (e) {
    return { exercises: {} };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const exerciseNameInput = document.getElementById("exerciseName");
const exerciseListEl = document.getElementById("exerciseList");
const lastRecordEl = document.getElementById("lastRecord");
const weightInput = document.getElementById("weight");
const repsInput = document.getElementById("reps");
const setsInput = document.getElementById("sets");
const saveBtn = document.getElementById("saveBtn");
const messageEl = document.getElementById("message");

let data = loadData();

function refreshExerciseList() {
  exerciseListEl.innerHTML = "";
  Object.keys(data.exercises).forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    exerciseListEl.appendChild(opt);
  });
}

function formatRecord(record) {
  return `前回 (${record.date}): ${record.weight}kg × ${record.reps}回 × ${record.sets}セット`;
}

function updateLastRecord() {
  const name = exerciseNameInput.value.trim();
  if (!name) {
    lastRecordEl.textContent = "種目を入力してください";
    lastRecordEl.classList.remove("has-data");
    return;
  }
  const records = data.exercises[name];
  if (!records || records.length === 0) {
    lastRecordEl.textContent = "この種目の記録はまだありません";
    lastRecordEl.classList.remove("has-data");
    return;
  }
  const last = records[records.length - 1];
  lastRecordEl.textContent = formatRecord(last);
  lastRecordEl.classList.add("has-data");
}

function todayString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function showMessage(text) {
  messageEl.textContent = text;
  setTimeout(() => {
    if (messageEl.textContent === text) messageEl.textContent = "";
  }, 2000);
}

function handleSave() {
  const name = exerciseNameInput.value.trim();
  const weight = parseFloat(weightInput.value);
  const reps = parseInt(repsInput.value, 10);
  const sets = parseInt(setsInput.value, 10);

  if (!name) {
    showMessage("種目を入力してください");
    exerciseNameInput.focus();
    return;
  }
  if (isNaN(weight) || isNaN(reps) || isNaN(sets)) {
    showMessage("重量・回数・セット数を入力してください");
    return;
  }

  if (!data.exercises[name]) {
    data.exercises[name] = [];
  }
  data.exercises[name].push({
    date: todayString(),
    weight,
    reps,
    sets,
  });
  saveData(data);
  refreshExerciseList();
  updateLastRecord();
  showMessage("保存しました");
}

exerciseNameInput.addEventListener("input", updateLastRecord);
saveBtn.addEventListener("click", handleSave);

refreshExerciseList();
updateLastRecord();
