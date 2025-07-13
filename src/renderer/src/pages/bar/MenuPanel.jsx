import React, { useRef } from "react";

export default function MenuPanel({
  items, setItems, selected, setSelected, onOrderSubmit
}) {
  // --- Drag and drop uchun local ref lar
  const dragItem = useRef(null);

  // --- Drag handlers
  const handleDragStart = (idx) => {
    dragItem.current = idx;
  };

  const handleDrop = (idx) => {
    const from = dragItem.current;
    if (typeof from === 'number' && from !== idx) {
      const arr = [...items];
      const [item] = arr.splice(from, 1);
      arr.splice(idx, 0, item);
      setItems(arr);
    }
    dragItem.current = null;
  };

  // --- Tanlash va boshqalar
  const handleSelect = (itemId) => {
    setSelected(sel => {
      const exists = sel.find(s => s.itemId === itemId);
      const item = items.find(i => i.id === itemId);
      if (!item) return sel;
      if (exists) {
        if (exists.quantity < item.remain)
          return sel.map(s => s.itemId === itemId ? { ...s, quantity: s.quantity + 1 } : s);
        else return sel;
      }
      return [...sel, { itemId, quantity: 1 }];
    });
  };

  const handleMinus = (itemId) =>
    setSelected(sel => sel.flatMap(s => s.itemId === itemId && s.quantity > 1
      ? [{ ...s, quantity: s.quantity - 1 }]
      : s.itemId === itemId ? [] : [s]
    ));
  const handlePlus = (itemId) =>
    setSelected(sel => sel.map(s => s.itemId === itemId
      ? { ...s, quantity: Math.min(s.quantity + 1, (items.find(i => i.id === itemId)?.remain || 1)) }
      : s
    ));
  const handleRemove = (itemId) =>
    setSelected(sel => sel.filter(s => s.itemId !== itemId));

  const selectedItems = selected.map(s => {
    const item = items.find(i => i.id === s.itemId);
    return item ? { ...item, quantity: s.quantity } : null;
  }).filter(Boolean);

  const total = selectedItems.reduce((sum, s) => sum + (s.price * s.quantity), 0);
const displayItems = items.filter(i => i.remain > 0);
  return (
    <div style={{
      width: 430, minWidth: 260, maxWidth: 500, background: "#232355",
      borderRadius: 28, padding: "28px 24px 90px 24px", // bottom padding ko‘paydi!
      display: "flex", flexDirection: "column", position: "relative",
      alignItems: "center"
    }}>
      <h2 style={{
        color: "#8ac", fontWeight: 700, fontSize: 32, marginBottom: 18, marginTop: 0, textAlign: "center"
      }}>Меню</h2>
      <div style={{
        display: "flex", gap: 18, marginBottom: 14, flexWrap: "wrap", justifyContent: "flex-start"
      }}>
        {displayItems.map((item, idx) => (
          <div
            key={item.id}
            draggable={true}
            onDragStart={() => handleDragStart(idx)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(idx)}
            onClick={() => handleSelect(item.id)}
            style={{
              width: 170, height: 110, borderRadius: 15, background: "#262855",
              color: "#fff", fontSize: 21, fontWeight: 700,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              cursor: item.remain > 0 ? "pointer" : "not-allowed",
              opacity: item.remain > 0 ? 1 : 0.5,
              position: "relative", userSelect: "none",
              boxShadow: "0 2px 8px #0002", marginBottom: 2,
              transition: "background .15s"
            }}
            title="Tanlash yoki drag&drop uchun bosing yoki torting"
          >
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: "#23243e", marginBottom: 8
            }} />
            <div>{item.name}</div>
            <span style={{ fontSize: 15, color: "#a7f", fontWeight: 700 }}>{item.price.toLocaleString()} сум</span>
            <span style={{ fontSize: 13, color: "#ccc" }}>Осталось: {item.remain}</span>
            <span style={{
              position: "absolute", right: 10, top: 10, color: "#333", fontSize: 20,
              opacity: 0.2
            }}>⠿</span>
          </div>
        ))}
      </div>
      {/* --- Zakaz panel (fixed to bottom) --- */}
      {selectedItems.length > 0 && (
        <div style={{
          position: "absolute", bottom: 18, left: 24, right: 24, // Yopishtirildi
          background: "#252a54", borderRadius: 18, padding: 22,
          minWidth: 250, maxWidth: 340, margin: "auto",
          boxShadow: "0 2px 18px #0002",
        }}>
          <h4 style={{ color: "#e7b", marginBottom: 13, textAlign: "center", fontWeight: 600 }}>Заказ</h4>
          <div style={{
            display: "flex", gap: 9, flexWrap: "wrap", justifyContent: "center"
          }}>
            {selectedItems.map(sel => (
              <div key={sel.id}
                style={{
                  background: "#2e2f5a", borderRadius: 10, padding: "10px 16px 10px 10px",
                  display: "flex", alignItems: "center", gap: 8, minWidth: 92, position: "relative"
                }}>
                <span style={{ color: "#fff", fontWeight: 500 }}>{sel.name}</span>
                <span style={{ color: "#b5f", fontWeight: 700, margin: "0 2px 0 4px" }}>x{sel.quantity}</span>
                {sel.quantity > 1 &&
                  <button onClick={e => { e.stopPropagation(); handleMinus(sel.id); }}
                    style={{
                      background: "#343562", color: "#fff", border: "none", width: 20, height: 20,
                      borderRadius: "50%", cursor: "pointer", fontWeight: 700, fontSize: 15
                    }}>-</button>}
                <button onClick={e => { e.stopPropagation(); handlePlus(sel.id); }}
                  style={{
                    background: "#343562", color: "#fff", border: "none", width: 20, height: 20,
                    borderRadius: "50%", cursor: "pointer", fontWeight: 700, fontSize: 16, marginLeft: 2
                  }}>+</button>
                {/* O'chirish badge */}
                <button onClick={e => { e.stopPropagation(); handleRemove(sel.id); }}
                  style={{
                    position: "absolute", top: -9, right: -7, background: "#ff4d6e",
                    color: "#fff", border: "none", width: 21, height: 21, borderRadius: "50%",
                    cursor: "pointer", fontWeight: 700, fontSize: 13, lineHeight: 0.5, boxShadow: "0 2px 8px #0003"
                  }}>×</button>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <span style={{ color: "#8ff", fontSize: 18, fontWeight: 700 }}>
              Jami: {total.toLocaleString()} сум
            </span>
            <button onClick={onOrderSubmit}
              style={{
                background: "#57d267", color: "#161627", fontWeight: 800, fontSize: 18,
                padding: "8px 22px", border: "none", borderRadius: 10, marginLeft: 18, cursor: "pointer"
              }}>Заказать</button>
          </div>
        </div>
      )}
    </div>
  );
}
