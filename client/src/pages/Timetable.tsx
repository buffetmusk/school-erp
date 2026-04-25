import ComingSoon from "./ComingSoon";
import { Clock } from "lucide-react";

export default function Timetable() {
  return (
    <ComingSoon
      title="Timetable Management"
      description="Create and manage class timetables, teacher schedules, and room allocations."
      icon={Clock}
      features={[
        "Visual drag-and-drop timetable builder",
        "Teacher workload balancing",
        "Room and lab allocation",
        "Substitution management",
        "Student and parent timetable view",
      ]}
    />
  );
}
