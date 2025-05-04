import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from '@/entities/Transaction';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FinancialDashboard() {
  const [summary, setSummary] = React.useState({
    totalRevenue: 0,
    totalExpenses: 0,
    balance: 0,
    pendingRevenue: 0,
    pendingExpenses: 0
  });

  const [chartData, setChartData] = React.useState([]);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const transactions = await Transaction.list('-date');
    
    const revenue = transactions.filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions.filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingRevenue = transactions
      .filter(t => t.type === 'receita' && t.status === 'pendente')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingExpenses = transactions
      .filter(t => t.type === 'despesa' && t.status === 'pendente')
      .reduce((sum, t) => sum + t.amount, 0);

    setSummary({
      totalRevenue: revenue,
      totalExpenses: expenses,
      balance: revenue - expenses,
      pendingRevenue,
      pendingExpenses
    });

    // Prepare chart data
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toISOString().slice(0, 7); // YYYY-MM format
    }).reverse();

    const chartData = last6Months.map(month => {
      const monthTransactions = transactions.filter(t => t.date.startsWith(month));
      return {
        month: month.slice(5), // MM format
        receitas: monthTransactions
          .filter(t => t.type === 'receita')
          .reduce((sum, t) => sum + t.amount, 0),
        despesas: monthTransactions
          .filter(t => t.type === 'despesa')
          .reduce((sum, t) => sum + t.amount, 0)
      };
    });

    setChartData(chartData);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {summary.pendingRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {summary.pendingExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa - Últimos 6 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Line type="monotone" dataKey="receitas" stroke="#22c55e" name="Receitas" />
                <Line type="monotone" dataKey="despesas" stroke="#ef4444" name="Despesas" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}