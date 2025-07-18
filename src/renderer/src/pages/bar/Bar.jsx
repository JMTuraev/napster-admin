import React, { useState } from 'react'
import BarProductsTab from './BarProductsTab'
import GoodsReceiptTab from './GoodsReceiptTab'
// import BarOrdersTab from './BarOrdersTab'
// import BarHistoryTab from './BarHistoryTab'
// import BarStatsTab from './BarStatsTab'

const TABS = [
  { key: 'orders', label: 'Заказы' },           // Zakazi
  { key: 'products', label: 'Товары' },         // Tovari
  { key: 'goods-receipt', label: 'Приход' },    // Goods Receipt
  { key: 'history', label: 'История' },         // Istoriya
  { key: 'stats', label: 'Статистика' }         // Statistika
]

export default function Bar() {
  const [activeTab, setActiveTab] = useState('products') // Default: "Товары"

  return (
    <div style={{ width: '100%', minHeight: '100vh' }}>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 12,
        padding: '32px 0 18px 36px',
        background: 'transparent'
      }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '9px 28px',
              borderRadius: 15,
              border: 'none',
              background: activeTab === tab.key ? '#196cff' : '#23243e',
              color: activeTab === tab.key ? '#fff' : '#bfc7e1',
              fontWeight: activeTab === tab.key ? 700 : 500,
              fontSize: 19,
              boxShadow: activeTab === tab.key ? '0 4px 32px #196cff25' : 'none',
              transition: 'background 0.13s, color 0.13s, box-shadow 0.14s',
              cursor: activeTab === tab.key ? 'default' : 'pointer'
            }}
            disabled={activeTab === tab.key}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div>
        {activeTab === 'products' && <BarProductsTab />}
        {activeTab === 'goods-receipt' && <GoodsReceiptTab />}
        {/* {activeTab === 'orders' && <BarOrdersTab />} */}
        {/* {activeTab === 'history' && <BarHistoryTab />} */}
        {/* {activeTab === 'stats' && <BarStatsTab />} */}
      </div>
    </div>
  )
}
