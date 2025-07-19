import React, { useState, useRef, useEffect } from 'react'

const MENU_ACTIONS = [
  { key: 'hide', label: 'Скрыть / Показать' },
  { key: 'move', label: 'Переместить в таб' },
  { key: 'edit-price', label: 'Изменить цену' }
]

export default function BarMenuPanel({
  selectedTabId,
  setSelectedTabId,
  cart,
  setCart,
  products,
  tabs
}) {
  const [editingTabId, setEditingTabId] = useState(null)
  const [tabEditVal, setTabEditVal] = useState('')
  const [menuAnchor, setMenuAnchor] = useState(null)
  const menuRef = useRef()

  useEffect(() => {
    if (!menuAnchor) return
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAnchor(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuAnchor])

  const handleTabDoubleClick = (tab) => {
    setEditingTabId(tab.id)
    setTabEditVal(tab.name)
  }
  const handleTabEditSave = (tab) => {
    tab.name = tabEditVal
    setEditingTabId(null)
  }

  const tabProducts = products.filter(p => p.tab_id === selectedTabId)
  const handleItemClick = (product) => {
    if (!product.sell_price) return
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
  const handleMenuOpen = (e, product) => {
    e.stopPropagation()
    setMenuAnchor({ id: product.id })
  }
  const handleMenuAction = (action) => {
    setMenuAnchor(null)
    alert(`Действие: ${action.label}`)
  }

  const [editingPriceId, setEditingPriceId] = useState(null)
  const [priceVal, setPriceVal] = useState('')

  return (
    <div style={{ paddingBottom: 125 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
        {tabs.map(tab => (
          <div
            key={tab.id}
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
        ))}
      </div>

      {/* Product Cards */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 15,
        minHeight: 160,
        paddingBottom: 6
      }}>
        {tabProducts.length === 0 ? (
          <div style={{
            color: '#a4b0cb', fontSize: 15, padding: 13, background: '#181926', borderRadius: 8
          }}>
            Нет товаров в этом табе.
          </div>
        ) : (
        tabProducts.map(product => {
            const isActive = !!product.sell_price
            return (
              <div
                key={product.id}
                onClick={() => handleItemClick(product)}
                style={{
                  background: isActive ? '#21243b' : '#181926',
                  opacity: isActive ? 1 : 0.62,
                  boxShadow: isActive ? '0 2px 12px #175eb444' : '0 2px 6px #23243a11',
                  border: isActive ? '1.5px solid #316fff' : '1.1px dashed #3c405e',
                  borderRadius: 13,
                  padding: '12px 10px 10px 13px',
                  minWidth: 136,
                  minHeight: 154,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  position: 'relative',
                  cursor: isActive ? 'pointer' : 'not-allowed',
                  transition: 'box-shadow 0.13s, opacity 0.14s'
                }}
                tabIndex={0}
                title={isActive ? 'Добавить в корзину' : 'Нет цены — нельзя продавать'}
              >
                {/* 3 dot vertical */}
                <div
                  onClick={e => handleMenuOpen(e, product)}
                  style={{
                    position: 'absolute', top: 7, right: 7,
                    width: 19, height: 19,
                    borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'background 0.15s',
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

                {/* Product name */}
                <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 4, marginTop: 2 }}>
                  {product.name}
                </div>
                {/* O‘rta markazda icon (emoji yoki svg) */}
                <div style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  width: '100%', margin: '12px 0 16px 0'
                }}>
                  {/* SVG yoki emoji */}
                  <span style={{ fontSize: 34, color: '#58bcff', opacity: 0.75 }}>📦</span>
                </div>
                {/* Pastki chapda: к-во va narx bitta qator */}
                <div style={{
                  position: 'absolute', left: 10, bottom: 9,
                  display: 'flex', alignItems: 'center', gap: 11, fontSize: 13.3, fontWeight: 500
                }}>
                  <span style={{ color: '#68eab2' }}>к-во: {product.remain}</span>
                  <span style={{ color: '#ffd990', fontWeight: 700 }}>
                    {product.sell_price ? `${product.sell_price.toLocaleString()} сум` : ''}
                  </span>
                </div>

                {/* Menu drop-down */}
                {menuAnchor && menuAnchor.id === product.id && (
                  <div
                    ref={menuRef}
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '100%',
                      height: '100%',
                      background: '#232538',
                      color: '#e6ebff',
                      boxShadow: '0 2px 15px #10142360',
                      borderRadius: 13,
                      zIndex: 100,
                      padding: '10px 0 3px 0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                    {MENU_ACTIONS.map(act => (
                      <div
                        key={act.key}
                        onClick={() => handleMenuAction(act)}
                        style={{
                          padding: '8px 18px', cursor: 'pointer',
                          color: '#7edbfb',
                          fontSize: 14,
                          fontWeight: 600,
                          borderBottom: act.key !== MENU_ACTIONS[MENU_ACTIONS.length - 1].key ? '1px solid #282c46' : 'none',
                          transition: 'background 0.13s'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#263355')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {act.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
