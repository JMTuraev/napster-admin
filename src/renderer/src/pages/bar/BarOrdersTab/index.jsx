import { useState } from 'react'
import OrdersList from './OrderList'
import BarMenuPanel from './BarMenuPanel'
import OrderCart from './OrderCart'

// MOCK DATA shu yerning o‘zida!
const MOCK_ORDERS = [
  {
    id: 101,
    computer: 4,
    status: 'не оплачен',
    items: [
      { id: 1, name: 'Coca-cola', qty: 2, price: 9000, sum: 18000 },
      { id: 2, name: 'Burger', qty: 1, price: 25000, sum: 25000 },
    ],
    total: 43000,
    created_at: '2025-07-19 15:26:12',
    user: 'Kompyuter 4',
  },
    {
    id: 101,
    computer: 4,
    status: 'не оплачен',
    items: [
      { id: 1, name: 'Coca-cola', qty: 2, price: 9000, sum: 18000 },
      { id: 2, name: 'Burger', qty: 1, price: 25000, sum: 25000 },
    ],
    total: 43000,
    created_at: '2025-07-19 15:26:12',
    user: 'Kompyuter 4',
  },
    {
    id: 101,
    computer: 4,
    status: 'не оплачен',
    items: [
      { id: 1, name: 'Coca-cola', qty: 2, price: 9000, sum: 18000 },
      { id: 2, name: 'Burger', qty: 1, price: 25000, sum: 25000 },
    ],
    total: 43000,
    created_at: '2025-07-19 15:26:12',
    user: 'Kompyuter 4',
  },
    {
    id: 101,
    computer: 4,
    status: 'не оплачен',
    items: [
      { id: 1, name: 'Coca-cola', qty: 2, price: 9000, sum: 18000 },
      { id: 2, name: 'Burger', qty: 1, price: 25000, sum: 25000 },
    ],
    total: 43000,
    created_at: '2025-07-19 15:26:12',
    user: 'Kompyuter 4',
  },
    {
    id: 101,
    computer: 4,
    status: 'не оплачен',
    items: [
      { id: 1, name: 'Coca-cola', qty: 2, price: 9000, sum: 18000 },
      { id: 2, name: 'Burger', qty: 1, price: 25000, sum: 25000 },
    ],
    total: 43000,
    created_at: '2025-07-19 15:26:12',
    user: 'Kompyuter 4',
  },
  {
    id: 102,
    computer: 7,
    status: 'оплачен',
    items: [
      { id: 5, name: 'Fanta', qty: 1, price: 9000, sum: 9000 },
      { id: 3, name: 'Shashlik', qty: 2, price: 28000, sum: 56000 },
    ],
    total: 65000,
    created_at: '2025-07-19 14:17:03',
    user: 'Kompyuter 7',
  }
]

const MOCK_PRODUCTS = [
  { id: 1, name: 'Coca-cola', tab_id: 1, sell_price: 9000, remain: 33 },
  { id: 2, name: 'Fanta', tab_id: 1, sell_price: 9000, remain: 18 },
  { id: 3, name: 'Shashlik', tab_id: 2, sell_price: 28000, remain: 7 },
  { id: 4, name: 'Burger', tab_id: 1, sell_price: 25000, remain: 11 },
  { id: 5, name: 'Chips', tab_id: 3, sell_price: null, remain: 22 },
]

const MOCK_TABS = [
  { id: 1, name: 'tab 1' },
  { id: 2, name: 'tab 2' },
  { id: 3, name: 'tab 3' },
  { id: 4, name: 'tab 4' },
  { id: 5, name: 'tab 5' },
]

export default function BarOrdersTab() {
  // Temporary mock state (UI uchun)
  const [selectedTabId, setSelectedTabId] = useState(1)
  const [cart, setCart] = useState([]) // {productId, qty, ...}
  const [orders, setOrders] = useState(MOCK_ORDERS)
  const [products, setProducts] = useState(MOCK_PRODUCTS)
  const [tabs, setTabs] = useState(MOCK_TABS)

  // Buyurtma qilish tugmasi bosilganda yangi order qoshish logikasi (mock)
  const handleOrder = () => {
    if (!cart.length) return
    // Cartdan order tuzish (oddiy, realda id va vaqt, user keladi)
    const items = cart.map(item => {
      const prod = products.find(p => p.id === item.productId)
      return {
        id: item.productId,
        name: prod ? prod.name : '',
        qty: item.qty,
        price: prod ? prod.sell_price : 0,
        sum: (prod ? prod.sell_price : 0) * item.qty
      }
    })
    const total = items.reduce((sum, item) => sum + item.sum, 0)
    const newOrder = {
      id: Math.max(100, ...orders.map(o => o.id)) + 1,
      computer: 1, // mock
      status: 'не оплачен',
      items,
      total,
      created_at: new Date().toLocaleString(),
      user: 'Kompyuter 1',
    }
    setOrders([newOrder, ...orders])
    setCart([])
  }

  return (
    <div style={{ display: 'flex', gap: 36 }}>
      <div style={{ flex: 1.2 }}>
        <OrdersList
          orders={orders}
          cartCard={
            <OrderCart
              cart={cart}
              setCart={setCart}
              products={products}
              onOrder={handleOrder}
            />
          }
        />
      </div>
      <div style={{ flex: 2.1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <BarMenuPanel
          selectedTabId={selectedTabId}
          setSelectedTabId={setSelectedTabId}
          cart={cart}
          setCart={setCart}
          products={products}
          tabs={tabs}
        />
      </div>
    </div>
  )
}
