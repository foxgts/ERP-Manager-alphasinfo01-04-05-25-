import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientsMap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
          <p className="text-gray-500">Mapa de localização dos clientes será implementado aqui</p>
        </div>
      </CardContent>
    </Card>
  );
}