import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard,
  LogOut,
  Users,
  FileText,
  DollarSign,
  Receipt,
  BookOpen,
  UserCog,
  GraduationCap,
  BarChart3,
  Award,
  FileCheck,
  MessageSquare,
  CalendarCheck,
  ChevronRight,
  Search,
  Bell,
  Settings,
  GraduationCap as SchoolIcon,
  Bus,
  BookMarked,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Academics",
    icon: GraduationCap,
    items: [
      { icon: Users, label: "Students", path: "/students" },
      { icon: CalendarCheck, label: "Attendance", path: "/attendance" },
      { icon: GraduationCap, label: "Exams", path: "/exams" },
      { icon: BarChart3, label: "Performance", path: "/performance" },
      { icon: Award, label: "Grades", path: "/grades" },
      { icon: FileCheck, label: "Report Cards", path: "/report-cards" },
      { icon: Clock, label: "Timetable", path: "/timetable" },
    ],
  },
  {
    label: "Admissions",
    icon: FileText,
    items: [
      { icon: FileText, label: "Applications", path: "/admissions/applications" },
    ],
  },
  {
    label: "Finance",
    icon: DollarSign,
    items: [
      { icon: DollarSign, label: "Fee Structures", path: "/fees/structures" },
      { icon: Receipt, label: "Invoices", path: "/fees/invoices" },
    ],
  },
  {
    label: "People",
    icon: UserCog,
    items: [
      { icon: UserCog, label: "Staff", path: "/staff" },
    ],
  },
  {
    label: "Communication",
    icon: MessageSquare,
    items: [
      { icon: MessageSquare, label: "Send Message", path: "/communication/send" },
      { icon: MessageSquare, label: "Templates", path: "/communication/templates" },
      { icon: MessageSquare, label: "Scheduled", path: "/communication/scheduled" },
      { icon: MessageSquare, label: "History", path: "/communication/history" },
    ],
  },
  {
    label: "More",
    icon: BookOpen,
    items: [
      { icon: Bus, label: "Transport", path: "/transport" },
      { icon: BookMarked, label: "Library", path: "/library" },
      { icon: BookOpen, label: "Master Data", path: "/master-data" },
      { icon: Settings, label: "Settings", path: "/settings" },
    ],
  },
];

function findBreadcrumb(path: string): { group?: string; item?: string } {
  for (const group of navGroups) {
    const found = group.items.find((item) => path.startsWith(item.path));
    if (found) return { group: group.label, item: found.label };
  }
  if (path === "/") return { item: "Dashboard" };
  return {};
}

interface NavGroupCollapsibleProps {
  group: NavGroup;
  location: string;
  setLocation: (path: string) => void;
  isGroupActive: boolean;
  children?: React.ReactNode;
}

function NavGroupCollapsible({ group, location, setLocation, isGroupActive }: NavGroupCollapsibleProps) {
  const [open, setOpen] = useState(isGroupActive);

  useEffect(() => {
    if (isGroupActive) setOpen(true);
  }, [isGroupActive]);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={group.label}
            className="h-9 font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            <group.icon className="h-4 w-4" />
            <span>{group.label}</span>
            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {group.items.map((item) => {
              const isActive =
                location === item.path ||
                (item.path !== "/" && location.startsWith(item.path + "/"));
              return (
                <SidebarMenuSubItem key={item.path}>
                  <SidebarMenuSubButton
                    isActive={isActive}
                    onClick={() => setLocation(item.path)}
                    className="h-8"
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 220;
const MAX_WIDTH = 360;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_WIDTH;
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
            <SchoolIcon className="h-8 w-8 text-white" />
          </div>
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-center">
              School ERP
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Manage admissions, fees, academics, and operations from a single platform.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all gradient-primary border-0 text-white"
          >
            Sign in to continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

interface DashboardLayoutContentProps {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
}

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const breadcrumb = useMemo(() => findBreadcrumb(location), [location]);

  const isGroupActive = useCallback(
    (group: NavGroup) =>
      group.items.some((item) => location === item.path || location.startsWith(item.path + "/")),
    [location]
  );

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          {/* School Branding */}
          <SidebarHeader className="h-16 justify-center border-b border-sidebar-border">
            <div className="flex items-center gap-3 px-3 transition-all w-full">
              <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center shrink-0 shadow-sm">
                <SchoolIcon className="h-5 w-5 text-white" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm tracking-tight truncate text-sidebar-foreground">
                    School ERP
                  </span>
                  <span className="text-[11px] text-sidebar-foreground/50 truncate">
                    Management System
                  </span>
                </div>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 px-2 pt-2">
            {/* Dashboard - Top Level */}
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location === "/"}
                  onClick={() => setLocation("/")}
                  tooltip="Dashboard"
                  className="h-9 font-medium"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            {!isCollapsed && (
              <Separator className="my-2 bg-sidebar-border" />
            )}

            {/* Grouped Navigation */}
            <SidebarMenu>
              {navGroups.map((group) => (
                <NavGroupCollapsible
                  key={group.label}
                  group={group}
                  location={location}
                  setLocation={setLocation}
                  isGroupActive={isGroupActive(group)}
                >
                </NavGroupCollapsible>
              ))}
            </SidebarMenu>
          </SidebarContent>

          {/* User Footer */}
          <SidebarFooter className="p-2 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-sidebar-accent transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs font-semibold gradient-primary text-white">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none text-sidebar-foreground">
                      {user?.name || "User"}
                    </p>
                    <p className="text-[11px] text-sidebar-foreground/50 truncate mt-1">
                      {user?.role || "admin"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/settings")} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Resize Handle */}
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {/* Global Top Bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur-md px-4">
          <div className="flex items-center gap-3 flex-1">
            {isMobile ? (
              <SidebarTrigger className="h-8 w-8 rounded-lg" />
            ) : (
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground"
                aria-label="Toggle sidebar"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="5.5" y1="2" x2="5.5" y2="14" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            )}

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <button
                onClick={() => setLocation("/")}
                className="hover:text-foreground transition-colors"
              >
                Home
              </button>
              {breadcrumb.group && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-muted-foreground/70">{breadcrumb.group}</span>
                </>
              )}
              {breadcrumb.item && breadcrumb.item !== "Dashboard" && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-foreground font-medium">{breadcrumb.item}</span>
                </>
              )}
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground relative" aria-label="Notifications - unread items">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" aria-hidden="true" />
                  <span className="sr-only">Unread notifications</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </>
  );
}
