import React, { useState } from 'react'
import BarProductsTab from './BarProductsTab'
// import BarOrdersTab from './BarOrdersTab' // Keyinchalik yoziladi
// import BarHistoryTab from './BarHistoryTab'
// import BarStatsTab from './BarStatsTab'

const TABS = [
  { key: 'orders', label: 'Заказы' },
  { key: 'products', label: 'Товары' },
  { key: 'history', label: 'История' },
  { key: 'stats', label: 'Статистика' },
]

export default function BarTabs() {
  const [activeTab, setActiveTab] = useState('orders')

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginTop: 24, marginBottom: 32 }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: activeTab === tab.key ? '#2163ff' : '#23243e',
              color: '#fff',
              border: 'none',
              padding: '10px 30px',
              borderRadius: 14,
              fontWeight: 600,
              fontSize: 18,
              boxShadow: activeTab === tab.key ? '0 2px 12px #1244ff33' : undefined,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {activeTab === 'orders' && (
          <div style={{
            minHeight: 180, borderRadius: 14, background: '#22243b', color: '#eee',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 500
          }}>
            {/* Zakazlar ro‘yxati (keyinchalik BarOrdersTab joylanadi) */}
            Заказов пока нет.
          </div>
        )}
        {activeTab === 'products' && (
          <BarProductsTab />
        )}
        {activeTab === 'history' && (
          <div style={{
            minHeight: 180, borderRadius: 14, background: '#22243b', color: '#eee',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 500
          }}>
            История пока нет.
          </div>
        )}
        {activeTab === 'stats' && (
          <div style={{
            minHeight: 180, borderRadius: 14, background: '#22243b', color: '#eee',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 500
          }}>
            Статистика скоро появится.
          </div>
        )}
      </div>
    </div>
  )
}
