import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  PlusCircle, 
  Trash2, 
  Calendar, 
  ArrowUp, 
  ArrowDown, 
  FileText, 
  Printer, 
  FileDown, 
  Filter,
  RefreshCw,
  Check,
  X,
  Clock,
  AlertTriangle
} from "lucide-react";
import { Transaction } from '@/entities/Transaction';
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isBefore, isAfter, addDays } from 'date-fns';

export default function Financeiro() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionType, setTransactionType] = useState('receita');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    category: 'all'
  });
  const today = new Date();

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, transactions]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await Transaction.list('-due_date');
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Filtro por tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Filtro por status
    if (filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    // Filtro por categoria
    if (filters.category !== 'all') {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    // Filtro por data
    if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      filtered = filtered.filter(t => {
        const date = new Date(t.due_date || t.date);
        return date >= start && date <= end;
      });
    } else if (filters.dateRange === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      filtered = filtered.filter(t => {
        const date = new Date(t.due_date || t.date);
        return date >= startOfMonth && date <= endOfMonth;
      });
    } else if (filters.dateRange === 'week') {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      filtered = filtered.filter(t => {
        const date = new Date(t.due_date || t.date);
        return date >= startOfWeek && date <= endOfWeek;
      });
    }

    setFilteredTransactions(filtered);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingTransaction) {
        await Transaction.update(editingTransaction.id, formData);
      } else {
        await Transaction.create(formData);
      }
      setShowForm(false);
      setEditingTransaction(null);
      loadTransactions();
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setTransactionType(transaction.type);
    setShowForm(true);
  };

  const handleNewTransaction = (type) => {
    setTransactionType(type);
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleStatusChange = async (transaction, newStatus) => {
    try {
      await Transaction.update(transaction.id, { ...transaction, status: newStatus });
      loadTransactions();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const getStatusClass = (status, dueDate) => {
    if (status === 'pago') return 'bg-green-100 text-green-800';
    if (status === 'cancelado') return 'bg-red-100 text-red-800';
    
    if (dueDate) {
      const due = new Date(dueDate);
      if (isBefore(due, today)) {
        return 'bg-red-100 text-red-800'; // Atrasado
      } else if (isAfter(due, today) && isBefore(due, addDays(today, 5))) {
        return 'bg-yellow-100 text-yellow-800'; // Próximo do vencimento
      }
    }
    
    return 'bg-blue-100 text-blue-800'; // Pendente normal
  };

  const getPendingTransactions = () => {
    return transactions.filter(t => {
      if (t.status !== 'pendente') return false;
      const dueDate = t.due_date ? new Date(t.due_date) : null;
      return dueDate && (isBefore(dueDate, addDays(today, 5)));
    }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  };

  const pendingItems = getPendingTransactions();
  const categories = [...new Set(transactions.map(t => t.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground mt-1">Controle de receitas e despesas</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleNewTransaction('receita')}
            className="bg-green-600 hover:bg-green-700"
          >
            <ArrowUp className="w-4 h-4 mr-2" />
            Nova Receita
          </Button>
          <Button
            onClick={() => handleNewTransaction('despesa')}
            className="bg-red-600 hover:bg-red-700"
          >
            <ArrowDown className="w-4 h-4 mr-2" />
            Nova Despesa
          </Button>
        </div>
      </div>

      {showForm ? (
        <TransactionForm 
          transaction={editingTransaction} 
          transactionType={transactionType}
          onSubmit={handleSubmit}
          onCancel={handleCancelForm}
        />
      ) : (
        <>
          {pendingItems.length > 0 && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                  Pendências Financeiras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {pendingItems.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-3 rounded-lg flex items-center justify-between ${
                          isBefore(new Date(item.due_date), today) 
                            ? 'bg-red-50 border border-red-200' 
                            : 'bg-amber-50 border border-amber-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.type === 'receita' 
                            ? <ArrowUp className="text-green-500" /> 
                            : <ArrowDown className="text-red-500" />
                          }
                          <div>
                            <div className="font-medium">{item.description}</div>
                            <div className="text-sm">
                              {isBefore(new Date(item.due_date), today) 
                                ? <span className="text-red-600 flex items-center"><AlertTriangle className="h-3 w-3 mr-1" /> Atrasado</span>
                                : <span className="text-amber-600 flex items-center"><Clock className="h-3 w-3 mr-1" /> Vence em breve</span>
                              }
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={item.type === 'receita' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              R$ {item.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                            </div>
                            <div className="text-xs">
                              {format(new Date(item.due_date), 'dd/MM/yyyy')}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-green-600"
                              onClick={() => handleStatusChange(item, 'pago')}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-600"
                              onClick={() => handleStatusChange(item, 'cancelado')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">Lista</TabsTrigger>
              <TabsTrigger value="calendar">Calendário</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-4 mb-4 items-end">
                    <div className="space-y-2 w-40">
                      <Label>Tipo</Label>
                      <Select 
                        value={filters.type} 
                        onValueChange={(value) => handleFilterChange('type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="receita">Receitas</SelectItem>
                          <SelectItem value="despesa">Despesas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 w-40">
                      <Label>Status</Label>
                      <Select 
                        value={filters.status} 
                        onValueChange={(value) => handleFilterChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="pago">Pago</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 w-40">
                      <Label>Categoria</Label>
                      <Select 
                        value={filters.category} 
                        onValueChange={(value) => handleFilterChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 w-40">
                      <Label>Período</Label>
                      <Select 
                        value={filters.dateRange} 
                        onValueChange={(value) => handleFilterChange('dateRange', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="month">Este Mês</SelectItem>
                          <SelectItem value="week">Esta Semana</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {filters.dateRange === 'custom' && (
                      <>
                        <div className="space-y-2 w-40">
                          <Label>De</Label>
                          <Input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 w-40">
                          <Label>Até</Label>
                          <Input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    <Button variant="outline" size="icon" onClick={() => loadTransactions()}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            Carregando...
                          </TableCell>
                        </TableRow>
                      ) : filteredTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Nenhuma transação encontrada
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              {transaction.type === 'receita' ? (
                                <div className="flex items-center">
                                  <ArrowUp className="text-green-500 mr-2" />
                                  <span>Receita</span>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <ArrowDown className="text-red-500 mr-2" />
                                  <span>Despesa</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{transaction.description}</div>
                              <div className="text-xs text-muted-foreground">
                                {transaction.payment_method && (
                                  <>
                                    {transaction.payment_method === 'dinheiro' ? 'Dinheiro' : 
                                     transaction.payment_method === 'cartao_credito' ? 'Cartão de Crédito' : 
                                     transaction.payment_method === 'cartao_debito' ? 'Cartão de Débito' : 
                                     transaction.payment_method === 'pix' ? 'PIX' : 
                                     transaction.payment_method === 'boleto' ? 'Boleto' : 
                                     transaction.payment_method === 'transferencia' ? 'Transferência' : 
                                     transaction.payment_method === 'cheque' ? 'Cheque' : 
                                     transaction.payment_method === 'emprestimo' ? 'Empréstimo' : 
                                     transaction.payment_method}
                                    {transaction.installments > 1 && ` (${transaction.installments}x)`}
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {transaction.category || '-'}
                            </TableCell>
                            <TableCell>
                              {transaction.due_date ? format(new Date(transaction.due_date), 'dd/MM/yyyy') : '-'}
                            </TableCell>
                            <TableCell>
                              <div className={transaction.type === 'receita' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                R$ {transaction.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(transaction.status, transaction.due_date)}`}>
                                {transaction.status === 'pendente' ? 'Pendente' : 
                                 transaction.status === 'pago' ? 'Pago' : 'Cancelado'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0" 
                                  onClick={() => handleEdit(transaction)}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => alert(`Imprimindo ${transaction.description}...`)}
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => alert(`Salvando ${transaction.description} como PDF...`)}
                                >
                                  <FileDown className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground p-8">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">Visualização de Calendário</h3>
                    <p>Visualize suas receitas e despesas em um calendário.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground p-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">Relatórios Financeiros</h3>
                    <p>Visualize relatórios detalhados das suas finanças.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function TransactionForm({ transaction, transactionType, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(transaction || {
    type: transactionType,
    description: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    category: '',
    subcategory: '',
    status: 'pendente',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    payment_method: '',
    installments: 1,
    notes: '',
    recurrence: {
      type: 'none',
      interval: 1,
      end_date: ''
    }
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        ...transaction,
        date: transaction.date ? format(new Date(transaction.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        due_date: transaction.due_date ? format(new Date(transaction.due_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        recurrence: transaction.recurrence || { type: 'none', interval: 1, end_date: '' }
      });
    } else {
      setFormData({
        type: transactionType,
        description: '',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        category: '',
        subcategory: '',
        status: 'pendente',
        due_date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: '',
        installments: 1,
        notes: '',
        recurrence: {
          type: 'none',
          interval: 1,
          end_date: ''
        }
      });
    }
  }, [transaction, transactionType]);

  const handleRecurrenceChange = (field, value) => {
    setFormData({
      ...formData,
      recurrence: {
        ...formData.recurrence,
        [field]: value
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convertendo valores para numéricos
    const processedData = {
      ...formData,
      amount: parseFloat(formData.amount),
      installments: parseInt(formData.installments) || 1
    };
    onSubmit(processedData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{transaction ? 'Editar Transação' : `Nova ${transactionType === 'receita' ? 'Receita' : 'Despesa'}`}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select 
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                disabled={!!transaction}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0,00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Pagamento de fornecedor"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select 
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {formData.type === 'receita' ? (
                    <>
                      <SelectItem value="vendas">Vendas</SelectItem>
                      <SelectItem value="servicos">Serviços</SelectItem>
                      <SelectItem value="investimentos">Investimentos</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="fornecedores">Fornecedores</SelectItem>
                      <SelectItem value="folha_pagamento">Folha de Pagamento</SelectItem>
                      <SelectItem value="impostos">Impostos</SelectItem>
                      <SelectItem value="aluguel">Aluguel</SelectItem>
                      <SelectItem value="servicos">Serviços</SelectItem>
                      <SelectItem value="emprestimos">Empréstimos</SelectItem>
                      <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Data de Vencimento</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Select 
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="emprestimo">Empréstimo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.payment_method === 'cartao_credito' && (
              <div className="space-y-2">
                <Label>Parcelas</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.installments}
                  onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Recorrência</Label>
              <Select 
                value={formData.recurrence.type}
                onValueChange={(value) => handleRecurrenceChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem recorrência</SelectItem>
                  <SelectItem value="daily">Diária</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.recurrence.type !== 'none' && (
              <>
                <div className="space-y-2">
                  <Label>Intervalo</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.recurrence.interval}
                    onChange={(e) => handleRecurrenceChange('interval', parseInt(e.target.value) || 1)}
                    placeholder="Intervalo de recorrência"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data Final</Label>
                  <Input
                    type="date"
                    value={formData.recurrence.end_date}
                    onChange={(e) => handleRecurrenceChange('end_date', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações adicionais"
              rows={3}
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