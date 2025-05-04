import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { User } from '@/entities/User';

export default function CompanySettings() {
  const [companyData, setCompanyData] = useState({
    name: '',
    document: '',
    phone: '',
    email: '',
    address: '',
    logo_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      const userData = await User.me();
      if (userData.company_data) {
        setCompanyData(userData.company_data);
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await User.updateMyUserData({ company_data: companyData });
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da Empresa</CardTitle>
      </CardHeader>
      <CardContent>
        {message.text && (
          <div className={`p-3 mb-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}
        
        <form className="space-y-6" onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa</Label>
              <Input
                id="name"
                value={companyData.name}
                onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">CNPJ</Label>
              <Input
                id="document"
                value={companyData.document}
                onChange={(e) => setCompanyData({ ...companyData, document: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={companyData.phone}
                onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={companyData.email}
                onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">URL do Logo</Label>
              <Input
                id="logo_url"
                value={companyData.logo_url}
                onChange={(e) => setCompanyData({ ...companyData, logo_url: e.target.value })}
                placeholder="https://..."
              />
              {companyData.logo_url && (
                <div className="mt-2 p-2 border rounded">
                  <img 
                    src={companyData.logo_url} 
                    alt="Logo da empresa" 
                    className="h-16 object-contain" 
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = 'https://via.placeholder.com/150?text=Logo+Inválido';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço Completo</Label>
            <Textarea
              id="address"
              value={companyData.address}
              onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}