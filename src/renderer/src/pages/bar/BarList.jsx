import React from 'react'

export default function BarList({ items, onEdit, onDelete }) {
  if (!items.length) return <div style={{color:'#888'}}>Товаров нет</div>
  return (
    <div style={{display:'flex',gap:18,flexWrap:'wrap'}}>
      {items.map(item => (
        <div key={item.id}
          style={{
            background:'#181e3a', color:'#fff',
            borderRadius:16, padding:18, minWidth:220, minHeight:120
          }}>
          <b>{item.name}</b>
          <div>Цена: {item.price} сум</div>
          <div>Остаток: {item.remain}</div>
          <div style={{marginTop:12, display:'flex',gap:12}}>
            <button onClick={() => onEdit(item)}
              style={actionBtnStyle('#ffe066', '#444')}>✏️</button>
            <button onClick={() => onDelete(item.id)}
              style={actionBtnStyle('#ff8787', '#fff')}>🗑</button>
          </div>
        </div>
      ))}
    </div>
  )
}
function actionBtnStyle(bg, color) {
  return {
    background:bg, color, border:'none', borderRadius:6, cursor:'pointer', fontSize:18, padding:'4px 10px'
  }
}
