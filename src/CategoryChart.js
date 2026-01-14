import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function CategoryChart({ months, values, category }) {
  return (
    <div style={{ marginTop: 10 }}>
      <Line
        data={{
          labels: months,
          datasets: [
            {
              label: `${category} Monthly`,
              data: values,
              tension: 0.35,
              borderWidth: 2,
              pointRadius: 3
            }
          ]
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: { beginAtZero: true }
          }
        }}
      />
    </div>
  );
}
