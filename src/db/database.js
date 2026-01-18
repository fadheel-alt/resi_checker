import Dexie from 'dexie'

export const db = new Dexie('ResiCheckerDB')

db.version(1).stores({
  orders: '++id, orderId, &trackingNumber, status, scannedAt, createdAt'
})

// Add orders dari CSV/XLSX
export async function addOrders(orders) {
  const results = { success: 0, duplicates: [], errors: [] }

  for (const order of orders) {
    try {
      // Cek duplicate
      const existing = await db.orders.where('trackingNumber').equals(order.trackingNumber).first()
      if (existing) {
        results.duplicates.push(order.trackingNumber)
        continue
      }

      await db.orders.add({
        orderId: order.orderId,
        trackingNumber: order.trackingNumber,
        status: 'pending',
        scannedAt: null,
        createdAt: new Date()
      })
      results.success++
    } catch (error) {
      results.errors.push({ tracking: order.trackingNumber, error: error.message })
    }
  }

  return results
}

// Get order by tracking number
export async function getByTracking(trackingNumber) {
  return db.orders.where('trackingNumber').equals(trackingNumber.trim()).first()
}

// Update status ke scanned
export async function markAsScanned(trackingNumber) {
  const order = await getByTracking(trackingNumber)
  if (!order) {
    return { success: false, reason: 'not_found' }
  }
  if (order.status === 'scanned') {
    return { success: false, reason: 'already_scanned', order }
  }

  await db.orders.update(order.id, {
    status: 'scanned',
    scannedAt: new Date()
  })

  return { success: true, order }
}

// Get stats
export async function getStats() {
  const total = await db.orders.count()
  const scanned = await db.orders.where('status').equals('scanned').count()
  const pending = total - scanned

  return { total, scanned, pending }
}

// Get pending orders
export async function getPendingOrders() {
  return db.orders.where('status').equals('pending').toArray()
}

// Clear all data
export async function clearAllOrders() {
  return db.orders.clear()
}
