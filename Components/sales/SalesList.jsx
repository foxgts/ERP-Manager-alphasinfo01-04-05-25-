import React, { useState, useEffect } from 'react';
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
import { Sale } from '@/entities/Sale';
import { Client } from '@/entities/Client';

export default function SalesList() {
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [salesData, clientsData] = await Promise.all([
      Sale.list('-created_date'),
      Client.list()
    ]);
    setSales(salesData);
    
    const clientsMap = {};
    clientsData.forEach(client => {
      clientsMap[client.id] = client;
    });
    setClients(clientsMap);
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      dinheiro: 'Dinheiro',
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      pix: 'PIX'
    };
    return labels[method] || method;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const labels = {
      pending: 'Pendente',
      completed: 'Concluída',
      cancelled: 'Cancelada'
    };
    return (
      <Badge className={styles[status]}>{labels[status]}</Badge>
    );
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>
                {new Date(sale.created_date).toLocaleDateString('pt-BR')}
              </TableCell>
              <TableCell>{clients[sale.client_id]?.name || 'Cliente não encontrado'}</TableCell>
              <TableCell>
                R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell>
                {getPaymentMethodLabel(sale.payment_method)}
                {sale.installments > 1 && ` (${sale.installments}x)`}
              </TableCell>
              <TableCell>{getStatusBadge(sale.status)}</TableCell>
            </TableRow>
          ))}
          {sales.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                Nenhuma venda encontrada
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}