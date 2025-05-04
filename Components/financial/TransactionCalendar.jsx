import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from '@/entities/Transaction';
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { 
  FileDown, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUp, 
  ArrowDown 
} from "lucide-react";

export default function TransactionCalendar() {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayTransactions, setDayTransactions] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactionsForSelectedDate();
  }, [selectedDate, transactions]);

  const loadTransactions = async () => {
    const data = await Transaction.list();
    setTransactions(data);
  };

  const filterTransactionsForSelectedDate = () => {
    if (!selectedDate) return;
    
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const filtered = transactions.filter(t => {
      return t.date && t.date.startsWith(selectedDateStr);
    });
    
    setDayTransactions(filtered);
  };

  const getTransactionsForDay = (day) => {
    return transactions.filter(transaction => {
      if (!transaction.date) return false;
      return isSameDay(parseISO(transaction.date), day);
    });
  };

  const getDaysWithTransactions = () => {
    const firstDay = startOfMonth(selectedMonth);
    const lastDay = endOfMonth(selectedMonth);
    const days = eachDayOfInterval({ start: firstDay, end: lastDay });
    
    const daysWithData = days.map(day => {
      const dayTransactions = getTransactionsForDay(day);
      
      return {
        date: day,
        hasRevenue: dayTransactions.some(t => t.type === 'receita'),
        hasExpense: dayTransactions.some(t => t.type === 'despesa'),
        hasOverdue: dayTransactions.some(t => 
          t.due_date && 
          new Date(t.due_date) < new Date() && 
          t.status === 'pendente'
        ),
        total: dayTransactions.reduce((sum, t) => {
          if (t.type === 'receita') return sum + t.amount;
          return sum - t.amount;
        }, 0)
      };
    });
    
    return daysWithData;
  };

  const modifiers = {
    revenue: getDaysWithTransactions()
      .filter(day => day.hasRevenue && !day.hasExpense)
      .map(day => day.date),
    expense: getDaysWithTransactions()
      .filter(day => day.hasExpense && !day.hasRevenue)
      .map(day => day.date),
    both: getDaysWithTransactions()
      .filter(day => day.hasRevenue && day.hasExpense)
      .map(day => day.date),
    overdue: getDaysWithTransactions()
      .filter(day => day.hasOverdue)
      .map(day => day.date),
  };
  
  const renderDayContent = (day) => {
    const daysData = getDaysWithTransactions();
    const dayData = daysData.find(d => isSameDay(d.date, day));
    
    if (!dayData) return null;
    
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        {dayData.hasRevenue && (
          <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
        )}
        {dayData.hasExpense && (
          <div className="absolute top-0 left-0 w-2 h-2 bg-red-500 rounded-full" />
        )}
        {dayData.hasOverdue && (
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-yellow-500 rounded-full" />
        )}
        <span>{day.getDate()}</span>
      </div>
    );
  };

  const generatePDF = () => {
    alert("Exportando calendário financeiro para PDF...");
    // Implementação real exige biblioteca específica
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Calendário Financeiro</h2>
        <Button 
          variant="outline" 
          onClick={generatePDF}
          className="flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
            <div className="flex items-center mt-2 text-sm space-x-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span>Receitas</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                <span>Despesas</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                <span>Atrasos</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={selectedMonth}
              onMonthChange={setSelectedMonth}
              locale={ptBR}
              modifiers={modifiers}
              modifiersStyles={{
                booked: { fontWeight: 'bold' }
              }}
              components={{
                DayContent: (props) => renderDayContent(props.day)
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Transações em {format(selectedDate, 'dd/MM/yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dayTransactions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Não há transações para esta data</p>
                <p className="text-sm mt-2">
                  Você pode adicionar novas receitas ou despesas
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {dayTransactions.map((transaction) => {
                  const isPaid = transaction.status === 'pago';
                  const isOverdue = transaction.due_date && 
                    new Date(transaction.due_date) < new Date() && 
                    transaction.status === 'pendente';
                  
                  return (
                    <div
                      key={transaction.id}
                      className={`
                        flex justify-between items-center p-4 border rounded-lg
                        ${isPaid ? 'bg-gray-50' : ''}
                        ${isOverdue ? 'bg-red-50 border-red-200' : ''}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          rounded-full p-2 
                          ${transaction.type === 'receita' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                          }
                        `}>
                          {transaction.type === 'receita' 
                            ? <ArrowUp className="h-5 w-5" /> 
                            : <ArrowDown className="h-5 w-5" />
                          }
                        </div>
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-gray-500">
                            {transaction.category}
                            {transaction.due_date && (
                              <> • Vencimento: {format(new Date(transaction.due_date), 'dd/MM/yyyy')}</>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={transaction.type === 'receita' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {transaction.type === 'receita' ? '+' : '-'} 
                          R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <Badge 
                          variant={
                            isPaid ? "success" : 
                            isOverdue ? "destructive" : 
                            "outline"
                          }
                        >
                          {isPaid && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {isOverdue && <AlertCircle className="h-3 w-3 mr-1" />}
                          {!isPaid && !isOverdue && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}