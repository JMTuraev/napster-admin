import React, { useEffect, useState } from 'react'

// ⏳ Countdown formatlash
const formatCountdown = (ms) => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds}s`
}

// ⬆️ VIP usuvchi vaqt formatlash
const formatElapsed = (ms) => {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours}h ${minutes}m ${seconds}s`
}

export default function ComputersTable() {
  const [computers, setComputers] = useState([])
  const [levelPrices, setLevelPrices] = useState([])
  const [activeAction, setActiveAction] = useState(null)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    const loadData = async () => {
      const users = await window.api.invoke('get-users')
      const levels = await window.api.invoke('get-levels')
      const prices = await window.api.invoke('get-used-level-prices')
      const timers = await window.api.invoke('get-active-timers')
      const now = new Date()

      setLevelPrices(prices)

      const enriched = users.map((user) => {
        const level = levels.find((lvl) => lvl.id === user.level_id)
        const timer = timers.find((t) => t.mac === user.mac && t.status === 'running')

        const start = timer?.start_time ? new Date(timer.start_time) : null
        const duration = timer?.duration || 0
        const mode = timer?.mode || null

        const levelPrice = prices.find((p) => p.level_id === user.level_id)
        const pricePerMinute = levelPrice?.price ? levelPrice.price / 60 : 0

        let elapsedMs = start ? now - start : 0
        let remainingMs = duration * 1000 - elapsedMs

        let dynamicPrice = 0
        if (mode === 'money' || mode === 'vip') {
          const elapsedMinutes = elapsedMs / 1000 / 60
          dynamicPrice = Math.floor(elapsedMinutes * pricePerMinute)
        }

        return {
          ...user,
          level_name: level?.name || '—',
          isRunning: !!timer,
          mode,
          remainingTime: mode === 'vip' ? elapsedMs : Math.max(0, remainingMs),
          price: dynamicPrice,
          pricePerMinute
        }
      })

      setComputers(enriched)
    }

    loadData()
    const interval = setInterval(loadData, 1000)
    return () => clearInterval(interval)
  }, [])

  const handlePay = (user) => {
    setActiveAction({ type: 'money', mac: user.mac })
    setInputValue('')
  }

  const handleTime = (user) => {
    setActiveAction({ type: 'time', mac: user.mac })
    setInputValue('')
  }

  const handleVIP = async (user) => {
    await window.api.invoke('start-timer', {
      mac: user.mac,
      start_time: new Date().toISOString(),
      duration: 60 * 60 * 24,
      mode: 'vip',
      price: null
    })
  }

  const handleSave = async () => {
    if (!activeAction || !inputValue) return

    const user = computers.find((c) => c.mac === activeAction.mac)
    const pricePerMinute = user?.pricePerMinute || 0
    const isMoney = activeAction.type === 'money'
    const amount = parseInt(inputValue)

    const seconds = isMoney
      ? Math.floor((amount / pricePerMinute) * 60)
      : amount * 60

    await window.api.invoke('start-timer', {
      mac: user.mac,
      start_time: new Date().toISOString(),
      duration: seconds,
      mode: activeAction.type,
      price: isMoney ? amount : null
    })

    setActiveAction(null)
    setInputValue('')
  }

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">🖥 Kompyuterlar va soatlar</h1>

      <table className="w-full table-auto border border-gray-600 text-sm mb-4">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="px-2 py-1 border">#</th>
            <th className="px-2 py-1 border">Raqami</th>
            <th className="px-2 py-1 border">Xona</th>
            <th className="px-2 py-1 border">Holati</th>
            <th className="px-2 py-1 border">Vaqt / Pul</th>
            <th className="px-2 py-1 border">Amallar</th>
          </tr>
        </thead>
        <tbody>
          {computers.map((comp, index) => (
            <tr key={comp.mac} className="text-center bg-black/50 text-white">
              <td className="px-2 py-1 border">{index + 1}</td>
              <td className="px-2 py-1 border">{comp.number}</td>
              <td className="px-2 py-1 border">{comp.level_name}</td>
              <td className="px-2 py-1 border">
                {comp.status === 'online' ? (
                  <span className="text-green-400">online</span>
                ) : (
                  <span className="text-red-400">offline</span>
                )}
              </td>
              <td className="px-2 py-1 border">
                {comp.isRunning ? (
                  comp.mode === 'vip' ? (
                    <>
                      ⬆️ {formatElapsed(comp.remainingTime)} <br /> 💸 {comp.price} so‘m
                    </>
                  ) : (
                    <>
                      ⏳ {formatCountdown(comp.remainingTime)} <br /> 💸 {comp.price} so‘m
                    </>
                  )
                ) : (
                  '—'
                )}
              </td>
              <td className="px-2 py-1 border space-x-1">
                <button
                  onClick={() => handlePay(comp)}
                  className="bg-yellow-500 px-2 rounded text-black"
                >
                  💰 Pul
                </button>
                <button
                  onClick={() => handleTime(comp)}
                  className="bg-blue-500 px-2 rounded text-white"
                >
                  ⏱ Vaqt
                </button>
                <button
                  onClick={() => handleVIP(comp)}
                  className="bg-purple-600 px-2 rounded text-white"
                >
                  🏆 VIP
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {activeAction && (
        <div className="bg-white/10 p-4 rounded text-white">
          <p className="font-semibold mb-1">
            {activeAction.type === 'money' && '💰 Necha so‘m berilsin?'}
            {activeAction.type === 'time' && '⏱ Necha daqiqa berilsin?'}
          </p>
          <input
            type="number"
            className="px-2 py-1 bg-black/50 border rounded w-32 text-white"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            onClick={handleSave}
            className="ml-2 bg-green-500 px-4 py-1 rounded text-black"
          >
            Saqlash
          </button>
          <button
            onClick={() => setActiveAction(null)}
            className="ml-2 bg-gray-600 px-4 py-1 rounded text-white"
          >
            Bekor qilish
          </button>
        </div>
      )}
    </div>
  )
}
