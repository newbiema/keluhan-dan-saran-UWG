import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminStats({ data }) {
  const chartData = [
    { name: "Pending", value: data.pending },
    { name: "Diproses", value: data.process },
    { name: "Selesai", value: data.done },
  ];

  return (
    <div className="bg-white rounded-lg p-4 border">
      <h3 className="font-semibold mb-3">Statistik Pengajuan</h3>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
