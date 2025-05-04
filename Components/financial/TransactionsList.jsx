import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
import { Transaction } from '@/entities/Transaction';
import { format } from "date-fns";
import TransactionForm from './TransactionForm';

export default function TransactionsList() {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const data = await Transaction.list('-date');
    setTransactions(data);
  };

  const handleSave = async (data) => {
    if (editingTransaction) {
      await Transaction.update(editingTransaction.id, data);
    } else {
      await Transaction.create(data);
    }
    setShowForm(false);
    setEditingTransaction(null);
    loadTransactions();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingTransaction(null);
          }}
        />
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell className={transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'}>
                  R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Badge variant={transaction.status === 'pago' ? 'success' : 'warning'}>
                    {transaction.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}