import React, { useState, useEffect } from 'react';
import { ServiceOrder } from '@/entities/ServiceOrder';
import { Client } from '@/entities/Client';
import { ServiceType } from '@/entities/ServiceType';
import { Product } from '@/entities/Product';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { Plus, Trash2, Printer, FileDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ServiceOrderForm({ serviceOrder, onClose }) {
  const [formData, setFormData] = useState(serviceOrder || {
    number: '',
    client_id: '',
    service_type_id: '',
    description: '',
    status: 'pending',
    scheduled_date: format(new Date(), 'yyyy-MM-dd'),
    scheduled_time: format(new Date(), 'HH:mm'),
    price: '',
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

  const [clients, setClients] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [clientsData, serviceTypesData, productsData] = await Promise.all([
        Client.list(),
        ServiceType.list(),
        Product.list()
      ]);
      
      setClients(clientsData);
      setServiceTypes(serviceTypesData);
      setAvailableProducts(productsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleClientItemChange = (field, value) => {
    setFormData({
      ...formData,
      client_item: { ...formData.client_item, [field]: value }
    });
  };

  const handleServiceTypeChange = (id) => {
    const serviceType = serviceTypes.find(st => st.id === id);
    if (serviceType) {
      setFormData({
        ...formData,
        service_type_id: id,
        description: serviceType.name,
        price: serviceType.base_price || 0
      });
    }
  };

  const addProduct = () => {
    const newProducts = [...(formData.products || [])];
    newProducts.push({ product_id: '', quantity: 1, price: 0 });
    handleChange('products', newProducts);
  };

  const removeProduct = (index) => {
    const newProducts = [...(formData.products || [])];
    newProducts.splice(index, 1);
    handleChange('products', newProducts);
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...(formData.products || [])];
    newProducts[index][field] = value;

    // If changing the product, set its price from available products
    if (field === 'product_id') {
      const product = availableProducts.find(p => p.id === value);
      if (product) {
        newProducts[index].price = product.price;
      }
    }

    handleChange('products', newProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Format the date and time
      const scheduledDateTime = formData.scheduled_date && formData.scheduled_time ? 
        `${formData.scheduled_date}T${formData.scheduled_time}` : null;
      
      const orderData = {
        ...formData,
        scheduled_date: scheduledDateTime
      };
      
      if (serviceOrder) {
        await ServiceOrder.update(serviceOrder.id, orderData);
      } else {
        await ServiceOrder.create(orderData);
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar ordem de serviço:', error);
      alert('Erro ao salvar ordem de serviço');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    alert('Imprimindo ordem de serviço...');
  };

  const handleSaveAsPDF = () => {
    alert('Exportando ordem de serviço como PDF...');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          Carregando dados...
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <Card>
        <CardHeader>
          <CardTitle>{serviceOrder ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Número da OS</Label>
                <Input 
                  placeholder="Gerado automaticamente"
                  value={formData.number || ''}
                  onChange={(e) => handleChange('number', e.target.value)}
                  disabled={!serviceOrder}
                />
              </div>

              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select 
                  value={formData.client_id}
                  onValueChange={(value) => handleChange('client_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
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
                  onValueChange={(id) => handleServiceTypeChange(id)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map(serviceType => (
                      <SelectItem key={serviceType.id} value={serviceType.id}>
                        {serviceType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Data Agendada</Label>
                <Input
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => handleChange('scheduled_date', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Hora</Label>
                <Input
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => handleChange('scheduled_time', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Valor do Serviço</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="border rounded-md p-4 space-y-4">
              <h3 className="font-medium">Dados do Item do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo do Item</Label>
                  <Input
                    placeholder="Ex: Notebook, Celular, etc."
                    value={formData.client_item?.type || ''}
                    onChange={(e) => handleClientItemChange('type', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Marca</Label>
                  <Input
                    value={formData.client_item?.brand || ''}
                    onChange={(e) => handleClientItemChange('brand', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Input
                    value={formData.client_item?.model || ''}
                    onChange={(e) => handleClientItemChange('model', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Número de Série</Label>
                  <Input
                    value={formData.client_item?.serial_number || ''}
                    onChange={(e) => handleClientItemChange('serial_number', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Condição na Entrada</Label>
                <Textarea
                  rows={3}
                  placeholder="Descreva o estado do item na entrada..."
                  value={formData.client_item?.condition || ''}
                  onChange={(e) => handleClientItemChange('condition', e.target.value)}
                />
              </div>
            </div>

            <div className="border rounded-md p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Produtos Utilizados</h3>
                <Button type="button" variant="outline" size="sm" onClick={addProduct}>
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Produto
                </Button>
              </div>
              
              {formData.products && formData.products.length > 0 ? (
                <div className="space-y-4">
                  {formData.products.map((product, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5 space-y-2">
                        <Label>Produto</Label>
                        <Select 
                          value={product.product_id}
                          onValueChange={(value) => handleProductChange(index, 'product_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProducts.map(p => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} - R$ {p.price.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="col-span-2 space-y-2">
                        <Label>Quant.</Label>
                        <Input
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      
                      <div className="col-span-3 space-y-2">
                        <Label>Preço Unit.</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={product.price}
                          onChange={(e) => handleProductChange(index, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div className="col-span-2 flex justify-end">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeProduct(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  Nenhum produto adicionado
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Anotações Técnicas</Label>
              <Textarea
                rows={4}
                placeholder="Informações adicionais, problemas encontrados, etc."
                value={formData.technician_notes || ''}
                onChange={(e) => handleChange('technician_notes', e.target.value)}
              />
            </div>

            <div className="flex justify-between">
              <div>
                <Button type="button" variant="outline" className="mr-2" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" /> Imprimir
                </Button>
                <Button type="button" variant="outline" onClick={handleSaveAsPDF}>
                  <FileDown className="h-4 w-4 mr-2" /> Salvar como PDF
                </Button>
              </div>
              <div>
                <Button type="button" variant="outline" className="mr-2" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </ScrollArea>
  );
}