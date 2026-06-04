# Transport Cost Optimization — Frontend

React frontend for predicting transport costs and optimizing seller-to-customer assignments.

## Stack

- React 19 + TypeScript
- Vite + Tailwind CSS v4
- React Router v7
- Lucide React

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Prediction | Import sellers & customers, choose ML model, generate cost matrix |
| `/assignment` | Assignment | Choose assignment algorithm or upload custom cost matrix |
| `/results` | Results | View assignments, cost matrix, export CSV |
| `/dashboard` | History | All past optimization runs |
| `/about` | About | Model comparison and algorithm details |

## Getting Started

```bash
git clone https://github.com/Marwa4000/transport-optimization-project.git
cd transport-optimization-project
npm install
npm run dev
```

App runs at `http://localhost:5173`

## CSV Format

**Sellers:** `seller_id, seller_city, seller_state`

**Customers:** `customer_id, customer_city, customer_state, price`

## ML Models

| Model | R² | Training Time |
|---|---|---|
| Random Forest | 0.90 | ~49 min |
| XGBoost | 0.85 | ~2 min |
| Linear Regression | TBD | ~3 min |

## Assignment Algorithms

- **Hungarian** — Optimal, O(n³) — recommended
- **Greedy** — Fast heuristic
- **Linear Programming** — Optimal with constraints
- **Genetic Algorithm** — Large-scale problems

## Backend

Expects FastAPI running at `http://localhost:8000`

- `POST /predict` — returns predicted cost matrix
- `POST /assign` — returns optimal assignments
