import React from "react";

const FILTERS = [
  { label: "Весь период", value: "all" },
  { label: "Сегодня", value: "today" },
  { label: "Вчера", value: "yesterday" },
  { label: "Последняя неделя", value: "week" },
  { label: "Последний месяц", value: "month" },
];

export default function HistoryFilter({ value, onChange }) {
  return (
    <div style={{
      display: "flex", gap: 8, marginBottom: 14,
      justifyContent: "flex-end"
    }}>
      {FILTERS.map(f => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          style={{
            background: value === f.value ? "#4568bb" : "#23243e",
            color: "#fff", border: "none", borderRadius: 7,
            padding: "5px 16px", fontWeight: 500, cursor: "pointer"
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
