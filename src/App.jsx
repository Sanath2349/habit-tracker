import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Utilities ─────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 9);
const dateKey = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const HABIT_COLORS = [
  "#a3e635",
  "#22d3ee",
  "#f97316",
  "#e879f9",
  "#fb7185",
  "#34d399",
  "#fbbf24",
  "#60a5fa",
  "#f43f5e",
  "#8b5cf6",
];
const DEFAULT_HABITS = [
  { id: uid(), name: "Wake up at 6AM", color: "#a3e635" },
  { id: uid(), name: "No Snoozing", color: "#22d3ee" },
  { id: uid(), name: "Drink 3L Water", color: "#60a5fa" },
  { id: uid(), name: "Workout", color: "#f97316" },
  { id: uid(), name: "Read 30 Pages", color: "#e879f9" },
  { id: uid(), name: "Meditation", color: "#34d399" },
  { id: uid(), name: "Limit Social Media", color: "#fb7185" },
  { id: uid(), name: "Track Expenses", color: "#fbbf24" },
];

const K_HABITS = "ht_habits_v3";
const K_DATA = "ht_completions_v3";

/* ─── CSS ────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #06060d; }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #707081; border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: #33335a; }

  .ht-root {
    font-family: 'Syne', sans-serif;
    background: #06060d;
    min-height: 100vh;
    color: #e8e8f8;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ── Topbar ── */
  .ht-topbar {
    position: sticky; top: 0; z-index: 60;
    background: #06060d;
    border-bottom: 1px solid #18183a;
    padding: 14px 20px 12px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; flex-wrap: wrap; flex-shrink: 0;
  }
  .ht-brand {
    font-size: 10px; font-family: 'JetBrains Mono', monospace;
    color: #b0b0d8; letter-spacing: 0.15em; text-transform: uppercase;
    margin-bottom: 4px;
  }
  .ht-month-nav { display: flex; align-items: center; gap: 10px; }
  .ht-month-title {
    font-size: 22px; font-weight: 800; letter-spacing: -0.03em;
    min-width: 220px; white-space: nowrap; color: #f0f0ff;
  }
  .ht-month-title span { color: #a7a7c5; }

  .ht-btn-ghost {
    background: none; border: 1px solid #6d6d93; border-radius: 7px;
    color: #7070a0; cursor: pointer; padding: 5px 10px; font-size: 14px;
    transition: border-color 0.15s, color 0.15s; font-family: 'JetBrains Mono', monospace;
  }
  .ht-btn-ghost:hover { border-color: #3a3a68; color: #a0a0cc; }

  .ht-btn-today {
    background: none; border: 1px solid #2e2e18; border-radius: 6px;
    color: #a3e635; cursor: pointer; padding: 3px 11px; font-size: 10px;
    font-family: 'JetBrains Mono', monospace; transition: background 0.15s;
  }
  .ht-btn-today:hover { background: #a3e63515; }

  /* Pin Today toggle button */
  .ht-btn-pin {
    background: none; border: 1px solid #22223a; border-radius: 7px;
    color: #6060a0; cursor: pointer; padding: 5px 13px; font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    transition: all 0.15s; white-space: nowrap;
    display: flex; align-items: center; gap: 5px;
  }
  .ht-btn-pin:hover { border-color: #3a3a68; color: #9090cc; }
  .ht-btn-pin.active {
    background: #a3e63515; border-color: #a3e63560;
    color: #a3e635;
  }
  .ht-btn-pin .pin-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: currentColor; flex-shrink: 0;
  }

  .ht-btn-reset {
    background: none; border: 1px solid #3a1515; border-radius: 7px;
    color: #a04040; cursor: pointer; padding: 6px 13px; font-size: 11px;
    font-family: 'Syne', sans-serif; transition: border-color 0.15s, color 0.15s;
  }
  .ht-btn-reset:hover { border-color: #6a2020; color: #d06060; }

  .ht-btn-add {
    background: #a3e635; border: none; border-radius: 7px; color: #06060d;
    cursor: pointer; padding: 7px 16px; font-size: 12px; font-weight: 700;
    font-family: 'Syne', sans-serif; transition: background 0.15s, transform 0.1s;
  }
  .ht-btn-add:hover { background: #b5f542; transform: translateY(-1px); }
  .ht-btn-add:active { transform: translateY(0); }

  .ht-topbar-meta {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    color: #b0b0d8; margin-right: 4px;
  }

  /* ── Add bar ── */
  .ht-add-bar {
    background: #09091a; border-bottom: 1px solid #18183a;
    padding: 10px 20px; display: flex; gap: 8px;
    animation: ht-slidedown 0.18s ease; flex-shrink: 0;
  }
  @keyframes ht-slidedown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ht-add-input {
    flex: 1; background: #0d0d22; border: 1px solid #22223a;
    border-radius: 7px; color: #e8e8f8; padding: 7px 13px; font-size: 13px;
    font-family: 'Syne', sans-serif; outline: none; transition: border-color 0.15s;
  }
  .ht-add-input:focus { border-color: #a3e63560; }
  .ht-add-input::placeholder { color: #3a3a68; }

  .ht-btn-confirm {
    background: #a3e635; border: none; border-radius: 7px; color: #06060d;
    padding: 7px 16px; font-size: 12px; font-weight: 700; cursor: pointer;
    font-family: 'Syne', sans-serif;
  }
  .ht-btn-cancel {
    background: none; border: 1px solid #22223a; border-radius: 7px;
    color: #7070a0; padding: 7px 13px; font-size: 12px; cursor: pointer;
    font-family: 'Syne', sans-serif;
  }

  /* ── Body layout ── */
  .ht-body { display: flex; flex: 1; overflow: hidden; }

  .ht-left {
    width: 325px; min-width: 255px; border-right: 1px solid #18183a;
    display: flex; flex-direction: column; flex-shrink: 0; overflow: hidden;
  }
  .ht-left-header {
    height: 62px; border-bottom: 1px solid #18183a;
    display: flex; align-items: center; padding: 0 18px; flex-shrink: 0;
    background: #06060d;
  }
  .ht-col-label {
    font-size: 9px; font-family: 'JetBrains Mono', monospace;
    color: #8888a6; letter-spacing: 0.12em; text-transform: uppercase;
  }
  .ht-habits-list { flex: 1; overflow-y: auto; }

  /* ── Habit row ── */
  .ht-habit-row {
    height: 52px; border-bottom: 1px solid #0f0f22;
    display: flex; align-items: center; padding: 0 14px; gap: 10px;
    position: relative; cursor: default; transition: background 0.12s;
  }
  .ht-habit-row:hover { background: #0c0c22; }
  .ht-habit-row:hover .ht-habit-actions { opacity: 1; }
  .ht-habit-dot {
    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
    transition: box-shadow 0.2s;
  }
  .ht-habit-row:hover .ht-habit-dot { box-shadow: 0 0 9px var(--habit-color); }
  .ht-habit-name {
    font-size: 12.5px; flex: 1; color: #b8b8d8;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    cursor: pointer; transition: color 0.12s;
  }
  .ht-habit-row:hover .ht-habit-name { color: #e0e0f8; }
  .ht-habit-edit-input {
    flex: 1; background: #0d0d22; border: 1px solid var(--habit-color);
    border-radius: 5px; color: #f0f0ff; padding: 3px 8px; font-size: 12px;
    font-family: 'Syne', sans-serif; outline: none;
  }
  .ht-habit-actions {
    display: flex; gap: 2px; opacity: 0;
    transition: opacity 0.15s; flex-shrink: 0;
  }
  .ht-icon-btn {
    background: none; border: none; cursor: pointer; padding: 3px 5px;
    border-radius: 4px; font-size: 12px; transition: background 0.12s; line-height: 1;
  }
  .ht-icon-btn-edit { color: #4a4a78; }
  .ht-icon-btn-edit:hover { background: #1a1a38; color: #9090cc; }
  .ht-icon-btn-del  { color: #5a2020; }
  .ht-icon-btn-del:hover  { background: #200a0a; color: #c06060; }

  .ht-habit-prog-bar {
    position: absolute; bottom: 0; left: 0; right: 0; height: 1.5px;
    background: #0f0f22;
  }
  .ht-habit-prog-fill {
    height: 100%; border-radius: 1px;
    transition: width 0.4s cubic-bezier(0.34,1.3,0.64,1);
  }
  .ht-habit-stats {
    display: flex; flex-direction: column; align-items: flex-end;
    flex-shrink: 0; gap: 1px;
  }
  .ht-stat-pct { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; }
  .ht-stat-streak { font-size: 9px; color: #f97316; font-family: 'JetBrains Mono', monospace; white-space: nowrap; }
  .ht-stat-count { font-size: 9px; color: #b0b0d8; font-family: 'JetBrains Mono', monospace; }

  .ht-totals-row-label {
    height: 44px; border-top: 1px solid #18183a;
    display: flex; align-items: center; padding: 0 18px;
    background: #06060d; flex-shrink: 0;
  }

  /* ── Grid ── */
  .ht-grid { flex: 1; overflow-x: auto; overflow-y: auto; }
  .ht-grid-inner { display: flex; min-width: max-content; }

  /* ── Day column ── */
  .ht-day-col {
    width: 52px; min-width: 52px; flex-shrink: 0;
    border-right: 1px solid #0d0d20;
    display: flex; flex-direction: column; transition: background 0.12s;
  }
  .ht-day-col:hover { background: rgba(255,255,255,0.01); }
  .ht-day-col.is-today { background: rgba(163,230,53,0.04) !important; }
  .ht-day-col.is-weekend { background: rgba(255,255,255,0.004); }

  /* Pinned today column — extra glow treatment */
  .ht-day-col.is-pinned-today {
    background: rgba(163,230,53,0.06) !important;
    border-left: 2px solid #a3e63540;
    border-right: 1px solid #0d0d20;
  }

  .ht-day-header {
    height: 62px; border-bottom: 1px solid #18183a;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    flex-shrink: 0; border-top: 2px solid transparent; transition: border-color 0.2s;
    position: sticky; top: 0; z-index: 5; background: inherit;
  }
  .ht-day-col.is-today .ht-day-header,
  .ht-day-col.is-pinned-today .ht-day-header { border-top-color: #a3e635; }

  .ht-day-name {
    font-family: 'JetBrains Mono', monospace; font-size: 8px;
    text-transform: uppercase; letter-spacing: 0.07em;
  }
  .ht-day-num {
    font-family: 'JetBrains Mono', monospace; font-size: 16px;
    line-height: 1.3; font-weight: 500;
  }

  /* ── Cell ── */
  .ht-cell {
    height: 52px; border-bottom: 1px solid #0d0d20;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: background 0.1s;
  }
  .ht-checkbox {
    width: 22px; height: 22px; border-radius: 6px; border: 1.5px solid #22223a;
    background: transparent; cursor: pointer; display: flex; align-items: center;
    justify-content: center; font-size: 11px;
    transition: all 0.12s cubic-bezier(0.34,1.5,0.64,1);
  }
  .ht-checkbox:hover { transform: scale(1.18); border-color: #3a3a60; }
  .ht-checkbox.done { transform: scale(1); }
  .ht-checkbox.done:hover { transform: scale(1.12); }
  .ht-check-icon { font-size: 10px; font-weight: 700; line-height: 1; }

  /* ── Day total ── */
  .ht-day-total {
    height: 44px; border-top: 1px solid #18183a;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .ht-day-total-num { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; }

  /* ── Empty ── */
  .ht-empty {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 12px; padding: 40px;
  }
  .ht-empty-icon { font-size: 36px; opacity: 0.4; }
  .ht-empty-text { font-size: 14px; color: #3a3a68; text-align: center; }

  /* Glowing divider after pinned today */
  .ht-pin-divider {
    width: 1px; background: #a3e63530; flex-shrink: 0; align-self: stretch;
    box-shadow: 0 0 8px #a3e63528;
  }
`;

/* ─── Streak Calculator ───────────────────────────────────────────────── */
function calcStreak(habitId, completions) {
  let streak = 0;
  const checkDate = new Date();
  for (let i = 0; i < 365; i++) {
    const y = checkDate.getFullYear();
    const m = checkDate.getMonth();
    const d = checkDate.getDate();
    const k = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if ((completions[habitId] || {})[k]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else break;
  }
  return streak;
}

/* ─── HabitRow ───────────────────────────────────────────────────────── */
function HabitRow({
  habit,
  completionCount,
  daysTracked,
  streak,
  isEditing,
  editValue,
  onEditChange,
  onEditSave,
  onStartEdit,
  onDelete,
}) {
  const pct =
    daysTracked > 0 ? Math.round((completionCount / daysTracked) * 100) : 0;
  const pctColor =
    pct >= 80
      ? "#a3e635"
      : pct >= 50
        ? "#fbbf24"
        : pct > 0
          ? "#f97316"
          : "#515179";
  const inputRef = useRef(null);
  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  return (
    <div className="ht-habit-row" style={{ "--habit-color": habit.color }}>
      <div
        className="ht-habit-dot"
        style={{ background: habit.color, "--habit-color": habit.color }}
      />

      {isEditing ? (
        <input
          ref={inputRef}
          className="ht-habit-edit-input"
          style={{ "--habit-color": habit.color }}
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onEditSave}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") onEditSave();
          }}
        />
      ) : (
        <span
          className="ht-habit-name"
          onDoubleClick={onStartEdit}
          title="Double-click to rename"
          style={{fontSize:"15px",fontWeight:600}}
        >
          {habit.name}
        </span>
      )}

      <div className="ht-habit-stats">
        <span className="ht-stat-pct" style={{ color: pctColor,fontSize:"12px" }}>
          {pct}%
        </span>
        {streak > 0 && <span className="ht-stat-streak">🔥{streak}d</span>}
        <span className="ht-stat-count">
          {completionCount}/{daysTracked}
        </span>
      </div>

      <div className="ht-habit-actions">
        <button
          className="ht-icon-btn ht-icon-btn-edit"
          onClick={onStartEdit}
          title="Rename"
        >
          ✎
        </button>
        <button
          className="ht-icon-btn ht-icon-btn-del"
          onClick={onDelete}
          title="Delete"
        >
          ✕
        </button>
      </div>

      <div className="ht-habit-prog-bar">
        <div
          className="ht-habit-prog-fill"
          style={{ width: pct + "%", background: habit.color }}
        />
      </div>
    </div>
  );
}

/* ─── DayColumn ──────────────────────────────────────────────────────── */
function DayColumn({
  day,
  name,
  isToday,
  isWeekend,
  isFuture,
  isPinnedToday,
  habits,
  isCompleted,
  toggle,
  dayTotal,
  totalHabits,
}) {
  const allDone = totalHabits > 0 && dayTotal === totalHabits;
  const totalColor = allDone ? "#a3e635" : dayTotal > 0 ? "#8888b8" : "#22224a";

  const nameColor =
    isToday || isPinnedToday ? "#a3e635" : isWeekend ? "#5e5e9b" : "#8282a7";
  const numColor =
    isToday || isPinnedToday ? "#a3e635" : isWeekend ? "#a7a7ca" : "#a3a3c5";

  const colClass = [
    "ht-day-col",
    isToday ? "is-today" : "",
    isWeekend ? "is-weekend" : "",
    isPinnedToday ? "is-pinned-today" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={colClass}>
      <div className="ht-day-header">
        <span className="ht-day-name" style={{ color: nameColor,fontSize:"10px" }}>
          {name}
        </span>
        <span
          className="ht-day-num"
          style={{
            color: numColor,
            fontWeight: isToday || isPinnedToday ? 700 : 400,
            opacity: isFuture ? 0.35 : 1,
          }}
        >
          {day}
        </span>
      </div>

      {habits.map((habit) => {
        const done = isCompleted(habit.id, day);
        return (
          <div
            key={habit.id}
            className="ht-cell"
            style={{ background: done ? habit.color + "18" : "transparent" }}
          >
            <button
              className={`ht-checkbox${done ? " done" : ""}`}
              onClick={() => toggle(habit.id, day)}
              style={{
                border: done
                  ? `1.5px solid ${habit.color}90`
                  : "1.5px solid #22223a",
                background: done ? habit.color + "28" : "transparent",
              }}
              aria-label={done ? "Mark incomplete" : "Mark complete"}
            >
              {done && (
                <span className="ht-check-icon" style={{ color: habit.color }}>
                  ✓
                </span>
              )}
            </button>
          </div>
        );
      })}

      <div className="ht-day-total">
        {dayTotal > 0 && (
          <span className="ht-day-total-num" style={{ color: totalColor }}>
            {dayTotal}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Main App ───────────────────────────────────────────────────────── */
export default function App() {
  const today = new Date();

  const [habits, setHabits] = useState(() => {
    try {
      const s = localStorage.getItem(K_HABITS);
      return s ? JSON.parse(s) : DEFAULT_HABITS;
    } catch {
      return DEFAULT_HABITS;
    }
  });
  const [completions, setCompletions] = useState(() => {
    try {
      const s = localStorage.getItem(K_DATA);
      return s ? JSON.parse(s) : {};
    } catch {
      return {};
    }
  });
  const [currentMonth, setCurrentMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [pinToday, setPinToday] = useState(false);
  const addInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(K_HABITS, JSON.stringify(habits));
  }, [habits]);
  useEffect(() => {
    localStorage.setItem(K_DATA, JSON.stringify(completions));
  }, [completions]);
  useEffect(() => {
    if (showAdd && addInputRef.current) addInputRef.current.focus();
  }, [showAdd]);

  const { year, month } = currentMonth;
  const daysCount = getDaysInMonth(year, month);
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();
  const daysTracked = isCurrentMonth ? today.getDate() : daysCount;
  const todayDate = today.getDate();

  const allDays = Array.from({ length: daysCount }, (_, i) => {
    const d = new Date(year, month, i + 1);
    return {
      day: i + 1,
      name: DAY_NAMES[d.getDay()],
      isToday: isCurrentMonth && todayDate === i + 1,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      isFuture: isCurrentMonth && i + 1 > todayDate,
    };
  });

  /* Pin today: move today's entry to position 0 */
  const orderedDays = (() => {
    if (!pinToday || !isCurrentMonth) return allDays;
    const todayEntry = allDays.find((d) => d.isToday);
    const rest = allDays.filter((d) => !d.isToday);
    return todayEntry ? [todayEntry, ...rest] : allDays;
  })();

  const isCompleted = useCallback(
    (habitId, day) => {
      const k = dateKey(year, month, day);
      return !!(completions[habitId] || {})[k];
    },
    [completions, year, month],
  );

  const toggle = useCallback(
    (habitId, day) => {
      const k = dateKey(year, month, day);
      setCompletions((prev) => ({
        ...prev,
        [habitId]: { ...(prev[habitId] || {}), [k]: !(prev[habitId] || {})[k] },
      }));
    },
    [year, month],
  );

  const getCompletionCount = (habitId) =>
    allDays.filter((d) => !d.isFuture && isCompleted(habitId, d.day)).length;

  const getDayTotal = (day) =>
    habits.filter((h) => isCompleted(h.id, day)).length;

  const prevMonth = () =>
    setCurrentMonth((p) =>
      p.month === 0
        ? { year: p.year - 1, month: 11 }
        : { ...p, month: p.month - 1 },
    );
  const nextMonth = () =>
    setCurrentMonth((p) =>
      p.month === 11
        ? { year: p.year + 1, month: 0 }
        : { ...p, month: p.month + 1 },
    );
  const goToday = () =>
    setCurrentMonth({ year: today.getFullYear(), month: today.getMonth() });

  const addHabit = () => {
    if (!newName.trim()) return;
    const color = HABIT_COLORS[habits.length % HABIT_COLORS.length];
    setHabits((p) => [...p, { id: uid(), name: newName.trim(), color }]);
    setNewName("");
    setShowAdd(false);
  };
  const deleteHabit = (id) => {
    if (!window.confirm("Delete this habit? All data will be removed.")) return;
    setHabits((p) => p.filter((h) => h.id !== id));
    setCompletions((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
  };
  const startEdit = (habit) => {
    setEditingId(habit.id);
    setEditValue(habit.name);
  };
  const saveEdit = () => {
    if (editValue.trim())
      setHabits((p) =>
        p.map((h) =>
          h.id === editingId ? { ...h, name: editValue.trim() } : h,
        ),
      );
    setEditingId(null);
  };
  const resetMonth = () => {
    if (!window.confirm(`Reset all data for ${MONTH_NAMES[month]} ${year}?`))
      return;
    setCompletions((prev) => {
      const next = { ...prev };
      habits.forEach((h) => {
        if (!next[h.id]) return;
        const filtered = {};
        Object.entries(next[h.id]).forEach(([k, v]) => {
          const [y, m] = k.split("-").map(Number);
          if (!(y === year && m === month + 1)) filtered[k] = v;
        });
        next[h.id] = filtered;
      });
      return next;
    });
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="ht-root">
        {/* ── Topbar ── */}
        <div className="ht-topbar">
          <div>
            <div className="ht-brand">Habit Tracker</div>
            <div className="ht-month-nav">
              <button className="ht-btn-ghost" onClick={prevMonth}>
                ←
              </button>
              <span className="ht-month-title">
                {MONTH_NAMES[month]}&nbsp;<span>{year}</span>
              </span>
              <button className="ht-btn-ghost" onClick={nextMonth}>
                →
              </button>
              {!isCurrentMonth && (
                <button className="ht-btn-today" onClick={goToday}>
                  Today
                </button>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span className="ht-topbar-meta">
              {habits.length} habits · {daysTracked}d tracked
            </span>

            {/* Pin Today toggle — only shown in current month */}
            {isCurrentMonth && (
              <button
                className={`ht-btn-pin${pinToday ? " active" : ""}`}
                onClick={() => setPinToday((p) => !p)}
                title={
                  pinToday
                    ? "Unpin today — restore normal order"
                    : "Pin today as first column"
                }
              >
                <span className="pin-dot" />
                {pinToday ? "Today Pinned" : "Pin Today"}
              </button>
            )}

            <button className="ht-btn-reset" onClick={resetMonth}>
              Reset Month
            </button>
            <button className="ht-btn-add" onClick={() => setShowAdd(true)}>
              + Add Habit
            </button>
          </div>
        </div>

        {/* ── Add bar ── */}
        {showAdd && (
          <div className="ht-add-bar">
            <input
              ref={addInputRef}
              className="ht-add-input"
              value={newName}
              placeholder="New habit name…"
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addHabit();
                if (e.key === "Escape") {
                  setShowAdd(false);
                  setNewName("");
                }
              }}
            />
            <button className="ht-btn-confirm" onClick={addHabit}>
              Add
            </button>
            <button
              className="ht-btn-cancel"
              onClick={() => {
                setShowAdd(false);
                setNewName("");
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── Body ── */}
        <div className="ht-body">
          {/* Left sidebar */}
          <div className="ht-left">
            <div className="ht-left-header">
              <span className="ht-col-label" style={{ fontSize: "12px" }}>Daily Habits</span>
              <span style={{ flex: 1 }} />
              <span className="ht-col-label" style={{ fontSize: "10px" }}>
                % · 🔥 · done
              </span>
            </div>

            <div className="ht-habits-list">
              {habits.length === 0 ? (
                <div className="ht-empty">
                  <div className="ht-empty-icon">🌱</div>
                  <div className="ht-empty-text">
                    No habits yet.
                    <br />
                    Click "+ Add Habit" to start.
                  </div>
                </div>
              ) : (
                habits.map((habit) => (
                  <HabitRow
                    key={habit.id}
                    habit={habit}
                    completionCount={getCompletionCount(habit.id)}
                    daysTracked={daysTracked}
                    streak={calcStreak(habit.id, completions)}
                    isEditing={editingId === habit.id}
                    editValue={editValue}
                    onEditChange={setEditValue}
                    onEditSave={saveEdit}
                    onStartEdit={() => startEdit(habit)}
                    onDelete={() => deleteHabit(habit.id)}
                  />
                ))
              )}
            </div>

            <div className="ht-totals-row-label">
              <span className="ht-col-label">Day Total</span>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="ht-grid">
            <div className="ht-grid-inner">
              {orderedDays.map(
                ({ day, name, isToday, isWeekend, isFuture }, idx) => (
                  <div key={day} style={{ display: "contents" }}>
                    <DayColumn
                      day={day}
                      name={name}
                      isToday={isToday}
                      isWeekend={isWeekend}
                      isFuture={isFuture}
                      isPinnedToday={pinToday && isCurrentMonth && isToday}
                      habits={habits}
                      isCompleted={isCompleted}
                      toggle={toggle}
                      dayTotal={getDayTotal(day)}
                      totalHabits={habits.length}
                    />
                    {/* Glowing separator after the pinned today column */}
                    {pinToday && isCurrentMonth && isToday && idx === 0 && (
                      <div className="ht-pin-divider" />
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
