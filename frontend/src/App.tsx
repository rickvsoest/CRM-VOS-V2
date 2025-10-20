import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { ThemeToggle } from "./components/ThemeToggle";
import { NotificationsPanel, Notification } from "./components/NotificationsPanel";
import { Login } from "./pages/Login";
import { TwoFactorAuth } from "./pages/TwoFactorAuth";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Dashboard } from "./pages/Dashboard";
import { Pipeline } from "./pages/Pipeline";
import { Customers } from "./pages/Customers";
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
import {
  mockUsers,
  mockCustomers,
  Customer,
  PipelineStage,
  defaultPipelineStages,
} from "./lib/mockData";
import { Toaster } from "./components/ui/sonner";

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

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    string | null
  >(null);
  const [currentUser, setCurrentUser] = useState(mockUsers[0]); // Default to Anita (admin)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] =
    useState(false);
  const [
    isNewContactPersonModalOpen,
    setIsNewContactPersonModalOpen,
  ] = useState(false);
  const [
    isPipelineSettingsModalOpen,
    setIsPipelineSettingsModalOpen,
  ] = useState(false);
  const [pipelineStages, setPipelineStages] = useState<
    PipelineStage[]
  >(defaultPipelineStages);
  const [newCustomerInitialStage, setNewCustomerInitialStage] =
    useState<string>("NIEUW");
  const [showPipelineSelector, setShowPipelineSelector] =
    useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'TASK_ASSIGNED',
      title: 'Nieuwe taak toegewezen',
      message: 'Je hebt een nieuwe taak gekregen: "Offerte opstellen voor website redesign"',
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'DOCUMENT_UPLOADED',
      title: 'Document geÃ¼pload',
      message: 'Klant Sophie de Vries heeft een nieuw document geÃ¼pload',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleLogin = (email: string, password: string) => {
    // Simple mock authentication
    const user = mockUsers.find((u) => u.email === email);
    if (user) {
      setCurrentUser(user);
      setCurrentPage("2fa");
    } else {
      // Show error toast
      import('sonner').then(({ toast }) => {
        toast.error('Login mislukt', {
          description: 'Onjuist e-mailadres of wachtwoord.',
        });
      });
    }
  };

  const handle2FAVerify = (code: string) => {
    // Simple mock verification - accept any 6 digit code
    if (code.length === 6) {
      setIsAuthenticated(true);
      // Redirect based on role
      if (currentUser.role === "KLANT") {
        setCurrentPage("documents");
      } else if (currentUser.role === "MEDEWERKER") {
        setCurrentPage("pipeline");
      } else {
        setCurrentPage("dashboard");
      }
      
      // Show welcome toast
      import('sonner').then(({ toast }) => {
        toast.success('Welkom terug!', {
          description: `Ingelogd als ${currentUser.name}`,
        });
      });
    } else {
      import('sonner').then(({ toast }) => {
        toast.error('Ongeldige code', {
          description: 'Voer een 6-cijferige code in.',
        });
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage("login");
  };

  const handleNavigate = (page: string, id?: string) => {
    if (page === "customer-detail" && id) {
      setSelectedCustomerId(id);
      setCurrentPage("customer-detail");
    } else {
      // For KLANT role, redirect to documents if trying to access dashboard
      if (
        currentUser.role === "KLANT" &&
        page === "dashboard"
      ) {
        setCurrentPage("documents");
      } else {
        setCurrentPage(page as Page);
      }
    }
  };

  const handleNewCustomerSave = (data: any) => {
    // Create new customer object
    const newCustomer: any = {
      id: Date.now().toString(),
      type: data.type,
      status: data.pipelineStage || "NIEUW",
      lastActivity: new Date().toISOString(),
      email: data.email,
      phone: data.phone,
      postalCode: data.postalCode,
      houseNumber: data.houseNumber,
      houseNumberAddition: data.houseNumberAddition,
      street: data.street,
      city: data.city,
      createdAt: new Date().toISOString(),
      ...(data.type === "PERSON"
        ? {
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
          }
        : {
            companyName: data.companyName,
            kvk: data.kvk,
            btw: data.btw,
          }),
    };

    console.log("New customer:", newCustomer);

    // Trigger callback to update the current page's customer list
    if (
      currentPage === "pipeline" &&
      (window as any).pipelineAddCustomer
    ) {
      (window as any).pipelineAddCustomer(newCustomer);
    } else if (
      currentPage === "customers" &&
      (window as any).customersAddCustomer
    ) {
      (window as any).customersAddCustomer(newCustomer);
    }

    // Add notification
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: 'NEW_CUSTOMER',
      title: 'Nieuwe klant aangemaakt',
      message: `${data.type === 'PERSON' ? data.firstName + ' ' + data.lastName : data.companyName} is toegevoegd`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications([newNotification, ...notifications]);

    import('sonner').then(({ toast }) => {
      toast.success('Klant aangemaakt!', {
        description: 'De klant is succesvol toegevoegd aan het systeem.',
      });
    });
  };

  const handleNewContactPersonSave = (data: any) => {
    console.log("New contact person:", data);
    import('sonner').then(({ toast }) => {
      toast.success('Contactpersoon toegevoegd!', {
        description: `${data.firstName} ${data.lastName} is toegevoegd als contactpersoon.`,
      });
    });
  };

  const handlePipelineStagesSave = (
    stages: PipelineStage[],
  ) => {
    setPipelineStages(stages);
    import('sonner').then(({ toast }) => {
      toast.success('Pipeline statussen opgeslagen!', {
        description: 'De wijzigingen zijn succesvol opgeslagen.',
      });
    });
  };

  const handleAddToPipeline = (customer: Customer) => {
    // Add notification
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: 'NEW_CUSTOMER',
      title: 'Klant toegevoegd aan pipeline',
      message: `${customer.firstName || customer.companyName} is toegevoegd aan de pipeline`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications([newNotification, ...notifications]);
    
    // Add to pipeline (via global callback)
    if ((window as any).pipelineAddCustomer) {
      (window as any).pipelineAddCustomer(customer);
    }

    import('sonner').then(({ toast }) => {
      toast.success('Klant toegevoegd aan pipeline!');
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    // Navigate based on notification type
    if (notification.type === 'TASK_ASSIGNED') {
      setCurrentPage('tasks');
    } else if (notification.type === 'DOCUMENT_UPLOADED') {
      setCurrentPage('documents');
    } else if (notification.type === 'LEAD_COMPLETED' || notification.type === 'NEW_CUSTOMER') {
      setCurrentPage('pipeline');
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Login and authentication pages
  if (!isAuthenticated) {
    if (currentPage === "register") {
      // Extract invite token from URL in real app
      const mockInviteToken = "mock-invite-token-12345";
      return (
        <>
          <Toaster />
          <Register onNavigate={(page) => setCurrentPage(page as Page)} inviteToken={mockInviteToken} />
        </>
      );
    }
    if (currentPage === "forgot-password") {
      return (
        <>
          <Toaster />
          <ForgotPassword onNavigate={(page) => setCurrentPage(page as Page)} />
        </>
      );
    }
    if (currentPage === "2fa") {
      return (
        <>
          <Toaster />
          <TwoFactorAuth
            onVerify={handle2FAVerify}
            showQR={false}
          />
        </>
      );
    }
    return (
      <>
        <Toaster />
        <Login onLogin={handleLogin} onNavigate={(page) => setCurrentPage(page as Page)} />
      </>
    );
  }

  // Main app layout
  return (
    <div
      className="flex h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
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
          style={{
            backgroundColor: "var(--panel)",
            borderColor: "var(--border)",
          }}
        >
          {currentUser.role !== "KLANT" && (
            <NotificationsPanel
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onDelete={handleDeleteNotification}
              onNotificationClick={handleNotificationClick}
            />
          )}
          <ThemeToggle
            isDark={isDark}
            onToggle={() => setIsDark(!isDark)}
          />
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {currentPage === "dashboard" &&
            currentUser.role === "BEHEERDER" && (
              <Dashboard
                userName={currentUser.name}
                onNavigate={handleNavigate}
                currentUserId={currentUser.id}
              />
            )}
          {currentPage === "pipeline" && (
            <Pipeline
              onNavigate={handleNavigate}
              onOpenNewCustomer={(stage?: string) => {
                setShowPipelineSelector(true);
                setNewCustomerInitialStage(stage || "NIEUW");
                setIsNewCustomerModalOpen(true);
              }}
              onOpenPipelineSettings={() =>
                setIsPipelineSettingsModalOpen(true)
              }
            />
          )}
          {currentPage === "customers" && (
            <Customers
              onNavigate={handleNavigate}
              onOpenNewCustomer={() => {
                setShowPipelineSelector(false);
                setNewCustomerInitialStage("NIEUW");
                setIsNewCustomerModalOpen(true);
              }}
              onAddToPipeline={handleAddToPipeline}
            />
          )}
          {currentPage === "customer-detail" &&
            selectedCustomerId && (
              <CustomerDetail
                customerId={selectedCustomerId}
                onNavigate={handleNavigate}
                onOpenNewContactPerson={() =>
                  setIsNewContactPersonModalOpen(true)
                }
              />
            )}
          {currentPage === "documents" && (
            <Documents
              onNavigate={handleNavigate}
              userRole={currentUser.role}
            />
          )}
          {currentPage === "tasks" && (
            <Tasks onNavigate={handleNavigate} />
          )}
          {currentPage === "notes" && (
            <Notes onNavigate={handleNavigate} />
          )}
          {currentPage === "role-management" &&
            currentUser.role === "BEHEERDER" && (
              <RoleManagement />
            )}
          {currentPage === "user-management" &&
            currentUser.role === "BEHEERDER" && (
              <UserManagement />
            )}
          {currentPage === "settings" && (
            <Settings
              currentUser={currentUser}
              is2FAEnabled={is2FAEnabled}
              onToggle2FA={() => setIs2FAEnabled(!is2FAEnabled)}
            />
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
        onSave={handleNewCustomerSave}
        initialPipelineStage={newCustomerInitialStage}
        showPipelineSelector={showPipelineSelector}
      />
      <NewContactPersonModal
        isOpen={isNewContactPersonModalOpen}
        onClose={() => setIsNewContactPersonModalOpen(false)}
        onSave={handleNewContactPersonSave}
      />
      <PipelineSettingsModal
        isOpen={isPipelineSettingsModalOpen}
        onClose={() => setIsPipelineSettingsModalOpen(false)}
        onSave={handlePipelineStagesSave}
      />

      <Toaster />
    </div>
  );
}

