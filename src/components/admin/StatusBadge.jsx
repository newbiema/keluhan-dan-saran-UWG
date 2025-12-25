import { Badge } from "@/components/ui/badge";

export default function StatusBadge({ status }) {
  const map = {
    pending: "secondary",
    process: "outline",
    done: "default",
  };

  return (
    <Badge variant={map[status] || "secondary"}>
      {status}
    </Badge>
  );
}
