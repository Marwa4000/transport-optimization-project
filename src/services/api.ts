export interface Seller {
  seller_city: string
  seller_state: string
  price: number
}

export interface Customer {
  customer_city: string
  customer_state: string
}

export interface Assignment {
  seller: Seller
  customer: Customer
  predicted_freight_value: number
}

export interface OptimizationResult {
  assignments: Assignment[]
  total_cost: number
  average_cost: number
  cost_matrix: number[][]
}

export async function optimizeAssignments(
  sellers: Seller[],
  customers: Customer[],
  model: string
): Promise<OptimizationResult> {
  try {
    const res = await fetch('http://localhost:8000/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellers, customers, model }),
    })
    return await res.json()
  } catch (err) {
    console.warn('API offline, using mock result:', err)
    const n = customers.length
    const m = sellers.length
    const cost_matrix: number[][] = []

    for (let i = 0; i < n; i++) {
      cost_matrix[i] = []
      for (let j = 0; j < m; j++) {
        cost_matrix[i][j] = Math.round(30 + Math.random() * 70)
      }
    }

    const assignments: Assignment[] = []
    const usedSellers = new Set<number>()
    for (let i = 0; i < n; i++) {
      let bestJ = -1
      let bestCost = Infinity
      for (let j = 0; j < m; j++) {
        if (!usedSellers.has(j) && cost_matrix[i][j] < bestCost) {
          bestCost = cost_matrix[i][j]
          bestJ = j
        }
      }
      if (bestJ === -1) bestJ = i % m
      usedSellers.add(bestJ)
      assignments.push({
        seller: sellers[bestJ],
        customer: customers[i],
        predicted_freight_value: cost_matrix[i][bestJ],
      })
    }

    const total_cost = assignments.reduce((sum, a) => sum + a.predicted_freight_value, 0)
    return { assignments, total_cost, average_cost: total_cost / n, cost_matrix }
  }
}
