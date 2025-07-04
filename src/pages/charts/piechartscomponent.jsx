import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const PieChartComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const getData = async () => {
      try {
        const res = await fetch("http://192.168.2.22:8080/api/v1/user/report", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const json = await res.json();
        const rawData = json.data ?? json;

        // ✅ Remove duplicates: same name + value
        const seen = new Set();
        const normalised = [];

        rawData.forEach((item) => {
          const name = item.name ?? item.projectName ?? "Unknown";
          const value = Number(item.value ?? item.count ?? 0);
          const key = `${name}-${value}`; // unique by name+value

          if (!seen.has(key)) {
            seen.add(key);
            normalised.push({ name, value });
          }
        });

        setData(normalised);
      } catch (err) {
        if (err.name !== "AbortError") setError(err);
      } finally {
        setLoading(false);
      }
    };

    getData();

    return () => controller.abort();
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;
  if (!data.length) return <p>No project data available.</p>;

  return (
    <div className="w-full h-96">
      <strong>Project Manager:</strong>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            label={false} // 👈 hides value labels
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;