import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import ServicesList from '../components/services/ServicesList';
import ServiceSchedule from '../components/services/ServiceSchedule';
import ServiceTypesList from '../components/services/ServiceTypesList';
import ServiceTypeForm from '../components/services/ServiceTypeForm';

export default function Services() {
  const [activeTab, setActiveTab] = useState("appointments");
  const [showSchedule, setShowSchedule] = useState(false);
  const [showServiceTypeForm, setShowServiceTypeForm] = useState(false);
  const [editingServiceType, setEditingServiceType] = useState(null);

  const handleEditServiceType = (serviceType) => {
    setEditingServiceType(serviceType);
    setShowServiceTypeForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-500 mt-1">Agendamento e controle de serviços</p>
        </div>
        {!showServiceTypeForm && !showSchedule && (
          <Button
            onClick={() => activeTab === "catalog" ? setShowServiceTypeForm(true) : setShowSchedule(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {activeTab === "catalog" ? 'Novo Serviço' : 'Novo Agendamento'}
          </Button>
        )}
      </div>

      {showSchedule ? (
        <ServiceSchedule onClose={() => setShowSchedule(false)} />
      ) : showServiceTypeForm ? (
        <ServiceTypeForm 
          serviceType={editingServiceType} 
          onClose={() => {
            setShowServiceTypeForm(false);
            setEditingServiceType(null);
          }} 
        />
      ) : (
        <>
          <Tabs 
            defaultValue="appointments" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList>
              <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
              <TabsTrigger value="catalog">Catálogo de Serviços</TabsTrigger>
            </TabsList>

            <TabsContent value="appointments">
              <ServicesList />
            </TabsContent>

            <TabsContent value="catalog">
              <ServiceTypesList onEdit={handleEditServiceType} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}