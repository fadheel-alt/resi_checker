import { supabase } from '../lib/supabase'

// Add orders from CSV/XLSX
export async function addOrders(orders) {
  const results = { success: 0, duplicates: [], errors: [] }

  for (const order of orders) {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_id: order.orderId,
        tracking_number: order.trackingNumber,
        status: 'pending'
      })
      .select()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        results.duplicates.push(order.trackingNumber)
      } else {
        results.errors.push({ tracking: order.trackingNumber, error: error.message })
      }
    } else {
      results.success++
    }
  }

  return results
}

// Get order by tracking number
export async function getByTracking(trackingNumber) {
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('tracking_number', trackingNumber.trim())
    .single()

  return data
}

// Mark as scanned
export async function markAsScanned(trackingNumber) {
  const order = await getByTracking(trackingNumber)

  if (!order) {
    return { success: false, reason: 'not_found' }
  }

  if (order.status === 'scanned') {
    return { success: false, reason: 'already_scanned', order }
  }

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'scanned',
      scanned_at: new Date().toISOString()
    })
    .eq('id', order.id)

  if (error) {
    return { success: false, reason: 'error', error: error.message }
  }

  return { success: true, order }
}

// Get stats
export async function getStats() {
  const { count: total } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const { count: scanned } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'scanned')

  return {
    total: total || 0,
    scanned: scanned || 0,
    pending: (total || 0) - (scanned || 0)
  }
}

// Get pending orders
export async function getPendingOrders() {
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return data || []
}

// Clear all orders
export async function clearAllOrders() {
  const { error } = await supabase
    .from('orders')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

  return { success: !error, error }
}
