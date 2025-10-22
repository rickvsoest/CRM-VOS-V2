import { useState, useEffect, useMemo } from "react";
import { Sidebar } from "./components/Sidebar";
import { ThemeToggle } from "./components/ThemeToggle";
import { NotificationsPanel, Notification } from "./components/NotificationsPanel";
import { Login } from "./pages/Login";
import { TwoFactorAuth } from "./pages/TwoFactorAuth"; // blijft bestaan, nog niet gebruikt
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Dashboard } from "./pages/Dashboard";
import { Pipeline } from "./pages/Pipeline";
import { CustomerDetail } from "./pages/CustomerDetail";
import { Documents } from "./pages/Documents";
import { Tasks } from "./pages/Tasks";
import { Notes } from "./pages/Notes";
import { Settings } from "./pages/Settings";
import { RoleManagement } from "./pages/RoleManagement";
import { UserManagement } from "./pages/UserManagement";
import { NewCustomerModal } from "./components/modals/NewCustomerModal";
import { NewContactPersonModal } from "./components/modals/NewContactPersonModal";
import { PipelineSettingsModal } from "./components/modals/PipelineSettingsModal";
import CustomersView from "./pages/Customers";
import { Toaster } from "./components/ui/sonner";
import { getToken, clearToken } from "./lib/api";

type Page =
  | "login"
  | "register"
  | "forgot-password"
  | "2fa"
  | "dashboard"
  | "pipeline"
  | "customers"
  | "customer-detail"
  | "documents"
  | "tasks"
  | "notes"
  | "settings"
  | "role-management"
  | "user-management";

type UserRole = "BEHEERDER" | "MEDEWERKER" | "KLANT";
interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
export interface PipelineStage {
  id: string;
  label: string;
  color?: string;
}
const defaultPipelineStages: PipelineStage[] = [
  { id: "NIEUW", label: "Nieuw" },
  { id: "IN_BEHANDELING", label: "In behandeling" },
  { id: "WACHT_OP_KLANT", label: "Wacht op klant" },
  { id: "AFGEROND", label: "Afgerond" },
];
interface CustomerLite {
  id: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

export default function App() {
  const [isDark, setIsDark] = useState(false);          // ✅ teruggezet
  const [currentPage, setCurrentPage] = useState<Page>(() =>
    getToken() ? "customers" : "login"
  );
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    id: "me",
    name: "Gebruiker",
    email: "gebruiker@example.com",
    role: "BEHEERDER",
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isNewContactPersonModalOpen, setIsNewContactPersonModalOpen] = useState(false);
  const [isPipelineSettingsModalOpen, setIsPipelineSettingsModalOpen] = useState(false);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(defaultPipelineStages);
  const [newCustomerInitialStage, setNewCustomerInitialStage] = useState<string>("NIEUW");
  const [showPipelineSelector, setShowPipelineSelector] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "TASK_ASSIGNED",
      title: "Nieuwe taak toegewezen",
      message: 'Je hebt een nieuwe taak gekregen: "Offerte opstellen voor website redesign"',
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      type: "DOCUMENT_UPLOADED",
      title: "Document geüpload",
      message: "Klant Sophie de Vries heeft een nieuw document geüpload",
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const authed = useMemo(() => Boolean(getToken()), [currentPage]);

  const handleLogout = () => {
    clearToken();
    setCurrentPage("login");
  };

  const handleNavigate = (page: string, id?: string) => {
    if (!authed && !["login", "register", "forgot-password"].includes(page)) {
      setCurrentPage("login");
      return;
    }
    if (page === "customer-detail" && id) {
      setSelectedCustomerId(id);
      setCurrentPage("customer-detail");
      return;
    }
    if (currentUser.role === "KLANT" && page === "dashboard") {
      setCurrentPage("documents");
      return;
    }
    setCurrentPage(page as Page);
  };

  // ======= AUTH SCREENS =======
  if (!authed) {
    if (currentPage === "register") {
      const mockInviteToken = "mock-invite-token-12345";
      return (
        <>
          <Toaster />
          <Register onNavigate={(p) => setCurrentPage(p as Page)} inviteToken={mockInviteToken} />
        </>
      );
    }
    if (currentPage === "forgot-password") {
      return (
        <>
          <Toaster />
          <ForgotPassword onNavigate={(p) => setCurrentPage(p as Page)} />
        </>
      );
    }
    return (
      <>
        <Toaster />
        <Login onNavigate={(p) => setCurrentPage(p as Page)} />
      </>
    );
  }

