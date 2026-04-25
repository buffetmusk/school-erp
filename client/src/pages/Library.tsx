import ComingSoon from "./ComingSoon";
import { BookMarked } from "lucide-react";

export default function Library() {
  return (
    <ComingSoon
      title="Library Management"
      description="Catalog books, manage issue/return, track overdue items, and generate library reports."
      icon={BookMarked}
      features={[
        "Book catalog with barcode/ISBN scanning",
        "Issue and return tracking",
        "Overdue alerts and fines",
        "Digital library integration",
        "Reading analytics per student",
      ]}
    />
  );
}
