import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Service } from '@/entities/Service';
import { ServiceType } from '@/entities/ServiceType';
import { Client } from '@/entities/Client';
import { format } from "date-fns";
import { ArrowLeft, Clock } from "lucide-react";

export default function ServiceSchedule({ onClose }) {
  const [clients, setClients] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [formData, setFormData] = useState({
    client_id: '',
    service_type_id: '',
    description: '',
    scheduled_date: '',
    scheduled_time: '',
    price: '',
    status: 'agendado',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedServiceType) {
      setFormData({
        ...formData,
        description: selectedServiceType.name,
        price: selectedServiceType.base_price
      });
    }
  }, [selectedServiceType]);

  const loadData = async () => {
    const [clientsData, serviceTypesData] = await Promise.all([
      Client.list(),
      ServiceType.list()
    ]);
    setClients(clientsData);
    setServiceTypes(serviceTypesData);
  };

  const handleServiceTypeChange = (id) => {
    const selected = serviceTypes.find(type => type.id === id);
    setSelectedServiceType(selected);
    setFormData({
      ...formData,
      service_type_id: id
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Combine date and time
      const dateTime = formData.scheduled_date && formData.scheduled_time ? 
        `${formData.scheduled_date}T${formData.scheduled_time}` : 
        null;

      await Service.create({
        client_id: formData.client_id,
        description: formData.description,
        scheduled_date: dateTime,
        price: parseFloat(formData.price),
        status: formData.status,
        notes: formData.notes,
        service_type_id: formData.service_type_id
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao agendar serviço:', error);
      alert('Erro ao agendar serviço');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Agendar Serviço</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Serviço</Label>
              <Select
                value={formData.service_type_id}
                onValueChange={handleServiceTypeChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de serviço" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((serviceType) => (
                    <SelectItem key={serviceType.id} value={serviceType.id}>
                      {serviceType.name} - R$ {serviceType.base_price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                required
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            <div className="space-y-2">
              <Label>Horário</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição do Serviço</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Agendando...' : 'Agendar Serviço'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}