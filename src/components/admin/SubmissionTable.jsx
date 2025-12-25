import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const dummy = [
  { id: 1, code: "ABC123", module: "Keluhan Fasilitas", status: "pending" },
  { id: 2, code: "XYZ999", module: "Administrasi", status: "done" },
];

export default function SubmissionTable() {
  const nav = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow">
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr>
            <th className="p-3 text-left">Kode</th>
            <th>Modul</th>
            <th>Status</th>
            <th className="text-right">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {dummy.map((d) => (
            <tr key={d.id} className="border-b">
              <td className="p-3">{d.code}</td>
              <td>{d.module}</td>
              <td>
                <Badge variant={d.status === "pending" ? "secondary" : "default"}>
                  {d.status}
                </Badge>
              </td>
              <td className="text-right space-x-2 p-3">
                <Button size="sm" onClick={() => nav(`/admin/submissions/${d.id}`)}>
                  Detail
                </Button>
                <Button size="sm" variant="destructive">
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
