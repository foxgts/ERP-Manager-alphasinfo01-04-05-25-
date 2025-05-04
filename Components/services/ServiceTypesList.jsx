import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceType } from '@/entities/ServiceType';
import { Pencil } from "lucide-react";

export default function ServiceTypesList({ onEdit }) {
  const [serviceTypes, setServiceTypes] = useState([]);

  useEffect(() => {
    loadServiceTypes();
  }, []);

  const loadServiceTypes = async () => {
    const data = await ServiceType.list();
    setServiceTypes(data);
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Preço Base</TableHead>
            <TableHead>Duração</TableHead>
            <TableHead>Status</TableHead>
            <TableHead width="70"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {serviceTypes.map((serviceType) => (
            <TableRow key={serviceType.id}>
              <TableCell>{serviceType.name}</TableCell>
              <TableCell>{serviceType.category || '-'}</TableCell>
              <TableCell>R$ {serviceType.base_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
              <TableCell>{serviceType.duration_minutes ? `${serviceType.duration_minutes} min` : '-'}</TableCell>
              <TableCell>
                <Badge variant={serviceType.active ? 'outline' : 'secondary'}>
                  {serviceType.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(serviceType)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {serviceTypes.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                Nenhum serviço cadastrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}