// Insights.js
import React, { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import CategoryChart from './CategoryChart';

function Insights({
  expenses,
  month,
  year,
  lookbackMonths = 6,
  minDataPoints = 6
}) {
  const [insights, setInsights] = useState([]);
  const [modelsInfo, setModelsInfo] = useState({});
  const [catMonthlyData, setCatMonthlyData] = useState({});
  const [openCharts, setOpenCharts] = useState({}); // <-- NEW: toggle per category

  const monthKey = (y, m) =>
    `${y.toString().padStart(4, '0')}-${(m + 1).toString().padStart(2, '0')}`;

  function buildCategoryMonthlyTotals() {
    const map = {};
    expenses.forEach(exp => {
      if (exp.type !== 'expense' || !exp.date) return;

      const d = new Date(exp.date);
      const k = monthKey(d.getFullYear(), d.getMonth());
      const cat = exp.category || 'Uncategorized';

      if (!map[cat]) map[cat] = {};
      map[cat][k] = (map[cat][k] || 0) + Number(exp.amount || 0);
    });
    return map;
  }

  function getLookbackKeys() {
    const keys = [];
    for (let i = lookbackMonths - 1; i >= 0; i--) {
      const dt = new Date(year, month - i, 1);
      keys.push(monthKey(dt.getFullYear(), dt.getMonth()));
    }
    return keys;
  }

  async function trainAndPredictCategory(category, monthlyMap, keys) {
    const values = keys.map(k => monthlyMap[k] || 0);

    const nonZeroCount = values.filter(v => v > 0).length;
    if (values.length < minDataPoints || nonZeroCount === 0)
      return { ok: false, reason: 'insufficient data' };

    const windowSize = Math.min(values.length - 1, 5);
    if (windowSize < 2) return { ok: false, reason: 'not enough sliding windows' };

    const X = [], y = [];
    for (let i = 0; i + windowSize < values.length; i++) {
      X.push(values.slice(i, i + windowSize));
      y.push(values[i + windowSize]);
    }

    const flat = X.flat();
    const mean = flat.reduce((s, v) => s + v, 0) / flat.length;
    const std = Math.max(
      1e-6,
      Math.sqrt(flat.map(v => (v - mean) ** 2).reduce((s, a) => s + a, 0) / flat.length)
    );

    const normX = X.map(r => r.map(v => (v - mean) / std));
    const normY = y.map(v => (v - mean) / std);

    const xs = tf.tensor2d(normX);
    const ys = tf.tensor2d(normY, [normY.length, 1]);

    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [windowSize], units: 16, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1 }));
    model.compile({ optimizer: tf.train.adam(0.01), loss: 'meanAbsoluteError' });

    try {
      await model.fit(xs, ys, {
        epochs: 50,
        batchSize: Math.min(8, X.length),
        verbose: 0
      });
    } catch {
      xs.dispose(); ys.dispose(); model.dispose();
      return { ok: false, reason: 'training failed' };
    }

    const lastWindow = values.slice(values.length - windowSize);
    const normLast = lastWindow.map(v => (v - mean) / std);

    const out = model.predict(tf.tensor2d([normLast]));
    const arr = await out.array();
    const prediction = arr[0][0] * std + mean;

    xs.dispose(); ys.dispose(); out.dispose(); model.dispose();

    return {
      ok: true,
      prediction: Math.max(prediction, 0),
      windowSize
    };
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const catMonthly = buildCategoryMonthlyTotals();
      const keys = getLookbackKeys();

      setCatMonthlyData(catMonthly);

      const results = [];
      const modelStats = {};

      for (const cat of Object.keys(catMonthly)) {
        const map = catMonthly[cat];
        const values = keys.map(k => map[k] || 0);
        const sum = values.reduce((s, v) => s + v, 0);
        const avg = sum / values.length;

        const thisMonthKey = keys[keys.length - 1];
        const thisMonthValue = map[thisMonthKey] || 0;

        const pctChange =
          avg > 0 ? ((thisMonthValue - avg) / avg) * 100 :
          thisMonthValue > 0 ? 100 : 0;

        let msg = `${cat}: ${formatCurrency(thisMonthValue)} vs ${formatCurrency(avg)} (${lookbackMonths}-mo avg) — ${
          pctChange >= 0 ? '+' : ''
        }${pctChange.toFixed(1)}%`;

        const ml = await trainAndPredictCategory(cat, map, keys);

        if (ml.ok) {
          modelStats[cat] = { trained: true, window: ml.windowSize };
          const diff =
            ml.prediction > 0
              ? ((thisMonthValue - ml.prediction) / ml.prediction) * 100
              : 0;

          if (diff >= 15) {
            msg += ` — 🔴 ${diff.toFixed(0)}% higher than predicted (${formatCurrency(
              ml.prediction
            )})`;
          } else if (diff <= -15) {
            msg += ` — 🟢 ${Math.abs(diff).toFixed(0)}% lower than predicted (${formatCurrency(
              ml.prediction
            )})`;
          } else {
            msg += ` — close to prediction (${formatCurrency(ml.prediction)})`;
          }
        } else {
          modelStats[cat] = { trained: false, reason: ml.reason };
        }

        results.push({
          category: cat,
          thisMonthValue,
          avgWindow: avg,
          pctChange,
          flagged: Math.abs(pctChange) >= 10,
          text: msg
        });
      }

      if (!cancelled) {
        results.sort((a, b) => Math.abs(b.pctChange) - Math.abs(a.pctChange));
        setInsights(results);
        setModelsInfo(modelStats);
      }
    }

    run();
    return () => (cancelled = true);
  }, [expenses, month, year, lookbackMonths]);

  function formatCurrency(v) {
    return `₱${Number(v || 0).toFixed(2)}`;
  }

  const keys = getLookbackKeys();

  // toggle handler
  function toggleChart(cat) {
    setOpenCharts(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Personalized Insights</h3>

      {insights.length === 0 ? (
        <p>No expense data yet.</p>
      ) : (
        <ul style={{ padding: 0, listStyle: 'none' }}>
          {insights.map(ins => {
            const categoryData = catMonthlyData[ins.category] || {};

            return (
              <li
                key={ins.category}
                style={{
                  marginBottom: 15,
                  padding: 12,
                  borderRadius: 8,
                  border: ins.flagged ? '1px solid #f0ad4e' : '1px solid #ddd',
                  background: ins.flagged ? '#fff8e5' : '#fff'
                }}
              >
                <strong>{ins.category}</strong>
                <p style={{ marginTop: 6 }}>{ins.text}</p>

                {/* Toggle button */}
                <button
                  onClick={() => toggleChart(ins.category)}
                  style={{
                    marginTop: 8,
                    marginBottom: 10,
                    padding: '5px 12px',
                    borderRadius: 4,
                    border: '1px solid #000000ff',
                    background: '#464646ff',
                    cursor: 'pointer'
                  }}
                >
                  {openCharts[ins.category] ? 'Hide Chart' : 'Show Chart'}
                </button>

                {/* Chart only if toggled on */}
                {openCharts[ins.category] && (
                  <div style={{ width: "520px", height: "260px", marginBottom: "12px" }}>
                    <CategoryChart
                      months={keys}
                      values={keys.map(k => categoryData[k] || 0)}
                      category={ins.category}
                    />
                  </div>
                )}

                <small style={{ color: '#555' }}>
                  {modelsInfo[ins.category]?.trained
                    ? ' ML model used for prediction.'
                    : ' Insufficient history — using basic statistics.'}
                </small>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Insights;
