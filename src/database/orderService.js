// src/database/orderService.js

import { db } from './db.js'

// 1. Yangi buyurtma qo‘shish (faqat o‘chirilmagan tovarlar uchun)
export async function createOrder({ user_id, computer, items, total, status }) {
  const now = new Date().toISOString()
  // Soft-deleted tovarlarni tekshirish
  for (const item of items) {
    const prod = await db.get(
      `SELECT id, deleted FROM bar_items WHERE id = ?`, 
      [item.product_id]
    )
    if (!prod)
      throw new Error(`Mahsulot (ID=${item.product_id}) topilmadi!`)
    if (prod.deleted)
      throw new Error(`Mahsulot (ID=${item.product_id}) o‘chirilgan (deleted)!`)
  }

  // Zakaz/Buyurtma yozish
  const result = await db.run(
    `INSERT INTO receipts (user_id, computer, total, status, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, computer, total, status, now]
  )
  const orderId = result.lastID

  // Zakaz items (receipt_items) ga yozish va remainni kamaytirish
  for (const item of items) {
    await db.run(
      `INSERT INTO receipt_items (receipt_id, product_id, qty, price, sum)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, item.product_id, item.qty, item.price, item.qty * item.price]
    )
    if (status === 'оплачен') {
      await db.run(
        `UPDATE bar_items SET remain = remain - ? WHERE id = ?`,
        [item.qty, item.product_id]
      )
    }
  }
  return orderId
}

// 2. Zakaz statusini o‘zgartirish (oplacheno/otkaz)
export async function updateOrderStatus(orderId, newStatus) {
  const old = await db.get(`SELECT status FROM receipts WHERE id = ?`, [orderId])
  if (!old) throw new Error('Order not found!')

  await db.run(`UPDATE receipts SET status = ? WHERE id = ?`, [newStatus, orderId])

  // Faqat "не оплачен"dan "оплачен" ga o‘tganda remain kamayadi
  if (old.status !== 'оплачен' && newStatus === 'оплачен') {
    const items = await db.all(`SELECT product_id, qty FROM receipt_items WHERE receipt_id = ?`, [orderId])
    for (const item of items) {
      await db.run(
        `UPDATE bar_items SET remain = remain - ? WHERE id = ?`,
        [item.qty, item.product_id]
      )
    }
  }
}

// 3. Buyurtmalar ro‘yxati (o‘chirilgan tovarlar ham chiqadi)
export async function listOrders() {
  // receipts jadvalidan orderlarni olamiz
  const receipts = await db.all(`
    SELECT r.*, u.name as user_name FROM receipts r
    LEFT JOIN users u ON r.user_id = u.id
    ORDER BY r.created_at DESC
  `)

  for (const r of receipts) {
    r.items = await db.all(`
      SELECT ri.*, b.name as product_name, b.deleted
      FROM receipt_items ri
      LEFT JOIN bar_items b ON ri.product_id = b.id
      WHERE ri.receipt_id = ?
    `, [r.id])
    // O‘chirilgan tovarlarni belgila
    r.items = r.items.map(i => ({
      ...i,
      product_name: i.deleted ? '(удалённый товар)' : i.product_name,
      price: i.price, // narx har doim qaytadi
    }))
  }
  return receipts
}

// 4. Bar item-ni soft-delete qilish
export async function softDeleteBarItem(id) {
  await db.run(`UPDATE bar_items SET deleted = 1 WHERE id = ?`, [id])
}

// 5. Bar item-ni tiklash (restore)
export async function restoreBarItem(id) {
  await db.run(`UPDATE bar_items SET deleted = 0 WHERE id = ?`, [id])
}

// 6. Faqat o‘chirilmagan bar_items (asosiy shop/list uchun)
export async function listActiveBarItems() {
  return await db.all(`SELECT * FROM bar_items WHERE deleted = 0`)
}

// 7. Barcha bar_items (shu jumladan deleted, admin uchun)
export async function listAllBarItems() {
  return await db.all(`SELECT * FROM bar_items`)
}

// 8. Bitta buyurtma/zakaz tafsilotlari (tovarlar va status bilan)
export async function getOrderById(orderId) {
  const order = await db.get(`
    SELECT r.*, u.name as user_name FROM receipts r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.id = ?
  `, [orderId])
  if (!order) return null

  order.items = await db.all(`
    SELECT ri.*, b.name as product_name, b.deleted
    FROM receipt_items ri
    LEFT JOIN bar_items b ON ri.product_id = b.id
    WHERE ri.receipt_id = ?
  `, [orderId])
  order.items = order.items.map(i => ({
    ...i,
    product_name: i.deleted ? '(удалённый товар)' : i.product_name,
    price: i.price,
  }))
  return order
}
