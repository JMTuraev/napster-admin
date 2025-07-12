import { useState } from 'react'
import Games from './pages/games/Games'
import Timer from './pages/timer/Timer'
import Stats from './pages/Stats'
import Bookings from './pages/Bookings'
import Bar from './pages/bar/Bar' 
import Computers from './pages/Computers'

export default function App() {
  const [activePage, setActivePage] = useState('games')

  const renderPage = () => {
    switch (activePage) {
      case 'computers': return <Computers />
      case 'games': return <Games />
      case 'timer': return <Timer />
      case 'stats': return <Stats />
      case 'bookings': return <Bookings />
      case 'bar': return <Bar />
      default: return <Games />
    }
  }

  return (
    <div>
      {/* 🔼 Horizontal menyu */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        padding: '10px',
        borderBottom: '1px solid gray'
      }}>
        <button onClick={() => setActivePage('computers')}>🖥 Компьютеры</button>
        <button onClick={() => setActivePage('games')}>🎮 Игры</button>
        <button onClick={() => setActivePage('timer')}>⏱ Время</button>
        <button onClick={() => setActivePage('stats')}>📊 Статистика</button>
        <button onClick={() => setActivePage('bookings')}>📅 Бронь</button>
        <button onClick={() => setActivePage('bar')}>👨‍🍳 Бар</button>
      </div>

      {/* 🔽 Sahifa kontenti */}
      <div style={{ padding: '20px' }}>
        {renderPage()}
      </div>
    </div>
  )
}
