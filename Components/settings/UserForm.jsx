import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UserForm({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState(user || {
    full_name: '',
    email: '',
    department: '',
    role: 'user',
    position: '',
    photo_url: '',
  });
  
  // Neste contexto, estamos apenas editando usuários existentes
  // A função de convite de usuário é apenas ilustrativa pois é gerenciada pela plataforma
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!user && (
        <div className="p-4 rounded-md bg-yellow-50 text-yellow-800 text-sm">
          NOTA: Esta é uma funcionalidade ilustrativa. Em produção, os usuários são convidados pela plataforma.
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="department">Departamento</Label>
        <Select
          value={formData.department}
          onValueChange={(value) => setFormData({ ...formData, department: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vendas">Vendas</SelectItem>
            <SelectItem value="financeiro">Financeiro</SelectItem>
            <SelectItem value="administrativo">Administrativo</SelectItem>
            <SelectItem value="servicos">Serviços</SelectItem>
            <SelectItem value="gerencia">Gerência</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="role">Nível de Acesso</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData({ ...formData, role: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o nível de acesso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Usuário</SelectItem>
            <SelectItem value="manager">Gerente</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="position">Cargo/Função</Label>
        <Input
          id="position"
          value={formData.position || ''}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          placeholder="Ex: Vendedor"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="photo_url">URL da Foto</Label>
        <Input
          id="photo_url"
          value={formData.photo_url || ''}
          onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
          placeholder="https://..."
        />
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700" type="submit">
          {user ? 'Atualizar Usuário' : 'Convidar Usuário'}
        </Button>
      </div>
    </form>
  );
}