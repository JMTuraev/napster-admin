import { useState } from 'react'
import {
  Monitor,
  Gamepad2,
  Clock3,
  BarChart4,
  Calendar,
  Utensils,
  Shield
} from 'lucide-react'
import Games from './pages/games/Games'
import Timer from './pages/timer/Timer'
import Stats from './pages/Stats'
import Bookings from './pages/Bookings'
import Bar from './pages/bar/Bar'
import Computers from './pages/Computers'
import OwnerPasswordPanel from './pages/Owner' // Yangi komponent

const NAV_ITEMS = [
  { key: 'computers', label: 'Компьютеры', icon: <Monitor size={20} /> },
  { key: 'games', label: 'Игры', icon: <Gamepad2 size={20} /> },
  { key: 'timer', label: 'Время', icon: <Clock3 size={20} /> },
  { key: 'stats', label: 'Статистика', icon: <BarChart4 size={20} /> },
  { key: 'bookings', label: 'Бронь', icon: <Calendar size={20} /> },
  { key: 'bar', label: 'Бар', icon: <Utensils size={20} /> },
  { key: 'owner', label: 'Владелец', icon: <Shield size={20} /> }, // Icon qo'shildi!
]

export default function App() {
  const [activePage, setActivePage] = useState('games')
  const [hovered, setHovered] = useState(null)

  const renderPage = () => {
    switch (activePage) {
      case 'computers': return <Computers />
      case 'games': return <Games />
      case 'timer': return <Timer />
      case 'stats': return <Stats />
      case 'bookings': return <Bookings />
      case 'bar': return <Bar />
      case 'owner': return <OwnerPasswordPanel />    // Yangi case
      default: return <Games />
    }
  }

  const activeBg = "#347CFF"
  const activeShadow = "0 2px 18px 0 #347cff66, 0 0px 0 2px #347cff33"
  const SIDE_PADDING = 40
  const TOP_MARGIN = 14

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
        background: 'none'
      }}
    >
      {/* Sticky/fixed Navbar */}
      <div
        style={{
          position: 'fixed',
          top: TOP_MARGIN,
          left: 0,
          width: '100vw',
          zIndex: 99,
          background: 'transparent',
          display: 'flex',
          justifyContent: 'flex-start',
          padding: 0,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '14px',
            padding: `13px ${SIDE_PADDING}px 13px ${SIDE_PADDING}px`,
            pointerEvents: 'auto'
          }}
        >
          {NAV_ITEMS.map(({ key, label, icon }) => {
            const isActive = activePage === key
            const isHover = hovered === key

            return (
              <button
                key={key}
                onClick={() => setActivePage(key)}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: isActive ? '#fff' : isHover ? '#347CFF' : '#b6b6c2',
                  background: isActive
                    ? activeBg
                    : isHover
                      ? 'rgba(33, 37, 54, 0.85)'
                      : '#23242e',
                  border: 'none',
                  borderRadius: isActive ? '16px' : '13px',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '16px',
                  padding: isActive ? '10px 26px' : '8px 22px',
                  cursor: 'pointer',
                  outline: 'none',
                  margin: 0,
                  boxShadow: isActive ? activeShadow : isHover ? '0 2px 8px 0 #347cff33' : 'none',
                  position: 'relative',
                  minWidth: 120,
                  justifyContent: 'center',
                  letterSpacing: '0.03em',
                  transition: 'all 0.18s cubic-bezier(.45,1,.3,1)',
                }}
                onMouseDown={e => (e.target.style.transform = 'scale(0.96)')}
                onMouseUp={e => (e.target.style.transform = 'scale(1)')}
                onMouseLeave={e => (e.target.style.transform = 'scale(1)')}
              >
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  ...(isActive
                    ? {
                      filter: 'drop-shadow(0 0 8px #347cffbb)',
                      fontWeight: 700,
                      fontSize: 20,
                      marginRight: 3,
                    }
                    : {})
                }}>
                  {icon}
                </span>
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          marginTop: `${70 + TOP_MARGIN}px`,
          width: '100%',
          padding: `0 ${SIDE_PADDING}px`,
        }}
      >
        {renderPage()}
      </div>
    </div>
  )
}
