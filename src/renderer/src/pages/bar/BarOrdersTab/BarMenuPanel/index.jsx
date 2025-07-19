import React, { useState, useRef, useEffect } from 'react'
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
  useDroppable
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const MENU_ACTIONS = [
 
  { key: 'edit-price', label: 'Изменить цену' }
]

// --- Raqamlarni formatlash: 1234567 => 1 234 567
function numberWithSpaces(x) {
  if (!x) return ''
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// --- Tab uchun droppable zona
function TabDropZone({ tabId }) {
  const { setNodeRef, isOver } = useDroppable({ id: `tab-${tabId}` })
  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 14,
        minWidth: 110,
        background: isOver ? '#377cfb44' : 'transparent',
        borderRadius: 8,
        marginBottom: 2,
        transition: 'background .13s',
        cursor: 'pointer'
      }}
    />
  )
}

// --- Sortable mahsulot kartasi
function SortableItem({ product, onMenuOpen, handleItemClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: product.id })

  const hasPrice = !!(product.sell_price && product.sell_price > 0)
  const isQtyZero = Number(product.remain) === 0
  const isDisabled = !hasPrice
  let borderColor = isDisabled
    ? '#f34747'
    : (isQtyZero ? '#ffae47' : '#316fff')
  let borderStyle = isDisabled
    ? '1.6px dashed'
    : (isQtyZero ? '1.7px solid' : '1.5px solid')
  let background = isDisabled
    ? '#25171b'
    : (isQtyZero ? '#2e1e11' : '#21243b')

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background,
        boxShadow: isDisabled
          ? '0 2px 10px #f3474722'
          : (isQtyZero
            ? '0 2px 10px #ffae4744'
            : '0 2px 12px #175eb444'),
        border: `${borderStyle} ${borderColor}`,
        borderRadius: 13,
        padding: '12px 10px 10px 13px',
        minWidth: 136,
        minHeight: 154,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        position: 'relative',
        cursor: isDisabled ? 'not-allowed' : 'grab'
      }}
      {...attributes}
      {...listeners}
      tabIndex={0}
      onClick={() => {
        if (!isDisabled) handleItemClick(product)
      }}
      title={
        isDisabled
          ? 'Товар временно отключен (нет цены). Меню (3 nuqta) orqali narx kiriting!'
          : 'Перетащить или добавить в корзину'
      }
    >
      {/* 3 nuqta menyu */}
      <div
        onClick={e => {
          e.stopPropagation()
          // Koordinata va productni yuboramiz
          const rect = e.currentTarget.getBoundingClientRect()
          onMenuOpen(e, product, rect)
        }}
        style={{
          position: 'absolute', top: 7, right: 7,
          width: 19, height: 19,
          borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10
        }}
        tabIndex={-1}
        title="Меню"
      >
        <span style={{
          display: 'inline-block', fontSize: 13, color: '#98a6cc', fontWeight: 900
        }}>
          &#8942;
        </span>
      </div>
      <div style={{
        fontWeight: 700,
        fontSize: 15,
        color: isDisabled ? '#f34747' : (isQtyZero ? '#ffa140' : '#fff'),
        marginBottom: 4, marginTop: 2
      }}>
        {product.name}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        width: '100%', margin: '12px 0 16px 0', minHeight: 48
      }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            style={{ width: 90, height: 90, objectFit: 'contain' }}
            onError={e => { e.target.style.display = 'none' }}
          />
        ) : (
          <span style={{
            fontSize: 34,
            color: isDisabled ? '#f34747' : (isQtyZero ? '#ffae47' : '#58bcff'),
            opacity: 0.75
          }}>📦</span>
        )}
      </div>
      <div style={{
        position: 'absolute', left: 10, bottom: 9,
        display: 'flex', alignItems: 'center', gap: 11, fontSize: 13.3, fontWeight: 500
      }}>
        <span style={{ color: isQtyZero ? '#ffae47' : (isDisabled ? '#ff8585' : '#68eab2') }}>к-во: {product.remain}</span>
        <span style={{
          color: isDisabled ? '#ff8585' : '#ffd990',
          fontWeight: 700
        }}>
          {hasPrice ? `${numberWithSpaces(product.sell_price)} сум` : ''}
        </span>
      </div>
    </div>
  )
}

