import React from 'react';
import { Card } from "@/components/ui/card";
import ProfileSettings from '../components/settings/ProfileSettings';

export default function Perfil() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas informações pessoais</p>
      </div>

      <Card className="p-6">
        <ProfileSettings />
      </Card>
    </div>
  );
}