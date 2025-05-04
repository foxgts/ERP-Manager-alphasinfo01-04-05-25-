import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { 
  Home, 
  Package, 
  Users, 
  FileText, 
  Settings, 
  Menu, 
  X, 
  LogOut, 
  Sun, 
  Moon,
  ChevronDown,
  Bell,
  Calendar,
  PieChart,
  UserCircle,
  BarChart3,
  CreditCard,
  CheckCircle,
  Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("claro");
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        setTheme(userData.tema || "claro");
        setIsAdmin(userData.tipo === "administrador" || userData.tipo === "gerente");
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const toggleTheme = async () => {
    const newTheme = theme === "claro" ? "escuro" : "claro";
    setTheme(newTheme);
    
    if (user) {
      try {
        await User.updateMyUserData({ tema: newTheme });
      } catch (error) {
        console.error("Erro ao atualizar tema:", error);
      }
    }
  };
  
  const handleLogout = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };
  
  const navItems = [
    {
      name: "Dashboard",
      icon: <Home className="w-5 h-5" />,
      url: createPageUrl("Dashboard"),
      access: ["administrador", "administrativo", "gerente", "vendedor"]
    },
    {
      name: "PDV",
      icon: <CreditCard className="w-5 h-5" />,
      url: createPageUrl("PDV"),
      access: ["administrador", "gerente", "vendedor"]
    },
    {
      name: "Orçamentos",
      icon: <FileText className="w-5 h-5" />,
      url: createPageUrl("Orcamentos"),
      access: ["administrador", "gerente", "vendedor"]
    },
    {
      name: "Ordem de Serviço",
      icon: <Wrench className="w-5 h-5" />,
      url: createPageUrl("OrdemServico"),
      access: ["administrador", "administrativo", "gerente", "vendedor"]
    },
    {
      name: "Serviços",
      icon: <CheckCircle className="w-5 h-5" />,
      url: createPageUrl("Servicos"),
      access: ["administrador", "administrativo", "gerente", "vendedor"]
    },
    {
      name: "Financeiro",
      icon: <PieChart className="w-5 h-5" />,
      url: createPageUrl("Financeiro"),
      access: ["administrador", "administrativo", "gerente"]
    },
    {
      name: "Produtos",
      icon: <Package className="w-5 h-5" />,
      url: createPageUrl("Produtos"),
      access: ["administrador", "administrativo", "gerente", "vendedor"]
    },
    {
      name: "Clientes",
      icon: <Users className="w-5 h-5" />,
      url: createPageUrl("Clientes"),
      access: ["administrador", "administrativo", "gerente", "vendedor"]
    },
    {
      name: "Relatórios",
      icon: <BarChart3 className="w-5 h-5" />,
      url: createPageUrl("Relatorios"),
      access: ["administrador", "gerente"]
    },
    {
      name: "Calendário",
      icon: <Calendar className="w-5 h-5" />,
      url: createPageUrl("Calendario"),
      access: ["administrador", "administrativo", "gerente", "vendedor"]
    },
    {
      name: "Funcionários",
      icon: <UserCircle className="w-5 h-5" />,
      url: createPageUrl("Funcionarios"),
      access: ["administrador", "gerente"]
    },
    {
      name: "Configurações",
      icon: <Settings className="w-5 h-5" />,
      url: createPageUrl("Configuracoes"),
      access: ["administrador"]
    }
  ];
  
  // Filtra itens de navegação com base no acesso do usuário
  const filteredNavItems = user ? navItems.filter(item => 
    !user.tipo || item.access.includes(user.tipo)
  ) : [];

  return (
    <div className={theme === "escuro" ? "dark" : ""}>
      <style jsx global>{`
        :root {
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --card: 0 0% 100%;
          --card-foreground: 222.2 84% 4.9%;
          --popover: 0 0% 100%;
          --popover-foreground: 222.2 84% 4.9%;
          --primary: 221.2 83.2% 53.3%;
          --primary-foreground: 210 40% 98%;
          --secondary: 210 40% 96.1%;
          --secondary-foreground: 222.2 47.4% 11.2%;
          --muted: 210 40% 96.1%;
          --muted-foreground: 215.4 16.3% 46.9%;
          --accent: 210 40% 96.1%;
          --accent-foreground: 222.2 47.4% 11.2%;
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 210 40% 98%;
          --border: 214.3 31.8%b 91.4%;
          --input: 214.3 31.8% 91.4%;
          --ring: 221.2 83.2% 53.3%;
          --radius: 0.5rem;
        }

        .dark {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
          --card: 222.2 84% 9.8%;
          --card-foreground: 210 40% 98%;
          --popover: 222.2 84% 7%;
          --popover-foreground: 210 40% 98%;
          --primary: 217.2 91.2% 59.8%;
          --primary-foreground: 222.2 47.4% 11.2%;
          --secondary: 217.2 32.6% 17.5%;
          --secondary-foreground: 210 40% 98%;
          --muted: 217.2 32.6% 17.5%;
          --muted-foreground: 215 20.2% 65.1%;
          --accent: 217.2 32.6% 17.5%;
          --accent-foreground: 210 40% 98%;
          --destructive: 0 62.8% 50.6%;
          --destructive-foreground: 210 40% 98%;
          --border: 217.2 32.6% 17.5%;
          --input: 217.2 32.6% 17.5%;
          --ring: 224.3 76.3% 48%;
        }
        
        body {
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
        }
      `}</style>

      {/* Layout principal */}
      <div className="flex h-screen overflow-hidden">
        {/* Overlay para dispositivos móveis */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={toggleSidebar}
          />
        )}
        
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-30 h-full w-64 bg-card text-card-foreground border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:z-0 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <h1 className="text-xl font-bold">GestãoERP</h1>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="py-4">
            <nav className="px-3 space-y-1">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.url}
                  onClick={closeSidebar}
                  className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.url
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span className="mr-3 opacity-80">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        
        {/* Conteúdo principal */}
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          {/* Header */}
          <header className="h-16 px-4 border-b border-border bg-card">
            <div className="flex items-center justify-between h-full">
              {/* Botão toggle do menu para dispositivos móveis */}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              {/* Título da página */}
              <h2 className="text-xl font-semibold hidden md:block">{currentPageName}</h2>
              
              {/* Ações do cabeçalho */}
              <div className="flex items-center space-x-3">
                {/* Botão de tema */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleTheme}
                      >
                        {theme === "claro" ? (
                          <Moon className="h-5 w-5" />
                        ) : (
                          <Sun className="h-5 w-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Alternar tema</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Menu do usuário */}
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9 border border-border">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">{user.full_name}</p>
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl("Perfil")} className="cursor-pointer">
                          Meu Perfil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl("Configuracoes")} className="cursor-pointer">
                          Configurações
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="text-destructive focus:text-destructive cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </header>
          
          {/* Conteúdo principal */}
          <main className="flex-1 overflow-y-auto p-4 bg-background">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}