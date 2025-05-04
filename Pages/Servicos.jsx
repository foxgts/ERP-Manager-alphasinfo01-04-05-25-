import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import ServicesList from '../components/services/ServicesList';
import ServiceSchedule from '../components/services/ServiceSchedule';
import ServiceTypesList from '../components/services/ServiceTypesList';
import ServiceTypeForm from '../components/services/ServiceTypeForm';

export default function Servicos() {
  const [activeTab, setActiveTab] = useState("appointments");
  const [showSchedule, setShowSchedule] = useState(false);
  const [showServiceTypeForm, setShowServiceTypeForm] = useState(false);
  const [editingServiceType, setEditingServiceType] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Serviços</h1>
          <p className="text-muted-foreground mt-1">Gestão de serviços</p>
        </div>
        <Button
          onClick={() => activeTab === "catalog" ? setShowServiceTypeForm(true) : setShowSchedule(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          {activeTab === "catalog" ? 'Novo Serviço' : 'Novo Agendamento'}
        </Button>
      </div>

      <Tabs defaultValue="appointments" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
          <TabsTrigger value="catalog">Catálogo</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <ServicesList />
        </TabsContent>

        <TabsContent value="catalog">
          <ServiceTypesList onEdit={(serviceType) => {
            setEditingServiceType(serviceType);
            setShowServiceTypeForm(true);
          }} />
        </TabsContent>
      </Tabs>

      {showSchedule && (
        <ServiceSchedule onClose={() => setShowSchedule(false)} />
      )}

      {showServiceTypeForm && (
        <ServiceTypeForm
          serviceType={editingServiceType}
          onClose={() => {
            setShowServiceTypeForm(false);
            setEditingServiceType(null);
          }}
        />
      )}
    </div>
  );
}