  // ======= MAIN APP =======
  return (
    <div className="flex h-screen" style={{ backgroundColor: "var(--background)" }}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        userRole={currentUser.role}
        userName={currentUser.name}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="h-16 border-b flex items-center justify-end px-6 gap-3"
          style={{ backgroundColor: "var(--panel)", borderColor: "var(--border)" }}
        >
          {currentUser.role !== "KLANT" && (
            <NotificationsPanel
              notifications={notifications}
              onMarkAsRead={(id) =>
                setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)))
              }
              onMarkAllAsRead={() => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })))}
              onDelete={(id) => setNotifications((ns) => ns.filter((n) => n.id !== id))}
              onNotificationClick={(n) => {
                if (n.type === "TASK_ASSIGNED") setCurrentPage("tasks");
                else if (n.type === "DOCUMENT_UPLOADED") setCurrentPage("documents");
                else setCurrentPage("pipeline");
              }}
            />
          )}
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {currentPage === "dashboard" && currentUser.role === "BEHEERDER" && (
            <Dashboard userName={currentUser.name} onNavigate={handleNavigate} currentUserId={currentUser.id} />
          )}

          {currentPage === "pipeline" && (
            <Pipeline
              onNavigate={handleNavigate}
              onOpenNewCustomer={(stage?: string) => {
                setShowPipelineSelector(true);
                setNewCustomerInitialStage(stage || "NIEUW");
                setIsNewCustomerModalOpen(true);
              }}
              onOpenPipelineSettings={() => setIsPipelineSettingsModalOpen(true)}
            />
          )}

          {currentPage === "customers" && (
            <CustomersView
              onNavigate={handleNavigate}
              onOpenNewCustomer={() => {
                setShowPipelineSelector(false);
                setNewCustomerInitialStage("NIEUW");
                setIsNewCustomerModalOpen(true);
              }}
              onAddToPipeline={(customer) => {
                setNotifications((ns) => [
                  {
                    id: Date.now().toString(),
                    type: "NEW_CUSTOMER",
                    title: "Klant toegevoegd aan pipeline",
                    message: `${customer.firstName || customer.companyName || "Klant"} is toegevoegd aan de pipeline`,
                    read: false,
                    createdAt: new Date().toISOString(),
                  },
                  ...ns,
                ]);
              }}
            />
          )}

          {currentPage === "customer-detail" && selectedCustomerId && (
            <CustomerDetail
              customerId={selectedCustomerId}
              onNavigate={handleNavigate}
              onOpenNewContactPerson={() => setIsNewContactPersonModalOpen(true)}
            />
          )}

          {currentPage === "documents" && <Documents onNavigate={handleNavigate} userRole={currentUser.role} />}
          {currentPage === "tasks" && <Tasks onNavigate={handleNavigate} />}
          {currentPage === "notes" && <Notes onNavigate={handleNavigate} />}
          {currentPage === "role-management" && currentUser.role === "BEHEERDER" && <RoleManagement />}
          {currentPage === "user-management" && currentUser.role === "BEHEERDER" && <UserManagement />}
          {currentPage === "settings" && (
            <Settings currentUser={currentUser} is2FAEnabled={false} onToggle2FA={() => {}} />
          )}
        </main>
      </div>

      {/* Modals */}
      <NewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => {
          setIsNewCustomerModalOpen(false);
          setShowPipelineSelector(false);
        }}
        onSave={(data: any) => {
          const display = data.type === "PERSON" ? `${data.firstName} ${data.lastName}` : data.companyName;
          setNotifications((ns) => [
            {
              id: Date.now().toString(),
              type: "NEW_CUSTOMER",
              title: "Nieuwe klant aangemaakt",
              message: `${display} is toegevoegd`,
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...ns,
          ]);
          if (currentPage === "pipeline" && (window as any).pipelineAddCustomer) {
            (window as any).pipelineAddCustomer({
              id: Date.now().toString(),
              firstName: data.firstName,
              lastName: data.lastName,
              companyName: data.companyName,
            });
          }
          if (currentPage === "customers" && (window as any).customersAddCustomer) {
            (window as any).customersAddCustomer({
              id: Date.now().toString(),
              firstName: data.firstName,
              lastName: data.lastName,
              companyName: data.companyName,
            });
          }
        }}
        initialPipelineStage={newCustomerInitialStage}
        showPipelineSelector={showPipelineSelector}
      />

      <NewContactPersonModal
        isOpen={isNewContactPersonModalOpen}
        onClose={() => setIsNewContactPersonModalOpen(false)}
        onSave={(data: any) => {
          setNotifications((ns) => [
            {
              id: Date.now().toString(),
              type: "NEW_CUSTOMER",
              title: "Contactpersoon toegevoegd",
              message: `${data.firstName} ${data.lastName} is toegevoegd als contactpersoon.`,
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...ns,
          ]);
        }}
      />

      <PipelineSettingsModal
        isOpen={isPipelineSettingsModalOpen}
        onClose={() => setIsPipelineSettingsModalOpen(false)}
        onSave={(stages) => {
          setPipelineStages(stages);
          setNotifications((ns) => [
            {
              id: Date.now().toString(),
              type: "NEW_CUSTOMER",
              title: "Pipeline statussen opgeslagen",
              message: "De wijzigingen zijn succesvol opgeslagen.",
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...ns,
          ]);
        }}
      />

      <Toaster />
    </div>
  );
}
