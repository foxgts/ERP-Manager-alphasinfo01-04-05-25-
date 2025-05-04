import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from '@/entities/User';
import { AlertCircle, Check, Search, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import UserForm from './UserForm';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRole, setActiveRole] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
    checkAdminStatus();
  }, []);

  const loadUsers = async () => {
    try {
      const usersList = await User.list();
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      setIsAdmin(user.role === 'admin');
      if (user.role !== 'admin') {
        setMessage({
          type: 'warning',
          text: 'Você não tem permissão para gerenciar usuários. Entre em contato com um administrador.'
        });
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowDialog(true);
  };

  const handleSaveUser = async (userData) => {
    try {
      if (userData.id) {
        await User.update(userData.id, userData);
      }
      setShowDialog(false);
      setEditingUser(null);
      loadUsers();
      setMessage({ type: 'success', text: 'Usuário atualizado com sucesso!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao atualizar usuário' });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = activeRole === 'all' || user.role === activeRole;
    
    return matchesSearch && matchesRole;
  });

  const getDepartmentColor = (department) => {
    const colors = {
      vendas: 'bg-blue-100 text-blue-800',
      financeiro: 'bg-green-100 text-green-800',
      administrativo: 'bg-purple-100 text-purple-800',
      servicos: 'bg-orange-100 text-orange-800',
      gerencia: 'bg-red-100 text-red-800'
    };
    return colors[department] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 
          message.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <Check className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestão de Usuários</CardTitle>
            {isAdmin && (
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Convite de Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingUser ? 'Editar Usuário' : 'Convidar Novo Usuário'}
                    </DialogTitle>
                  </DialogHeader>
                  <UserForm 
                    user={editingUser} 
                    onSave={handleSaveUser} 
                    onCancel={() => {
                      setShowDialog(false);
                      setEditingUser(null);
                    }} 
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar usuários..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Tabs 
                defaultValue="all" 
                value={activeRole}
                onValueChange={setActiveRole}
              >
                <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="admin">Administradores</TabsTrigger>
                  <TabsTrigger value="manager">Gerentes</TabsTrigger>
                  <TabsTrigger value="user">Usuários</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((user) => (
                <Card 
                  key={user.id} 
                  className={`overflow-hidden ${
                    currentUser?.id === user.id ? 'border-blue-500' : ''
                  }`}
                  onClick={() => isAdmin && handleEditUser(user)}
                >
                  <div className={`h-2 ${
                    user.role === 'admin' ? 'bg-red-500' : 
                    user.role === 'manager' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.photo_url} />
                        <AvatarFallback className="bg-gray-200">
                          {user.full_name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.full_name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Função</span>
                        <span className="text-sm">
                          {user.position || 'Não definido'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-medium text-gray-500">Nível</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                          user.role === 'manager' ? 'bg-amber-100 text-amber-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? 'Administrador' : 
                           user.role === 'manager' ? 'Gerente' : 'Usuário'}
                        </span>
                      </div>
                      
                      {user.department && (
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-medium text-gray-500">Departamento</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getDepartmentColor(user.department)}`}>
                            {user.department}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredUsers.length === 0 && (
                <div className="col-span-full py-10 text-center text-gray-500">
                  Nenhum usuário encontrado com os filtros atuais
                </div>
              )}
            </div>

            {!isAdmin && (
              <div className="text-sm text-gray-500 text-center">
                Apenas administradores podem editar usuários
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}