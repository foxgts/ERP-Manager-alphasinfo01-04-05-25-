import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Printer, FileDown } from "lucide-react";
import { Client } from "@/entities/Client";
import { ServiceOrder } from "@/entities/ServiceOrder";
import { ServiceType } from "@/entities/ServiceType";
import { Product } from "@/entities/Product";

export default function OrdemServico() {
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, clientsData, serviceTypesData] = await Promise.all([
        ServiceOrder.list('-created_date'),
        Client.list(),
        ServiceType.list()
      ]);
      
      setOrders(ordersData);
      setClients(clientsData);
      setServiceTypes(serviceTypesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = () => {
    setEditingOrder(null);
    setShowForm(true);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleSaveOrder = async (orderData) => {
    try {
      if (editingOrder) {
        await ServiceOrder.update(editingOrder.id, orderData);
      } else {
        await ServiceOrder.create(orderData);
      }
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar ordem de serviço:", error);
    }
  };

  const handlePrintOrder = (order) => {
    alert(`Imprimindo ordem de serviço ${order.id}...`);
  };

  const handleSavePDF = (order) => {
    alert(`Salvando ordem de serviço ${order.id} como PDF...`);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: "Pendente", class: "bg-yellow-100 text-yellow-800" },
      in_progress: { label: "Em Andamento", class: "bg-blue-100 text-blue-800" },
      completed: { label: "Concluído", class: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelado", class: "bg-red-100 text-red-800" },
    };

    const statusInfo = statusMap[status] || { label: status, class: "bg-gray-100 text-gray-800" };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : "Cliente não encontrado";
  };

  const getServiceTypeName = (serviceTypeId) => {
    const serviceType = serviceTypes.find(st => st.id === serviceTypeId);
    return serviceType ? serviceType.name : "Serviço não encontrado";
  };

  if (showForm) {
    return (
      <OrderForm 
        order={editingOrder} 
        onSave={handleSaveOrder} 
        onCancel={() => setShowForm(false)} 
        clients={clients}
        serviceTypes={serviceTypes}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
          <p className="text-muted-foreground mt-1">Gestão e acompanhamento de ordens de serviço</p>
        </div>
        <Button
          onClick={handleCreateOrder}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Ordem de Serviço
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="in_progress">Em Andamento</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <OrdersTable 
            orders={orders}
            getClientName={getClientName}
            getServiceTypeName={getServiceTypeName}
            getStatusBadge={getStatusBadge}
            onEdit={handleEditOrder}
            onPrint={handlePrintOrder}
            onSavePDF={handleSavePDF}
            loading={loading}
          />
        </TabsContent>
        <TabsContent value="pending">
          <OrdersTable 
            orders={orders.filter(order => order.status === 'pending')}
            getClientName={getClientName}
            getServiceTypeName={getServiceTypeName}
            getStatusBadge={getStatusBadge}
            onEdit={handleEditOrder}
            onPrint={handlePrintOrder}
            onSavePDF={handleSavePDF}
            loading={loading}
          />
        </TabsContent>
        <TabsContent value="in_progress">
          <OrdersTable 
            orders={orders.filter(order => order.status === 'in_progress')}
            getClientName={getClientName}
            getServiceTypeName={getServiceTypeName}
            getStatusBadge={getStatusBadge}
            onEdit={handleEditOrder}
            onPrint={handlePrintOrder}
            onSavePDF={handleSavePDF}
            loading={loading}
          />
        </TabsContent>
        <TabsContent value="completed">
          <OrdersTable 
            orders={orders.filter(order => order.status === 'completed')}
            getClientName={getClientName}
            getServiceTypeName={getServiceTypeName}
            getStatusBadge={getStatusBadge}
            onEdit={handleEditOrder}
            onPrint={handlePrintOrder}
            onSavePDF={handleSavePDF}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OrdersTable({ orders, getClientName, getServiceTypeName, getStatusBadge, onEdit, onPrint, onSavePDF, loading }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b">
              <tr>
                <th className="py-3 px-4 text-left">Número</th>
                <th className="py-3 px-4 text-left">Cliente</th>
                <th className="py-3 px-4 text-left">Serviço</th>
                <th className="py-3 px-4 text-left">Data</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center">Carregando...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Nenhuma ordem de serviço encontrada
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{order.number || order.id.substr(0, 8)}</td>
                    <td className="py-3 px-4">{getClientName(order.client_id)}</td>
                    <td className="py-3 px-4">{getServiceTypeName(order.service_type_id)}</td>
                    <td className="py-3 px-4">
                      {order.scheduled_date ? new Date(order.scheduled_date).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(order)}>
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onPrint(order)}>
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onSavePDF(order)}>
                          <FileDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderForm({ order, onSave, onCancel, clients, serviceTypes }) {
  const [formData, setFormData] = useState(order || {
    client_id: '',
    service_type_id: '',
    description: '',
    status: 'pending',
    scheduled_date: new Date().toISOString().split('T')[0],
    price: 0,
    client_item: {
      type: '',
      brand: '',
      model: '',
      serial_number: '',
      condition: ''
    },
    products: [],
    technician_notes: ''
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleClientItemChange = (field, value) => {
    setFormData({
      ...formData,
      client_item: {
        ...formData.client_item,
        [field]: value
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleServiceTypeChange = (serviceTypeId) => {
    const selectedServiceType = serviceTypes.find(st => st.id === serviceTypeId);
    if (selectedServiceType) {
      setFormData({
        ...formData,
        service_type_id: serviceTypeId,
        price: selectedServiceType.base_price || 0
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{order ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.client_id}
                onChange={(e) => handleChange('client_id', e.target.value)}
                required
              >
                <option value="">Selecione um cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Serviço</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.service_type_id}
                onChange={(e) => handleServiceTypeChange(e.target.value)}
                required
              >
                <option value="">Selecione um serviço</option>
                {serviceTypes.map(serviceType => (
                  <option key={serviceType.id} value={serviceType.id}>
                    {serviceType.name} - R$ {serviceType.base_price?.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="pending">Pendente</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Agendada</label>
              <input
                type="date"
                className="w-full p-2 border rounded-md"
                value={formData.scheduled_date?.split('T')[0]}
                onChange={(e) => handleChange('scheduled_date', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor</label>
              <input
                type="number"
                className="w-full p-2 border rounded-md"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição do Serviço</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
            />
          </div>
          
          <div className="border rounded-md p-4 space-y-4">
            <h3 className="font-semibold">Item do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo do Item</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Ex: Notebook, Celular, etc."
                  value={formData.client_item?.type || ''}
                  onChange={(e) => handleClientItemChange('type', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Marca</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={formData.client_item?.brand || ''}
                  onChange={(e) => handleClientItemChange('brand', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Modelo</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={formData.client_item?.model || ''}
                  onChange={(e) => handleClientItemChange('model', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Número de Série</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={formData.client_item?.serial_number || ''}
                  onChange={(e) => handleClientItemChange('serial_number', e.target.value)}
                />
              </div>
              
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Condição de Entrada</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={2}
                  value={formData.client_item?.condition || ''}
                  onChange={(e) => handleClientItemChange('condition', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Anotações Técnicas</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={4}
              value={formData.technician_notes || ''}
              onChange={(e) => handleChange('technician_notes', e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}