import React, { useEffect, useState } from "react";

// ms → 00:00:00 format
function formatElapsed(ms) {
  if (!ms || ms < 0) return "0:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

// O‘suvchi narx (sekund, soat narxi)
function calcGrowingPrice(durationUsedMs, pricePerHour) {
  if (!durationUsedMs || !pricePerHour) return 0;
  const pricePerSecond = pricePerHour / 3600;
  const sum = (durationUsedMs / 1000) * pricePerSecond;
  return Math.floor(sum);
}

export default function TimerTable({
  computers,
  onStart,
  onStop,
  btn,
  thtd,
  thStyle,
}) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const intv = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(intv);
  }, []);

  return (
    <tbody>
      {computers.map((comp, idx) => {
        // Pul narxi: soat narxi (minute narxi * 60)
        const pricePerHour = (comp.pricePerMinute || 0) * 60;

        // Boshlanganidan beri ishlatilgan vaqt (sekund)
        let durationUsedMs = 0;
        if (comp.isRunning) {
          if (comp.timerStart) {
            // Aniqroq: start_time ni yozib yuboring computers massivida
            durationUsedMs = Date.now() - new Date(comp.timerStart).getTime();
          } else if (comp.duration && comp.timeLeft != null) {
            // fallback: duration - timeLeft
            durationUsedMs = ((comp.duration ?? 0) * 1000) - (comp.timeLeft ?? 0);
          }
          if (durationUsedMs < 0) durationUsedMs = 0;
        }
        const elapsedLabel = formatElapsed(durationUsedMs);
        const priceGrow = calcGrowingPrice(durationUsedMs, pricePerHour);

        return (
          <tr key={comp.mac}>
            <td style={thtd}>{idx + 1}</td>
            <td style={thtd}>{comp.number}</td>
            <td style={thtd}>{comp.levelName}</td>
            <td style={thtd}>
              {comp.isRunning
                ? <span style={{ color: "#38d430", fontWeight: 600 }}>Online</span>
                : <span style={{ color: "#ff4a4a", fontWeight: 600 }}>Offline</span>
              }
            </td>
            <td style={thtd}>
              {!comp.isRunning && "—"}
              {comp.isRunning && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {/* Dynamic usuvchi vaqt */}
                  <span style={{
                    fontWeight: 500,
                    fontSize: "1.2rem",
                    color: "#7cf",
                    letterSpacing: 1,
                    marginBottom: 2,
                  }}>
                    {elapsedLabel}
                  </span>
                  {/* Dynamic usuvchi narx */}
                  <span style={{
                    fontSize: "1.4rem",
                    color: "#ffe14d",
                    fontWeight: 700,
                    letterSpacing: 1,
                  }}>
                    {priceGrow} so‘m
                  </span>
                </div>
              )}
            </td>
            <td style={thtd}>
              {!comp.isRunning && (
                <>
                  <button
                    style={{ ...btn, background: "#2196f3", color: "#fff" }}
                    onClick={() => onStart(comp, "time")}
                  >
                    ⏱ Vaqt
                  </button>
                  <button
                    style={{ ...btn, background: "#ffe14d", color: "#222" }}
                    onClick={() => onStart(comp, "money")}
                  >
                    💰 Pul
                  </button>
                  <button
                    style={{ ...btn, background: "#b36cf7", color: "#fff" }}
                    onClick={() => onStart(comp, "vip")}
                  >
                    🏆 VIP
                  </button>
                </>
              )}
              {comp.isRunning && (
                <button
                  style={{ ...btn, background: "#ff4444", color: "#fff" }}
                  onClick={() => onStop(comp)}
                >
                  ⏹ Stop
                </button>
              )}
            </td>
          </tr>
        );
      })}
    </tbody>
  );
}
