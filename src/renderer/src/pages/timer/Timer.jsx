import React, { useEffect, useState } from 'react'
import LevelPrice from './LevelPrice'

// Format ms → 00m 00s
function formatCountdown(ms) {
  if (!ms || ms < 0) return '0m 0s'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds}s`
}

// Pul o‘sishi (usuvchi narx, sekundda)
function calcGrowingPrice(durationUsedMs, pricePerHour) {
  if (!durationUsedMs || !pricePerHour) return 0
  const pricePerSecond = pricePerHour / 3600
  const sum = (durationUsedMs / 1000) * pricePerSecond
  return Math.floor(sum)
}

// Usuvchi vaqtni ko‘rsatish uchun
function formatUsedTime(ms) {
  if (!ms || ms < 0) return '0m 0s'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds}s`
}

export default function TimerPage() {
  const [computers, setComputers] = useState([])
  const [levelPrices, setLevelPrices] = useState([])
  const [activeAction, setActiveAction] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0) // har sekund refresh uchun

  // Ma'lumotlarni olish
  const fetchData = async () => {
    const users = await window.api.invoke('get-users')
    const now = new Date()
    const timers = await window.api.invoke('get-active-timers')
    const prices = await window.api.invoke('get-used-level-prices')
    setLevelPrices(prices)

    // Kompyuter + timer + narx + level
    const enriched = users.map(user => {
      const timer = timers.find(t => t.mac === user.mac && t.status === 'running')
      let timeLeft = null
      let timerDuration = null
      let timerStart = null
      let timerMode = null
      if (timer) {
        timerStart = new Date(timer.start_time)
        timerDuration = timer.duration
        timerMode = timer.mode
        const end = new Date(timerStart.getTime() + timer.duration * 1000)
        timeLeft = Math.max(0, end - now)
      }
      // Levelga mos narx (minute narxi, narx 1 SOAT uchun bo‘lsa!)
      const userLevelPrice = prices.find(p => p.level_id === user.level_id)
      const pricePerMinute = userLevelPrice ? (userLevelPrice.price / 60) : 50
      const pricePerHour = pricePerMinute * 60

      return {
        ...user,
        isRunning: !!timer,
        status: timer ? 'online' : 'offline',
        mode: timerMode,
        timeLeft,
        timerStart,
        timerDuration,
        pricePerMinute,
        pricePerHour,
        levelName: userLevelPrice?.name || '-'
      }
    })
    setComputers(enriched)
  }

  // Har sekund refresh uchun tick
  useEffect(() => {
    fetchData()
    const interval = setInterval(() => {
      setTick(t => t + 1)
      fetchData()
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Timer boshlash modal
  const handleStart = (user, type) => {
    setActiveAction({ type, mac: user.mac })
    setInputValue('')
    setError('')
  }

  // Timer saqlash
  const handleSave = async () => {
    if (!activeAction) return
    const mac = activeAction.mac
    let duration = 0
    let mode = activeAction.type
    let price = null

    // User va level narxini olish
    const user = computers.find(u => u.mac === mac)
    const pricePerMinute = user?.pricePerMinute || 50

    if (mode === 'time') {
      const minutes = parseInt(inputValue)
      if (!minutes || isNaN(minutes) || minutes <= 0) {
        setError('Iltimos, daqiqani to‘g‘ri kiriting')
        return
      }
      duration = minutes * 60
      price = null
    } else if (mode === 'money') {
      price = parseInt(inputValue)
      if (!price || isNaN(price) || price <= 0) {
        setError('Iltimos, summani to‘g‘ri kiriting')
        return
      }
      duration = Math.floor(price / pricePerMinute) * 60
      if (duration <= 0) {
        setError('Kiritilgan summa uchun vaqt yetarli emas')
        return
      }
    } else if (mode === 'vip') {
      duration = 24 * 60 * 60
      price = null
    }

    if (duration > 0) {
      await window.api.invoke('start-timer', {
        mac,
        duration,
        mode,
        price
      })
      setError('')
    } else {
      setError('Vaqt 0 dan katta bo‘lishi kerak')
      return
    }

    setActiveAction(null)
    setInputValue('')
    fetchData()
  }

  // Timer to‘xtatish
  const handleStop = async (user) => {
    const latest = await window.api.invoke('get-latest-timer', user.mac)
    if (latest?.status === 'running') {
      await window.api.invoke('stop-timer', latest.id)
      await fetchData()
    }
  }

  // UI uchun style
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '1.1rem',
    background: 'rgba(20, 20, 20, 0.8)',
    marginBottom: 30
  }
  const thtd = {
    border: '1px solid #444',
    padding: '8px 4px',
    textAlign: 'center'
  }
  const thStyle = {
    ...thtd,
    background: '#222',
    color: '#fff',
    fontWeight: 600
  }
  const btn = {
    border: 'none',
    borderRadius: 6,
    padding: '6px 14px',
    margin: '2px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer'
  }

  return (
    <div style={{ padding: 32, maxWidth: 920, margin: '0 auto' }}>
      <h1 style={{
        fontSize: '2.1rem',
        fontWeight: 700,
        marginBottom: 20,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <span role="img" aria-label="desktop">🖥</span> Kompyuterlar va soatlar
      </h1>
      <LevelPrice />
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Raqami</th>
            <th style={thStyle}>Level</th>
            <th style={thStyle}>Holati</th>
            <th style={thStyle}>Vaqt</th>
            <th style={thStyle}>Amallar</th>
          </tr>
        </thead>
        <tbody>
          {computers.map((comp, idx) => {
            const pricePerHour = comp.pricePerHour || 0
            // FOYDALANILGAN SEKUND (duration - qolgani)
            let durationUsedMs = 0
            if (comp.isRunning && comp.timerDuration != null && comp.timeLeft != null) {
              durationUsedMs = (comp.timerDuration * 1000) - comp.timeLeft
              if (durationUsedMs < 0) durationUsedMs = 0
            }
            // O‘suvchi narx (har soniyada yangilanadi)
            const priceGrow = comp.isRunning
              ? calcGrowingPrice(durationUsedMs, pricePerHour)
              : 0

            // VIP uchun ham usuvchi vaqt
            let elapsedMs = 0
            if (comp.isRunning && comp.timerStart && comp.mode === "vip") {
              elapsedMs = Date.now() - new Date(comp.timerStart).getTime()
              if (elapsedMs < 0) elapsedMs = 0
            }

            return (
              <tr key={comp.mac}>
                <td style={thtd}>{idx + 1}</td>
                <td style={thtd}>{comp.number}</td>
                <td style={thtd}>{comp.levelName}</td>
                <td style={thtd}>
                  {comp.isRunning
                    ? <span style={{ color: '#38d430', fontWeight: 600 }}>Online</span>
                    : <span style={{ color: '#ff4a4a', fontWeight: 600 }}>Offline</span>
                  }
                </td>
                <td style={thtd}>
                  {!comp.isRunning && "—"}
                  {comp.isRunning && (
                    <>
                      {/* TIME va MONEY uchun countdown va narx */}
                      {(comp.mode === "money" || comp.mode === "time") && (
                        <>
                          <span role="img" aria-label="hourglass">⏳</span> {formatCountdown(comp.timeLeft)}
                          <br />
                          <span style={{
                            fontSize: "1.3rem",
                            color: "#ffe14d",
                            fontWeight: 600,
                            letterSpacing: 1,
                            display: "block",
                            marginTop: 6
                          }}>
                            {priceGrow} so‘m
                          </span>
                        </>
                      )}
                      {/* VIP uchun usuvchi vaqt va narx */}
                      {comp.mode === "vip" && (
                        <>
                          <span style={{
                            fontSize: "1.25rem",
                            color: "#38d430",
                            fontWeight: 500,
                            letterSpacing: 1
                          }}>
                            {formatUsedTime(elapsedMs)}
                          </span>
                          <br />
                          <span style={{
                            fontSize: "1.3rem",
                            color: "#ffe14d",
                            fontWeight: 600,
                            letterSpacing: 1,
                            display: "block",
                            marginTop: 4
                          }}>
                            {calcGrowingPrice(elapsedMs, pricePerHour)} so‘m
                          </span>
                        </>
                      )}
                    </>
                  )}
                </td>
                <td style={thtd}>
                  {!comp.isRunning && (
                    <>
                      <button
                        style={{ ...btn, background: '#2196f3', color: '#fff' }}
                        onClick={() => handleStart(comp, 'time')}
                      >⏱ Vaqt</button>
                      <button
                        style={{ ...btn, background: '#ffe14d', color: '#222' }}
                        onClick={() => handleStart(comp, 'money')}
                      >💰 Pul</button>
                      <button
                        style={{ ...btn, background: '#b36cf7', color: '#fff' }}
                        onClick={() => handleStart(comp, 'vip')}
                      >🏆 VIP</button>
                    </>
                  )}
                  {comp.isRunning && (
                    <button
                      style={{ ...btn, background: '#ff4444', color: '#fff' }}
                      onClick={() => handleStop(comp)}
                    >⏹ Stop</button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {activeAction && (
        <div style={{
          background: 'rgba(40,40,40,0.95)',
          borderRadius: 12,
          padding: 22,
          color: '#fff',
          boxShadow: '0 4px 16px #0009',
          width: 310,
          maxWidth: '100%',
          margin: '24px auto 0',
          textAlign: 'center'
        }}>
          <p style={{ fontWeight: 600, marginBottom: 10 }}>
            {activeAction.type === 'money' && '💰 Qancha so‘m?'}
            {activeAction.type === 'time' && '⏱ Necha daqiqa?'}
            {activeAction.type === 'vip' && '🏆 VIP — 24 soat'}
          </p>
          {(activeAction.type === 'money' || activeAction.type === 'time') && (
            <input
              type="number"
              style={{
                padding: '6px 10px',
                borderRadius: 7,
                background: '#222',
                color: '#fff',
                border: '1px solid #555',
                marginRight: 8,
                fontSize: '1rem'
              }}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              autoFocus
            />
          )}
          {error && (
            <div style={{ color: '#ff7b7b', margin: '8px 0', fontSize: '0.98rem' }}>{error}</div>
          )}
          <button
            style={{ ...btn, background: '#38d430', color: '#222' }}
            onClick={handleSave}
          >Saqlash</button>
          <button
            style={{ ...btn, background: '#555', color: '#fff' }}
            onClick={() => { setActiveAction(null); setError('') }}
          >Bekor qilish</button>
        </div>
      )}
    </div>
  )
}
