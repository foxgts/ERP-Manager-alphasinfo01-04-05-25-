import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientsList from '../components/clients/ClientsList';
import ClientsMap from '../components/clients/ClientsMap';
import ClientsBirthdays from '../components/clients/ClientsBirthdays';

export default function Clients() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-500 mt-1">Gestão e acompanhamento de clientes</p>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="map">Mapa</TabsTrigger>
          <TabsTrigger value="birthdays">Aniversários</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <ClientsList />
        </TabsContent>

        <TabsContent value="map">
          <ClientsMap />
        </TabsContent>

        <TabsContent value="birthdays">
          <ClientsBirthdays />
        </TabsContent>
      </Tabs>
    </div>
  );
}