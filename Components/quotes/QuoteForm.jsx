import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Package, FileText, CalendarIcon } from "lucide-react";
import { Quote } from '@/entities/Quote';
import { Client } from '@/entities/Client';
import { ServiceType } from '@/entities/ServiceType';
import { Product } from '@/entities/Product';
import { format } from 'date-fns';

export default function QuoteForm({ quote, onClose }) {
  const [clients, setClients] = useState([]);
  const [serviceTypes, setServiceTypes]  = useState([]);
  const [products, setProducts] = useState([]);
  const [activeItemType, setActiveItemType] = useState("products");
  const [formData, setFormData] = useState(quote || {
    client_id: '',
    items: [],
    total: 0,
    status: 'draft',
    valid_until: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 dias
    notes: '',
    item_type: 'mixed' // 'products', 'services' ou 'mixed'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [clientsData, serviceTypesData, productsData] = await Promise.all([
      Client.list(),
      ServiceType.list(),
      Product.list()
    ]);
    setClients(clientsData);
    setServiceTypes(serviceTypesData);
    setProducts(productsData);
  };

  const addItem = (type = 'custom') => {
    let newItem = { description: '', quantity: 1, unit_price: 0, type };
    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems,
      total: calculateTotal(newItems)
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = formData.items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total = updatedItem.quantity * updatedItem.unit_price;
        }
        return updatedItem;
      }
      return item;
    });

    setFormData({
      ...formData,
      items: newItems,
      total: calculateTotal(newItems)
    });
  };

  const addServiceToQuote = (serviceType) => {
    const newItem = {
      type: 'service',
      service_id: serviceType.id,
      service_name: serviceType.name,
      description: serviceType.description || serviceType.name,
      quantity: 1,
      unit_price: serviceType.base_price,
      total: serviceType.base_price
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem],
      total: calculateTotal([...formData.items, newItem])
    });
  };

  const addProductToQuote = (product) => {
    const newItem = {
      type: 'product',
      product_id: product.id,
      product_name: product.name,
      description: product.name,
      quantity: 1,
      unit_price: product.price,
      total: product.price
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem],
      total: calculateTotal([...formData.items, newItem])
    });
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quote) {
      await Quote.update(quote.id, formData);
    } else {
      await Quote.create(formData);
    }
    onClose();
  };

  const handleFinalize = async () => {
    const updatedData = {...formData, status: 'finalized'};
    if (quote) {
      await Quote.update(quote.id, updatedData);
    } else {
      await Quote.create(updatedData);
    }
    onClose();
  };

  return (
    <div className="min-h-screen">
      <ScrollArea className="h-[calc(100vh-120px)]">
        <Card>
          <CardHeader>
            <CardTitle>{quote ? 'Editar Orçamento' : 'Novo Orçamento'}</CardTitle>
            <CardDescription>Crie um orçamento personalizado para seu cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={(value) => setFormData({ ...formData, client_id: value })}
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
                  <Label>Válido até</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border rounded-md">
                <div className="bg-muted p-3 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Itens do Orçamento</h3>
                    <div>
                      <Tabs value={activeItemType} onValueChange={setActiveItemType}>
                        <TabsList>
                          <TabsTrigger value="products">Produtos</TabsTrigger>
                          <TabsTrigger value="services">Serviços</TabsTrigger>
                          <TabsTrigger value="custom">Personalizado</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  <TabsContent value="products" className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                      {products.map(product => (
                        <Button
                          key={product.id}
                          variant="outline"
                          className="h-auto text-left flex flex-col items-start p-3"
                          onClick={() => addProductToQuote(product)}
                        >
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            R$ {product.price.toFixed(2)}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="services" className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                      {serviceTypes.map(service => (
                        <Button
                          key={service.id}
                          variant="outline"
                          className="h-auto text-left flex flex-col items-start p-3"
                          onClick={() => addServiceToQuote(service)}
                        >
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground">
                            R$ {service.base_price.toFixed(2)}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="custom" className="mt-0">
                    <Button 
                      variant="outline" 
                      onClick={() => addItem('custom')}
                      className="mb-4"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Item Personalizado
                    </Button>
                  </TabsContent>

                  <div className="space-y-2">
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center border rounded-md p-2">
                        <div className="col-span-5">
                          <Label>Descrição</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Qtd</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Preço Unit.</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Total</Label>
                          <div className="border rounded-md h-10 px-3 py-2 text-right">
                            R$ {(item.quantity * item.unit_price).toFixed(2)}
                          </div>
                        </div>
                        <div className="col-span-1 flex items-end">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {formData.items.length === 0 && (
                      <div className="text-center p-4 text-muted-foreground">
                        Selecione um produto, serviço ou adicione um item personalizado
                      </div>
                    )}

                    <div className="flex justify-between border-t pt-4 mt-4">
                      <div className="font-medium">Total:</div>
                      <div className="font-medium text-xl">
                        R$ {calculateTotal(formData.items).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  placeholder="Informe condições adicionais, prazo de entrega, ou outras observações"
                  className="min-h-[80px]"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={handleFinalize}>
                Finalizar
              </Button>
              <Button type="submit" onClick={handleSubmit}>
                Salvar
              </Button>
            </div>
          </CardFooter>
        </Card>
      </ScrollArea>
    </div>
  );
}