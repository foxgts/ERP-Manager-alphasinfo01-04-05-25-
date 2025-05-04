import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Quote } from '@/entities/Quote';
import { Client } from '@/entities/Client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MoreHorizontal, FileUp, FilePlus, FileMinus } from "lucide-react";

export default function QuotesList({ onEdit }) {
  const [quotes, setQuotes] = useState([]);
  const [clients, setClients] = useState({});
  const [filterValue, setFilterValue] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [quotesData, clientsData] = await Promise.all([
      Quote.list('-created_date'),
      Client.list()
    ]);
    
    setQuotes(quotesData);
    
    // Mapeamento de clientes para acesso rápido
    const clientsMap = {};
    clientsData.forEach(client => {
      clientsMap[client.id] = client;
    });
    setClients(clientsMap);
  };

  const handleStatusChange = async (quote, newStatus) => {
    await Quote.update(quote.id, { ...quote, status: newStatus });
    loadData();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Rascunho</Badge>;
      case 'sent':
        return <Badge variant="secondary">Enviado</Badge>;
      case 'approved':
        return <Badge variant="success" className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      case 'finalized':
        return <Badge className="bg-blue-100 text-blue-800">Finalizado</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handlePrint = (quote) => {
    alert(`Imprimindo orçamento ${quote.id}...`);
  };

  const handleSavePDF = (quote) => {
    alert(`Salvando orçamento ${quote.id} como PDF...`);
  };

  const filteredQuotes = quotes.filter(quote => {
    const client = clients[quote.client_id];
    const clientName = client ? client.name.toLowerCase() : '';
    
    return (
      clientName.includes(filterValue.toLowerCase()) ||
      quote.id.includes(filterValue.toLowerCase()) ||
      String(quote.total).includes(filterValue)
    );
  });

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <Input
            placeholder="Buscar orçamentos..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell>
                  {format(new Date(quote.created_date), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  {clients[quote.client_id]?.name || 'Cliente não encontrado'}
                </TableCell>
                <TableCell>
                  R$ {quote.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  {quote.valid_until ? format(new Date(quote.valid_until), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                </TableCell>
                <TableCell>
                  {getStatusBadge(quote.status)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(quote)}>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleStatusChange(quote, 'approved')}>
                        Marcar como Aprovado
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(quote, 'rejected')}>
                        Marcar como Rejeitado
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(quote, 'finalized')}>
                        Finalizar Orçamento
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(quote, 'canceled')}>
                        Cancelar Orçamento
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handlePrint(quote)}>
                        <FileUp className="h-4 w-4 mr-2" />
                        Imprimir
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSavePDF(quote)}>
                        <FilePlus className="h-4 w-4 mr-2" />
                        Salvar como PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredQuotes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Nenhum orçamento encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}