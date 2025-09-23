"use client";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

type Item = { username: string; tags?: string[]; unfollowed?: boolean; customTags?: string[] };

export function StatusPie({ items }: { items: Item[] }) {
  const counts = countStatus(items);
  const total = Math.max(counts.remaining + counts.unfollowed, 1);
  const pct = Math.round((counts.unfollowed / total) * 100);
  const data = {
    labels: ["Remaining", "Unfollowed"],
    datasets: [
      {
        data: [counts.remaining, counts.unfollowed],
        backgroundColor: ["#2563eb", "#16a34a"],
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 6,
        borderRadius: 8,
      },
    ],
  } as const;
  const options = {
    cutout: "62%",
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: "circle" as const,
          color: "#475569",
          padding: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const label = ctx.label || "";
            const value = ctx.raw as number;
            const percent = Math.round((value / total) * 100);
            return `${label}: ${value} (${percent}%)`;
          },
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  } as const;

  // Center text plugin
  const centerText = {
    id: "centerText",
    beforeDraw: (chart: any) => {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      const { top, bottom, left, right } = chartArea;
      const x = (left + right) / 2;
      const y = (top + bottom) / 2;
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#0F172A";
      ctx.font = "600 20px system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText(`${pct}%`, x, y - 6);
      ctx.fillStyle = "#64748B";
      ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText("Done", x, y + 12);
      ctx.restore();
    },
  };

  return (
    <div className="h-56 w-full">
      <Doughnut data={data} options={options} plugins={[centerText]} />
    </div>
  );
}

function countStatus(items: Item[]) {
  const unfollowed = items.filter(i => i.unfollowed).length;
  const remaining = Math.max(items.length - unfollowed, 0);
  return { unfollowed, remaining };
}


