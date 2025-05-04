import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionsList from '../components/financial/TransactionsList';
import TransactionCalendar from '../components/financial/TransactionCalendar';
import FinancialDashboard from '../components/financial/FinancialDashboard';

export default function Financial() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-gray-500 mt-1">Gestão financeira e controle de fluxo de caixa</p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <FinancialDashboard />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsList />
        </TabsContent>

        <TabsContent value="calendar">
          <TransactionCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
}