export default function BarMenuPanel({ cart, setCart }) {
  const [tabs, setTabs] = useState([])
  const [products, setProducts] = useState([])
  const [selectedTabId, setSelectedTabId] = useState(null)
  const [editingTabId, setEditingTabId] = useState(null)
  const [tabEditVal, setTabEditVal] = useState('')
  const [menuAnchor, setMenuAnchor] = useState(null) // {id, product, coords}
  const menuRef = useRef()
  const [editingPriceId, setEditingPriceId] = useState(null)
  const [priceVal, setPriceVal] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  async function fetchTabs() {
    const data = await window.api.invoke('tabs-menu/get')
    setTabs(data || [])
    if ((!selectedTabId || !data.find(t => t.id === selectedTabId)) && data && data.length > 0)
      setSelectedTabId(data[0].id)
  }
  async function fetchProducts() {
    const data = await window.api.invoke('bar-items/get')
    setProducts(data || [])
  }

  useEffect(() => { fetchTabs(); fetchProducts() }, [])
  useEffect(() => {
    if (!menuAnchor) return
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAnchor(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuAnchor])

  const handleTabDoubleClick = (tab) => {
    setEditingTabId(tab.id)
    setTabEditVal(tab.name)
  }
  const handleTabEditSave = async (tab) => {
    if (!tabEditVal.trim()) return
    await window.api.invoke('tabs-menu/update', { ...tab, name: tabEditVal.trim() })
    setEditingTabId(null)
    fetchTabs()
  }

  // Tabdagi mahsulotlarni mapping
  const tabProductsMap = tabs.reduce((acc, tab) => {
    acc[tab.id] = products
      .filter(p => p.tab_id === tab.id)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    return acc
  }, {})

  const handleItemClick = (product) => {
    if (!product.sell_price || product.sell_price <= 0) return
    const exists = cart.find(item => item.productId === product.id)
    if (exists) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, qty: item.qty + 1 }
          : item
      ))
    } else {
      setCart([...cart, { productId: product.id, qty: 1 }])
    }
  }
  // --- Menyu ochish: coords bilan
  const handleMenuOpen = (e, product, rect) => {
    setMenuAnchor({
      id: product.id,
      product,
      coords: {
        top: rect.bottom + window.scrollY + 6, // item pastidan chiqsin
        left: rect.left + rect.width / 2 + window.scrollX - 110 // markazga yaqin
      }
    })
  }

  const handleMenuAction = async (action) => {
    if (!menuAnchor) return
    const { product } = menuAnchor

    if (action.key === 'edit-price') {
      setEditingPriceId(product.id)
      setPriceVal(product.sell_price ? numberWithSpaces(product.sell_price) : '')
      setMenuAnchor(null)
      return
    }
    if (action.key === 'move') {
      const newTabId = tabs.length > 1 ? tabs.find(t => t.id !== product.tab_id)?.id : product.tab_id
      if (newTabId && newTabId !== product.tab_id) {
        await window.api.invoke('bar-items/update', { ...product, tab_id: newTabId })
        fetchProducts()
      }
    }
    setMenuAnchor(null)
  }

  // --- Formatted input: faqat raqam va probel bilan yoziladi
  const handlePriceInputChange = e => {
    let val = e.target.value.replace(/[^\d]/g, '') // faqat raqam
    // Formatlash: 1234567 => 1 234 567
    val = numberWithSpaces(val)
    setPriceVal(val)
  }

  const handlePriceSave = async (productId) => {
    // Naq raqam qilib yuboramiz (probel olib tashlanadi)
    const newPrice = Number(priceVal.replace(/\s/g, ''))
    if (!newPrice || newPrice <= 0) return
    const product = products.find(p => p.id === productId)
    if (!product) return
    await window.api.invoke('bar-items/update', { ...product, sell_price: newPrice })
    setEditingPriceId(null)
    setPriceVal('')
    fetchProducts()
  }

  // DRAG END: tabdan tabga va tartib
  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over) return

    // Tab drop zone (over.id = 'tab-123')
    if (typeof over.id === 'string' && over.id.startsWith('tab-')) {
      const tabId = Number(over.id.replace('tab-', ''))
      const prod = products.find(p => p.id === active.id)
      if (prod && prod.tab_id !== tabId) {
        const destTabProducts = products.filter(p => p.tab_id === tabId)
        const newSortOrder = destTabProducts.length
        await window.api.invoke('bar-items/update', { ...prod, tab_id: tabId, sort_order: newSortOrder })
        fetchProducts()
      }
      return
    }

    // Bir tab ichida tartib
    const activeProd = products.find(p => p.id === active.id)
    const overProd = products.find(p => p.id === over.id)
    if (!activeProd || !overProd || activeProd.tab_id !== overProd.tab_id) return

    const currentList = tabProductsMap[activeProd.tab_id].map(p => p.id)
    const oldIdx = currentList.indexOf(active.id)
    const newIdx = currentList.indexOf(over.id)
    const newOrder = arrayMove(currentList, oldIdx, newIdx)

    for (let i = 0; i < newOrder.length; ++i) {
      const prod = products.find(p => p.id === newOrder[i])
      if (!prod) continue
      await window.api.invoke('bar-items/update', { ...prod, sort_order: i })
    }
    fetchProducts()
  }

  return (
    <div style={{ paddingBottom: 125 }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {/* Tabs + DropZone */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
          {tabs.map(tab => (
            <div
              key={tab.id}
              style={{
                position: 'relative',
                display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}
            >
              {/* DROP ZONE */}
              <TabDropZone tabId={tab.id} />
              <div
                onClick={() => setSelectedTabId(tab.id)}
                onDoubleClick={() => handleTabDoubleClick(tab)}
                style={{
                  padding: '6px 20px',
                  borderRadius: 11,
                  background: selectedTabId === tab.id ? '#1659d8' : '#23243a',
                  color: selectedTabId === tab.id ? '#fff' : '#a4bbff',
                  fontWeight: selectedTabId === tab.id ? 700 : 500,
                  fontSize: 15,
                  boxShadow: selectedTabId === tab.id ? '0 2px 15px #1659d822' : 'none',
                  cursor: 'pointer',
                  userSelect: 'none',
                  position: 'relative'
                }}
                tabIndex={0}
              >
                {editingTabId === tab.id ? (
                  <input
                    value={tabEditVal}
                    autoFocus
                    onBlur={() => handleTabEditSave(tab)}
                    onChange={e => setTabEditVal(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleTabEditSave(tab)
                    }}
                    style={{
                      fontSize: 15,
                      padding: '3px 7px',
                      borderRadius: 7,
                      border: '1px solid #3862a1'
                    }}
                  />
                ) : (
                  tab.name
                )}
              </div>
            </div>
          ))}
        </div>

        {/* MAHSULOTLAR LISTI */}
        <SortableContext
          items={(tabProductsMap[selectedTabId] || []).map(p => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 15,
              minHeight: 160,
              paddingBottom: 100,
              maxHeight: 'calc(100vh - 210px)',
              overflowY: 'auto'
            }}
          >
            {(tabProductsMap[selectedTabId] || []).length === 0 ? (
              <div style={{
                color: '#a4b0cb', fontSize: 15, padding: 13, background: '#181926', borderRadius: 8
              }}>
                Нет товаров в этом табе.
              </div>
            ) : (
              tabProductsMap[selectedTabId].map(product =>
                <SortableItem
                  key={product.id}
                  product={product}
                  onMenuOpen={handleMenuOpen}
                  handleItemClick={handleItemClick}
                />
              )
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Price edit modal */}
      {editingPriceId && (() => {
        const product = products.find(p => p.id === editingPriceId)
        if (!product) return null
        return (
          <div
            style={{
              position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, zIndex: 999,
              background: '#232538cc',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <div style={{
              background: '#181926', borderRadius: 8, padding: 22,
              minWidth: 250, textAlign: 'center', boxShadow: '0 8px 44px #10142333'
            }}>
              <div style={{ color: '#c9d6ff', marginBottom: 11, fontWeight: 600 }}>Изменить цену</div>
              <input
                type="text"
                inputMode="numeric"
                value={priceVal}
                onChange={handlePriceInputChange}
                style={{
                  padding: '7px 18px',
                  fontSize: 19,
                  borderRadius: 8,
                  border: '1px solid #2962c7',
                  marginBottom: 14,
                  width: 170,
                  textAlign: 'center',
                  letterSpacing: '1px'
                }}
                autoFocus
                placeholder="0"
                maxLength={13}
              />
              <div>
                             <button
                  onClick={() => handlePriceSave(product.id)}
                  style={{
                    padding: '7px 21px',
                    background: '#2578e8',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 16,
                    fontWeight: 600,
                    marginRight: 7,
                    cursor: 'pointer',
                    boxShadow: '0 1px 5px #2166a844'
                  }}
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setEditingPriceId(null)}
                  style={{
                    padding: '7px 18px',
                    background: '#23243a',
                    color: '#b5bfe7',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* --- Item context menu (faqat kerakli item yonida professional chiqadi) */}
      {menuAnchor && (() => {
        const { coords, product } = menuAnchor
        return (
          <div
            ref={menuRef}
            style={{
              position: 'absolute',
              top: coords?.top ?? 200,
              left: coords?.left ?? 300,
              background: '#23243a',
              borderRadius: 9,
              boxShadow: '0 8px 32px #22243a88',
              minWidth: 160,
              zIndex: 1111,
              padding: '9px 0',
              border: '1.4px solid #2243a7',
              animation: 'fadeIn .17s',
              transition: 'box-shadow .17s'
            }}
          >
            {MENU_ACTIONS.map(action => (
              <div
                key={action.key}
                onClick={() => handleMenuAction(action)}
                style={{
                  padding: '9px 20px',
                  fontWeight: 500,
                  fontSize: 15,
                  color: action.key === 'edit-price' ? '#55baff' : '#ffeb9d',
                  cursor: 'pointer',
                  borderBottom: action.key !== MENU_ACTIONS[MENU_ACTIONS.length - 1].key ? '1px solid #29335b' : 'none',
                  background: action.key === 'edit-price' ? '#1d263a' : 'none'
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#25427b' }}
                onMouseOut={e => { e.currentTarget.style.background = action.key === 'edit-price' ? '#1d263a' : 'none' }}
              >
                {action.label}
              </div>
            ))}
          </div>
        )
      })()}
    </div>
  )
}

