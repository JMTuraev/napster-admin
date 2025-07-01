// pages/timer/Timer.jsx

import React, { useEffect, useState } from 'react'
import ComputersTable from './ComputersTable'
import LevelPrice from './LevelPrice' // ⬅️ Narxlar komponenti

export default function TimerPage() {
  const [computers, setComputers] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await window.api.invoke('get-users')
        const now = new Date()

        const enrichedUsers = await Promise.all(
          users.map(async (user) => {
            const timer = await window.api.invoke('get-latest-timer', user.mac)

            if (!timer) {
              return {
                ...user,
                status: 'offline',
                timeLeft: null,
                mode: null
              }
            }

            const startTime = new Date(timer.start_time)
            const durationMs = timer.duration * 60 * 1000
            const endTime = new Date(startTime.getTime() + durationMs)
            const timeLeftMs = endTime - now

            return {
              ...user,
              status: timer.status,
              timeLeft: timeLeftMs > 0 ? timeLeftMs : 0,
              mode: timer.mode
            }
          })
        )

        setComputers(enrichedUsers)
      } catch (error) {
        console.error('❌ Maʼlumotlarni olishda xatolik:', error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-4 space-y-8">
      <div>
        <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🖥 Kompyuterlar va soatlar</span>
        </h1>
        <ComputersTable computers={computers} />
      </div>

      <div>
        <LevelPrice /> {/* 💰 Level narxlari */}
      </div>
    </div>
  )
}
