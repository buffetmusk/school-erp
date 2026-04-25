import ComingSoon from "./ComingSoon";
import { Bus } from "lucide-react";

export default function Transport() {
  return (
    <ComingSoon
      title="Transport Management"
      description="Manage bus routes, stops, student assignments, and fleet tracking."
      icon={Bus}
      features={[
        "Route and stop configuration",
        "Student-to-bus assignment",
        "Driver and conductor management",
        "GPS tracking integration",
        "Transport fee management",
      ]}
    />
  );
}
