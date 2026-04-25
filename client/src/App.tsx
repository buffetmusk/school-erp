import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import DashboardLayout from "./components/DashboardLayout";
import ApplicationsList from "./pages/admissions/ApplicationsList";
import ApplicationDetails from "./pages/admissions/ApplicationDetails";
import FeeStructuresList from "./pages/fees/FeeStructuresList";
import InvoicesList from "./pages/fees/InvoicesList";
import MasterData from "./pages/MasterData";
import StudentsList from "./pages/students/StudentsList";
import StudentDetails from "./pages/students/StudentDetails";
import StaffList from "./pages/staff/StaffList";
import StaffProfile from "./pages/staff/StaffProfile";
import Exams from "./pages/Exams";
import ExamDetails from "./pages/ExamDetails";
import PerformanceAnalytics from "./pages/PerformanceAnalytics";
import GradeConfiguration from "./pages/GradeConfiguration";
import ReportCards from "./pages/ReportCards";
import { MessageTemplates } from "./pages/MessageTemplates";
import { SendMessages } from "./pages/SendMessages";
import { ScheduledMessages } from "./pages/ScheduledMessages";
import { MessageHistory } from "./pages/MessageHistory";
import ParentRegistration from "./pages/ParentRegistration";
import ParentDashboard from "./pages/ParentDashboard";
import AttendanceManagement from "./pages/AttendanceManagement";
import Timetable from "./pages/Timetable";
import Transport from "./pages/Transport";
import Library from "./pages/Library";
import SchoolSettings from "./pages/SchoolSettings";
import SpecialExams from "./pages/SpecialExams";
import SpecialExamDetails from "./pages/SpecialExamDetails";

function Router() {
  return (
    <Switch>
      <Route path={"/parent/register"} component={ParentRegistration} />
      <Route>
        <DashboardLayout>
          <Switch>
            <Route path={"/"} component={Home} />
            <Route path={"/admissions/applications"} component={ApplicationsList} />
            <Route path={"/admissions/applications/:id"} component={ApplicationDetails} />
            <Route path={"/fees/structures"} component={FeeStructuresList} />
            <Route path={"/fees/invoices"} component={InvoicesList} />
            <Route path={"/master-data"} component={MasterData} />
            <Route path={"/students"} component={StudentsList} />
            <Route path={"/students/:id"} component={StudentDetails} />
            <Route path={"/staff"} component={StaffList} />
            <Route path={"/staff/:id"} component={StaffProfile} />
            <Route path={"/special-exams"} component={SpecialExams} />
            <Route path={"/special-exams/:id"} component={SpecialExamDetails} />
            <Route path={"/exams"} component={Exams} />
            <Route path={"/exams/:id"} component={ExamDetails} />
            <Route path={"/performance"} component={PerformanceAnalytics} />
            <Route path={"/grades"} component={GradeConfiguration} />
            <Route path={"/report-cards"} component={ReportCards} />
            <Route path={"/communication/templates"} component={MessageTemplates} />
            <Route path={"/communication/send"} component={SendMessages} />
            <Route path={"/communication/scheduled"} component={ScheduledMessages} />
            <Route path={"/communication/history"} component={MessageHistory} />
            <Route path={"/attendance"} component={AttendanceManagement} />
            <Route path={"/parent/dashboard"} component={ParentDashboard} />
            <Route path={"/timetable"} component={Timetable} />
            <Route path={"/transport"} component={Transport} />
            <Route path={"/library"} component={Library} />
            <Route path={"/settings"} component={SchoolSettings} />
            <Route component={NotFound} />
          </Switch>
        </DashboardLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
