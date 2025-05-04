import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, MoreHorizontal, Mail, Phone, UserCheck, UserX } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from '@/entities/User';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function Funcionarios() {
  const [employees, setEmployees] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const users = await User.list();
      setEmployees(users);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowAddForm(true);
  };

  const roleLabels = {
    'administrador': { label: 'Administrador', class: 'bg-blue-100 text-blue-800' },
    'gerente': { label: 'Gerente', class: 'bg-purple-100 text-purple-800' },
    'vendedor': { label: 'Vendedor', class: 'bg-green-100 text-green-800' },
    'administrativo': { label: 'Administrativo', class: 'bg-yellow-100 text-yellow-800' },
    'user': { label: 'Usuário', class: 'bg-gray-100 text-gray-800' }
  };

  if (showAddForm) {
    return <EmployeeForm employee={editingEmployee} onCancel={() => {
      setShowAddForm(false);
      setEditingEmployee(null);
    }} onSave={() => {
      setShowAddForm(false);
      setEditingEmployee(null);
      loadEmployees();
    }} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Funcionários</h1>
          <p className="text-muted-foreground mt-1">Gerenciamento da equipe</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Funcionário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Funcionários</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-280px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum funcionário cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="font-medium">{employee.full_name}</div>
                        {employee.cargo && <div className="text-sm text-muted-foreground">{employee.cargo}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{employee.email}</span>
                        </div>
                        {employee.telefone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{employee.telefone}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {employee.tipo && (
                          <Badge className={roleLabels[employee.tipo]?.class || 'bg-gray-100'}>
                            {roleLabels[employee.tipo]?.label || employee.tipo}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {employee.ativo === false ? (
                          <Badge variant="outline" className="text-red-500 border-red-200">
                            <UserX className="h-3 w-3 mr-1" /> Inativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-500 border-green-200">
                            <UserCheck className="h-3 w-3 mr-1" /> Ativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(employee)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => alert('Esta função está disponível apenas para administradores do sistema.')}>
                              Alterar Permissões
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => alert('Esta função está disponível apenas para administradores do sistema.')}>
                              {employee.ativo === false ? 'Ativar Usuário' : 'Desativar Usuário'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function EmployeeForm({ employee, onCancel, onSave }) {
  const [formData, setFormData] = useState(employee || {
    full_name: '',
    email: '',
    tipo: 'user',
    cargo: '',
    telefone: '',
    ativo: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (employee) {
        alert('Operação não permitida. Usuários só podem ser modificados pelo administrador do sistema.');
      } else {
        alert('Operação não permitida. Novos usuários precisam ser convidados pelo administrador do sistema.');
      }
      onSave();
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error);
      alert("Erro ao salvar funcionário");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{employee ? 'Editar Funcionário' : 'Novo Funcionário'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome Completo</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <input
                type="email"
                className="w-full p-2 border rounded-md"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Cargo</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={formData.cargo || ''}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={formData.telefone || ''}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.tipo || 'user'}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                <option value="administrador">Administrador</option>
                <option value="gerente">Gerente</option>
                <option value="vendedor">Vendedor</option>
                <option value="administrativo">Administrativo</option>
                <option value="user">Usuário</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.ativo === false ? 'inativo' : 'ativo'}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.value === 'ativo' })}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}