import React, { useState, useEffect } from 'react';
import { ServiceOrder } from '@/entities/ServiceOrder';
import { Client } from '@/entities/Client';
import { ServiceType } from '@/entities/ServiceType';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, MoreHorizontal, Printer, FileDown } from "lucide-react";

export default function ServiceOrderList({ onEdit }) {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState({});
  const [serviceTypes, setServiceTypes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, clientsData, serviceTypesData] = await Promise.all([
        ServiceOrder.list('-created_date'),
        Client.list(),
        ServiceType.list()
      ]);
      
      // Create lookup maps
      const clientsMap = {};
      clientsData.forEach(client => {
        clientsMap[client.id] = client;
      });
      
      const serviceTypesMap = {};
      serviceTypesData.forEach(serviceType => {
        serviceTypesMap[serviceType.id] = serviceType;
      });
      
      setOrders(ordersData);
      setClients(clientsMap);
      setServiceTypes(serviceTypesMap);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: "Pendente", class: "bg-yellow-100 text-yellow-800" },
      in_progress: { label: "Em Andamento", class: "bg-blue-100 text-blue-800" },
      completed: { label: "Concluído", class: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelado", class: "bg-red-100 text-red-800" }
    };

    const statusInfo = statusMap[status] || { label: status, class: "bg-gray-100 text-gray-800" };
    return <Badge className={statusInfo.class}>{statusInfo.label}</Badge>;
  };

  const handlePrint = (order) => {
    alert(`Imprimindo ordem de serviço ${order.number || order.id.substr(0, 8)}...`);
  };

  const handleSaveAsPDF = (order) => {
    alert(`Salvando ordem de serviço ${order.number || order.id.substr(0, 8)} como PDF...`);
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhuma ordem de serviço encontrada
                </TableCell>
              </TableRow>
            ) : (
              orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell>
                    {order.number || order.id.substr(0, 8)}
                  </TableCell>
                  <TableCell>
                    {clients[order.client_id]?.name || 'Cliente não encontrado'}
                  </TableCell>
                  <TableCell>
                    {serviceTypes[order.service_type_id]?.name || order.description}
                  </TableCell>
                  <TableCell>
                    {order.scheduled_date ? format(new Date(order.scheduled_date), 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(order)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handlePrint(order)}>
                          <Printer className="mr-2 h-4 w-4" />
                          Imprimir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSaveAsPDF(order)}>
                          <FileDown className="mr-2 h-4 w-4" />
                          Salvar como PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}