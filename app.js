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
const exerciseSuggestionsEl = document.getElementById("exerciseSuggestions");
const lastRecordEl = document.getElementById("lastRecord");
const recordDateInput = document.getElementById("recordDate");
const weightInput = document.getElementById("weight");
const assistToggle = document.getElementById("assistToggle");
const repsInput = document.getElementById("reps");
const setsInput = document.getElementById("sets");
const saveBtn = document.getElementById("saveBtn");
const messageEl = document.getElementById("message");
const historyListEl = document.getElementById("historyList");

let data = loadData();

function renderSuggestions() {
  const query = exerciseNameInput.value.trim().toLowerCase();
  const names = Object.keys(data.exercises).filter((name) =>
    name.toLowerCase().includes(query)
  );

  exerciseSuggestionsEl.innerHTML = "";
  names.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;
    li.addEventListener("mousedown", (e) => {
      e.preventDefault();
      exerciseNameInput.value = name;
      exerciseSuggestionsEl.hidden = true;
      updateLastRecord();
    });
    exerciseSuggestionsEl.appendChild(li);
  });
  exerciseSuggestionsEl.hidden = names.length === 0;
}

function formatWeight(weight) {
  return weight === 0 ? "自重" : `${weight}kg`;
}

function formatRecord(record) {
  return `前回 (${record.date}): ${formatWeight(record.weight)} × ${record.reps}回 × ${record.sets}セット`;
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
  weightInput.value = Math.abs(last.weight);
  assistToggle.checked = last.weight < 0;
  repsInput.value = last.reps;
  setsInput.value = last.sets;
}

function todayString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function renderHistory() {
  const byDate = {};
  Object.keys(data.exercises).forEach((name) => {
    data.exercises[name].forEach((r) => {
      (byDate[r.date] = byDate[r.date] || []).push({ name, record: r });
    });
  });
  const dates = Object.keys(byDate).sort().reverse();

  historyListEl.innerHTML = "";
  if (dates.length === 0) {
    const p = document.createElement("p");
    p.className = "history-empty";
    p.textContent = "まだ記録がありません";
    historyListEl.appendChild(p);
    return;
  }
  dates.forEach((date) => {
    const day = document.createElement("div");
    day.className = "history-day";
    const head = document.createElement("div");
    head.className = "history-date";
    head.textContent = date;
    day.appendChild(head);
    byDate[date].forEach(({ name, record }) => {
      const item = document.createElement("div");
      item.className = "history-item";
      item.textContent = `${name}  ${formatWeight(record.weight)} × ${record.reps}回 × ${record.sets}セット`;
      day.appendChild(item);
    });
    historyListEl.appendChild(day);
  });
}

function showMessage(text) {
  messageEl.textContent = text;
  setTimeout(() => {
    if (messageEl.textContent === text) messageEl.textContent = "";
  }, 2000);
}

function handleSave() {
  const name = exerciseNameInput.value.trim();
  const rawWeight = parseFloat(weightInput.value);
  const weight = assistToggle.checked ? -Math.abs(rawWeight) : rawWeight;
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
    date: recordDateInput.value || todayString(),
    weight,
    reps,
    sets,
  });
  saveData(data);
  updateLastRecord();
  renderHistory();
  showMessage("保存しました");
}

exerciseNameInput.addEventListener("input", () => {
  updateLastRecord();
  renderSuggestions();
});
exerciseNameInput.addEventListener("focus", renderSuggestions);
exerciseNameInput.addEventListener("blur", () => {
  exerciseSuggestionsEl.hidden = true;
});
saveBtn.addEventListener("click", handleSave);

document.getElementById("refreshBtn").addEventListener("click", async () => {
  const urls = [location.href.split("#")[0], "style.css", "app.js"];
  try {
    await Promise.all(urls.map((u) => fetch(u, { cache: "reload" })));
  } catch (e) {}
  location.reload();
});

recordDateInput.value = todayString();
updateLastRecord();
renderHistory();
