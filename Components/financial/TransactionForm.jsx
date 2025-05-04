import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TransactionForm({ transaction, onSave, onCancel }) {
  const [formData, setFormData] = React.useState(transaction || {
    type: 'despesa',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    subcategory: '',
    status: 'pendente',
    due_date: '',
    payment_method: '',
    installments: 1,
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: parseFloat(formData.amount),
      installments: parseInt(formData.installments || 1)
    });
  };

  const expenseCategories = [
    { value: 'operacional', label: 'Despesas Operacionais' },
    { value: 'pessoal', label: 'Folha de Pagamento' },
    { value: 'impostos', label: 'Impostos e Taxas' },
    { value: 'servicos', label: 'Serviços Terceirizados' },
    { value: 'infraestrutura', label: 'Infraestrutura' },
    { value: 'marketing', label: 'Marketing e Publicidade' },
    { value: 'financeiro', label: 'Despesas Financeiras' },
    { value: 'compras', label: 'Compras de Produtos' },
    { value: 'cartao', label: 'Cartão de Crédito' },
    { value: 'emprestimo', label: 'Empréstimos' },
    { value: 'outras', label: 'Outras Despesas' }
  ];

  const revenueCategories = [
    { value: 'vendas', label: 'Vendas de Produtos' },
    { value: 'servicos', label: 'Prestação de Serviços' },
    { value: 'assinatura', label: 'Assinaturas' },
    { value: 'comissao', label: 'Comissões' },
    { value: 'outras', label: 'Outras Receitas' }
  ];

  const paymentMethods = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'pix', label: 'PIX' },
    { value: 'transferencia', label: 'Transferência' },
    { value: 'cartao_debito', label: 'Cartão de Débito' },
    { value: 'cartao_credito', label: 'Cartão de Crédito' },
    { value: 'boleto', label: 'Boleto' },
    { value: 'cheque', label: 'Cheque' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{transaction ? 'Editar Transação' : 'Nova Transação'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {formData.type === 'receita' 
                    ? revenueCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))
                    : expenseCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Data de Vencimento</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Método de Pagamento</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map(method => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.payment_method === 'cartao_credito' && (
              <div className="space-y-2">
                <Label htmlFor="installments">Parcelas</Label>
                <Select
                  value={formData.installments?.toString() || "1"}
                  onValueChange={(value) => setFormData({ ...formData, installments: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Número de parcelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                      <SelectItem key={n} value={n.toString()}>
                        {n}x {n === 1 ? "à vista" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {transaction ? 'Atualizar' : 'Criar'} Transação
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}