import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Service } from '@/entities/Service';
import { Client } from '@/entities/Client';
import { ServiceType } from '@/entities/ServiceType';
import { format } from "date-fns";

export default function ServicesList() {
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState({});
  const [serviceTypes, setServiceTypes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [servicesData, clientsData, serviceTypesData] = await Promise.all([
        Service.list('-scheduled_date'),
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
      
      setServices(servicesData);
      setClients(clientsMap);
      setServiceTypes(serviceTypesMap);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      agendado: 'bg-blue-100 text-blue-800',
      em_andamento: 'bg-yellow-100 text-yellow-800',
      concluido: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800'
    };
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Serviço</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                Carregando...
              </TableCell>
            </TableRow>
          ) : services.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                Nenhum serviço encontrado
              </TableCell>
            </TableRow>
          ) : (
            services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  {service.scheduled_date ? format(new Date(service.scheduled_date), 'dd/MM/yyyy HH:mm') : '-'}
                </TableCell>
                <TableCell>{clients[service.client_id]?.name || 'Cliente não encontrado'}</TableCell>
                <TableCell>
                  {service.service_type_id ? (
                    <div>
                      <div className="font-medium">
                        {serviceTypes[service.service_type_id]?.name || service.description}
                      </div>
                      {serviceTypes[service.service_type_id] && (
                        <div className="text-xs text-gray-500">
                          {service.description}
                        </div>
                      )}
                    </div>
                  ) : (
                    service.description
                  )}
                </TableCell>
                <TableCell>
                  R$ {service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>{getStatusBadge(service.status)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}