import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CompanySettings from '../components/settings/CompanySettings';
import UsersManagement from '../components/settings/UsersManagement';
import ProfileSettings from '../components/settings/ProfileSettings';

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 mt-1">Configure os dados da sua empresa e usuários</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="company">
          <CompanySettings />
        </TabsContent>

        <TabsContent value="users">
          <UsersManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}