import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ServiceType } from '@/entities/ServiceType';

export default function ServiceTypeForm({ serviceType, onClose }) {
  const [formData, setFormData] = useState(serviceType || {
    name: '',
    description: '',
    base_price: '',
    duration_minutes: '',
    category: '',
    active: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        base_price: parseFloat(formData.base_price),
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null
      };
      
      if (serviceType) {
        await ServiceType.update(serviceType.id, data);
      } else {
        await ServiceType.create(data);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{serviceType ? 'Editar Serviço' : 'Novo Serviço'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Serviço</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_price">Preço Base</Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duração (minutos)</Label>
              <Input
                id="duration_minutes"
                type="number"
                min="1"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="active" className="font-normal">Serviço ativo</Label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {serviceType ? 'Atualizar' : 'Cadastrar'} Serviço
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}