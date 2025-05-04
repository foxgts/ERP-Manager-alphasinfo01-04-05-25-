import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, DollarSign, ShoppingCart, Users, AlertTriangle, Calendar, ArrowUp, ArrowDown, Info } from "lucide-react";
import { Sale } from '@/entities/Sale';
import { Client } from '@/entities/Client';
import { Transaction } from '@/entities/Transaction';
import { Product } from '@/entities/Product';
import { Service } from '@/entities/Service';
import { ServiceType } from '@/entities/ServiceType';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalClients: 0,
    revenue: 0,
    expenses: 0,
    serviceSales: 0,
    productSales: 0,
    openOrders: 0
  });
  
  const [pendingFinancial, setPendingFinancial] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [bottomProducts, setBottomProducts] = useState([]);
  const [bottomServices, setBottomServices] = useState([]);
  const [financialChartData, setFinancialChartData] = useState([]);
  const [today] = useState(new Date());

  useEffect(() => {
    loadStats();
    loadFinancialPending();
    loadSalesTrend();
    loadTopItems();
    loadFinancialData();
  }, []);

  const loadStats = async () => {
    const [sales, clients, transactions, services] = await Promise.all([
      Sale.list(),
      Client.list(),
      Transaction.list(),
      Service.list()
    ]);

    const revenue = transactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0);

    const openOrders = services.filter(s => s.status !== 'concluido' && s.status !== 'cancelado').length;

    setStats({
      totalSales: sales.length,
      totalClients: clients.length,
      revenue,
      expenses,
      serviceSales: services.filter(s => s.status === 'concluido').length,
      productSales: sales.length,
      openOrders
    });
  };

  const loadFinancialPending = async () => {
    const transactions = await Transaction.list();
    
    // Filtrar transações pendentes ou atrasadas
    const today = new Date();
    const pending = transactions.filter(t => {
      if (!t.due_date) return false;
      
      const dueDate = new Date(t.due_date);
      const isOverdue = isBefore(dueDate, today) && t.status === 'pendente';
      const isUpcoming = isAfter(dueDate, today) && isBefore(dueDate, addDays(today, 7)) && t.status === 'pendente';
      
      return isOverdue || isUpcoming;
    });
    
    setPendingFinancial(pending);
  };

  const loadSalesTrend = async () => {
    const sales = await Sale.list();
    
    // Criar mapa de vendas por mês
    const salesByMonth = {};
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = format(date, 'yyyy-MM');
      salesByMonth[monthKey] = 0;
      last6Months.push(monthKey);
    }
    
    sales.forEach(sale => {
      const saleMonth = format(new Date(sale.created_date), 'yyyy-MM');
      if (salesByMonth[saleMonth] !== undefined) {
        salesByMonth[saleMonth] += sale.total;
      }
    });
    
    const trend = last6Months.map(month => ({
      month: format(new Date(month + '-01'), 'MMM', {locale: ptBR}),
      vendas: salesByMonth[month]
    }));
    
    setSalesTrend(trend);
  };
  
  const loadTopItems = async () => {
    const [sales, services, products, serviceTypes] = await Promise.all([
      Sale.list(),
      Service.list(),
      Product.list(),
      ServiceType.list()
    ]);
    
    // Contar produtos vendidos
    const productSales = {};
    sales.forEach(sale => {
      if (!sale.items) return;
      
      sale.items.forEach(item => {
        const productId = item.product_id;
        if (!productId) return;
        
        if (!productSales[productId]) {
          productSales[productId] = { count: 0, total: 0 };
        }
        productSales[productId].count += item.quantity;
        productSales[productId].total += item.price * item.quantity;
      });
    });
    
    // Mapear para produtos
    const productSalesList = products.map(product => ({
      id: product.id,
      name: product.name,
      count: productSales[product.id]?.count || 0,
      total: productSales[product.id]?.total || 0
    }));
    
    // Contar serviços realizados
    const serviceCount = {};
    services.forEach(service => {
      const serviceTypeId = service.service_type_id;
      if (!serviceTypeId) return;
      
      if (!serviceCount[serviceTypeId]) {
        serviceCount[serviceTypeId] = { count: 0, total: 0 };
      }
      serviceCount[serviceTypeId].count += 1;
      serviceCount[serviceTypeId].total += service.price;
    });
    
    // Mapear para serviços
    const serviceSalesList = serviceTypes.map(serviceType => ({
      id: serviceType.id,
      name: serviceType.name,
      count: serviceCount[serviceType.id]?.count || 0,
      total: serviceCount[serviceType.id]?.total || 0
    }));
    
    // Ordenar e pegar top/bottom 5
    const sortedProducts = [...productSalesList].sort((a, b) => b.count - a.count);
    const sortedServices = [...serviceSalesList].sort((a, b) => b.count - a.count);
    
    setTopProducts(sortedProducts.slice(0, 5));
    setBottomProducts([...sortedProducts].reverse().slice(0, 5));
    setTopServices(sortedServices.slice(0, 5));
    setBottomServices([...sortedServices].reverse().slice(0, 5));
  };
  
  const loadFinancialData = async () => {
    const transactions = await Transaction.list();
    
    // Agrupar por mês
    const groupedByMonth = {};
    
    transactions.forEach(transaction => {
      const month = format(new Date(transaction.date), 'yyyy-MM');
      if (!groupedByMonth[month]) {
        groupedByMonth[month] = { receitas: 0, despesas: 0 };
      }
      
      if (transaction.type === 'receita') {
        groupedByMonth[month].receitas += transaction.amount;
      } else {
        groupedByMonth[month].despesas += transaction.amount;
      }
    });
    
    // Converter para array para o gráfico
    const chartData = Object.keys(groupedByMonth)
      .sort()
      .slice(-6) // Pegar apenas os últimos 6 meses
      .map(month => ({
        month: format(new Date(month + '-01'), 'MMM', {locale: ptBR}),
        receitas: groupedByMonth[month].receitas,
        despesas: groupedByMonth[month].despesas,
        lucro: groupedByMonth[month].receitas - groupedByMonth[month].despesas
      }));
    
    setFinancialChartData(chartData);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Bem-vindo ao seu painel de controle</p>
      </div>

      {/* Cards principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-gray-500">vendas realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-gray-500">clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500">receitas no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500">despesas no período</p>
          </CardContent>
        </Card>
      </div>

      {/* Lembretes e pendências */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Lembretes e Pendências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingFinancial.length > 0 ? (
              pendingFinancial.map(item => {
                const dueDate = new Date(item.due_date);
                const isOverdue = isBefore(dueDate, today);
                return (
                  <div 
                    key={item.id} 
                    className={`p-3 rounded-lg flex items-center justify-between ${
                      isOverdue 
                        ? 'bg-red-100 border border-red-200' 
                        : 'bg-yellow-50 border border-yellow-100'
                    }`}
                  >
                    <div>
                      <div className="font-medium">
                        {item.description}
                      </div>
                      <div className="text-sm">
                        {item.type === 'receita' ? 'Receita a receber' : 'Despesa a pagar'} • 
                        {format(new Date(item.due_date), ' dd/MM/yyyy')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={item.type === 'receita' ? 'text-green-600' : 'text-red-600'}>
                        R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <Badge variant={isOverdue ? "destructive" : "outline"}>
                        {isOverdue ? 'Atrasado' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-4">
                Não há pendências financeiras para hoje
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs para os diversos gráficos */}
      <Tabs defaultValue="vendas" className="mt-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="popular">Mais Populares</TabsTrigger>
          <TabsTrigger value="recomendacoes">Recomendações</TabsTrigger>
        </TabsList>

        <TabsContent value="vendas" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salesTrend}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 'Vendas']} 
                      />
                      <Bar dataKey="vendas" fill="#3b82f6" name="Vendas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Serviços vs Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Serviços', value: stats.serviceSales },
                          { name: 'Produtos', value: stats.productSales }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {[0, 1].map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Quantidade']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Receitas vs Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={financialChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, '']} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="receitas" stroke="#22c55e" name="Receitas" strokeWidth={2} />
                    <Line type="monotone" dataKey="despesas" stroke="#ef4444" name="Despesas" strokeWidth={2} />
                    <Line type="monotone" dataKey="lucro" stroke="#3b82f6" name="Lucro" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Produtos Mais Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.count} unidades</div>
                        </div>
                      </div>
                      <div className="font-medium">
                        R$ {product.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                  
                  {topProducts.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      Nenhum produto vendido ainda
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Serviços Mais Realizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topServices.map((service, index) => (
                    <div key={service.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-gray-500">{service.count} realizados</div>
                        </div>
                      </div>
                      <div className="font-medium">
                        R$ {service.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                  
                  {topServices.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      Nenhum serviço realizado ainda
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produtos Menos Vendidos</CardTitle>
                <CardDescription>Considere estratégias para aumentar as vendas destes produtos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bottomProducts.filter(p => p.count > 0).map((product, index) => (
                    <div key={product.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.count} unidades</div>
                        </div>
                      </div>
                      <div className="font-medium">
                        R$ {product.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                  
                  {bottomProducts.filter(p => p.count > 0).length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      Sem dados suficientes
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Serviços Menos Realizados</CardTitle>
                <CardDescription>Considere revisar ou promover estes serviços</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bottomServices.filter(s => s.count > 0).map((service, index) => (
                    <div key={service.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-gray-500">{service.count} realizados</div>
                        </div>
                      </div>
                      <div className="font-medium">
                        R$ {service.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                  
                  {bottomServices.filter(s => s.count > 0).length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      Sem dados suficientes
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recomendacoes" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <ArrowUp className="h-5 w-5 text-blue-600" />
                  Aumente suas Vendas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm">Analise seus produtos menos vendidos e considere:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                    </div>
                    <span>Realizar promoções direcionadas ou pacotes especiais</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                    </div>
                    <span>Melhorar a visibilidade nos canais de venda</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                    </div>
                    <span>Treinar sua equipe para oferecer esses produtos/serviços</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full text-blue-600 hover:text-blue-700">
                  Ver Relatório Completo
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Acompanhe as Métricas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm">Utilize seus dados para tomar melhores decisões:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-600" />
                    </div>
                    <span>Defina metas mensais de vendas e acompanhe o desempenho</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-600" />
                    </div>
                    <span>Analise sazonalidade e prepare-se para períodos de alta e baixa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-600" />
                    </div>
                    <span>Compare resultados com períodos anteriores para identificar tendências</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full text-green-600 hover:text-green-700">
                  Acessar Métricas Detalhadas
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Planeje o Mês
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm">Prepare-se para o próximo mês:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-purple-600" />
                    </div>
                    <span>Revise seu fluxo de caixa projetado para identificar necessidades</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-purple-600" />
                    </div>
                    <span>Agende suas campanhas de marketing com antecedência</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-purple-600" />
                    </div>
                    <span>Defina metas claras e divida-as em semanas</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full text-purple-600 hover:text-purple-700">
                  Criar Plano Mensal
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Dicas Personalizadas</CardTitle>
              <Info className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-md bg-amber-50">
                <div className="font-medium mb-1 text-amber-800">Equilibre suas Operações</div>
                <p className="text-sm text-amber-700">
                  Seus produtos mais vendidos merecem destaque especial, mas os menos vendidos precisam de 
                  uma estratégia de marketing. Considere criar pacotes combinando produtos populares com 
                  os menos procurados.
                </p>
              </div>

              <div className="p-4 border rounded-md bg-blue-50">
                <div className="font-medium mb-1 text-blue-800">Fidelização de Clientes</div>
                <p className="text-sm text-blue-700">
                  Você tem {stats.totalClients} clientes cadastrados. Considere implementar um programa 
                  de fidelidade para aumentar o valor médio de compra e a frequência de retorno.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}