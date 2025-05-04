import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from '@/entities/User';
import { Camera } from 'lucide-react';

export default function ProfileSettings() {
  const [userData, setUserData] = useState({
    full_name: '',
    email: '',
    department: '',
    role: '',
    position: '',
    phone: '',
    birth_date: '',
    address: '',
    photo_url: '',
    document: '',
    emergency_contact: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await User.me();
      setUserData({
        full_name: user.full_name || '',
        email: user.email || '',
        department: user.department || '',
        role: user.role || '',
        position: user.position || '',
        phone: user.phone || '',
        birth_date: user.birth_date || '',
        address: user.address || '',
        photo_url: user.photo_url || '',
        document: user.document || '',
        emergency_contact: user.emergency_contact || ''
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Remove read-only properties
      const { full_name, email, role, ...updatableData } = userData;
      
      await User.updateMyUserData(updatableData);
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações de Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        {message.text && (
          <div className={`p-3 mb-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={userData.photo_url} />
              <AvatarFallback className="bg-blue-100 text-blue-800 text-xl">
                {userData.full_name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-md">
              <Camera className="w-4 h-4 text-gray-500" />
            </div>
          </div>
          <div className="space-y-1 text-center">
            <p className="text-lg font-medium">{userData.full_name}</p>
            <p className="text-sm text-gray-500">{userData.email}</p>
            <p className="text-sm">
              <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {userData.role === 'admin' ? 'Administrador' : 
                 userData.role === 'manager' ? 'Gerente' : 'Usuário'}
              </span>
            </p>
          </div>
        </div>
        
        <form className="space-y-6" onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={userData.full_name}
                disabled
              />
              <p className="text-xs text-gray-500">Campo gerenciado pelo sistema</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                value={userData.department}
                onChange={(e) => setUserData({ ...userData, department: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Cargo/Função</Label>
              <Input
                id="position"
                value={userData.position}
                onChange={(e) => setUserData({ ...userData, position: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="photo_url">URL da Foto</Label>
              <Input
                id="photo_url"
                value={userData.photo_url}
                onChange={(e) => setUserData({ ...userData, photo_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input
                id="birth_date"
                type="date"
                value={userData.birth_date}
                onChange={(e) => setUserData({ ...userData, birth_date: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document">CPF</Label>
              <Input
                id="document"
                value={userData.document}
                onChange={(e) => setUserData({ ...userData, document: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emergency_contact">Contato de Emergência</Label>
              <Input
                id="emergency_contact"
                value={userData.emergency_contact}
                onChange={(e) => setUserData({ ...userData, emergency_contact: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço Completo</Label>
            <Textarea
              id="address"
              value={userData.address}
              onChange={(e) => setUserData({ ...userData, address: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Atualizar Perfil'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}