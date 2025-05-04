import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, addMonths, subMonths, isSameDay, parseISO, isBefore, isAfter, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  ArrowUp, 
  ArrowDown,
  Wrench,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Service } from '@/entities/Service';
import { ServiceOrder } from '@/entities/ServiceOrder';
import { Transaction } from '@/entities/Transaction';
import { Client } from '@/entities/Client';
import { ServiceType } from '@/entities/ServiceType';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Calendario() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [clients, setClients] = useState({});
  const [serviceTypes, setServiceTypes] = useState({});
  const [loading, setLoading] = useState(true);
  const today = new Date();
  
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterEventsByDate(selectedDate);
  }, [events, selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [services, orders, transactions, clientsData, serviceTypesData] = await Promise.all([
        Service.list(),
        ServiceOrder.list(),
        Transaction.list(),
        Client.list(),
        ServiceType.list()
      ]);

      // Criar mapas para referência rápida
      const clientsMap = {};
      clientsData.forEach(client => {
        clientsMap[client.id] = client;
      });

      const serviceTypesMap = {};
      serviceTypesData.forEach(type => {
        serviceTypesMap[type.id] = type;
      });

      setClients(clientsMap);
      setServiceTypes(serviceTypesMap);

      // Processar serviços
      const serviceEvents = services
        .filter(service => service.scheduled_date)
        .map(service => ({
          id: service.id,
          title: service.description,
          date: new Date(service.scheduled_date),
          type: 'service',
          color: 'blue',
          status: service.status,
          clientId: service.client_id,
          clientName: clientsMap[service.client_id]?.name || 'Cliente não encontrado',
          price: service.price
        }));

      // Processar ordens de serviço
      const orderEvents = orders
        .filter(order => order.scheduled_date)
        .map(order => ({
          id: order.id,
          title: order.number ? `OS ${order.number}` : order.description,
          date: new Date(order.scheduled_date),
          type: 'order',
          color: 'purple',
          status: order.status,
          description: order.description,
          clientId: order.client_id,
          clientName: clientsMap[order.client_id]?.name || 'Cliente não encontrado',
          price: order.price
        }));

      // Processar transações financeiras
      const financialEvents = transactions
        .filter(t => t.due_date)
        .map(transaction => ({
          id: transaction.id,
          title: transaction.description,
          date: new Date(transaction.due_date),
          type: transaction.type,
          color: transaction.type === 'receita' ? 'green' : 'red',
          amount: transaction.amount,
          status: transaction.status,
          category: transaction.category
        }));

      setEvents([...serviceEvents, ...orderEvents, ...financialEvents]);
      filterEventsByDate(selectedDate);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterEventsByDate = (date) => {
    const filtered = events.filter(event => 
      date && event.date && isSameDay(new Date(event.date), new Date(date))
    );
    setSelectedEvents(filtered);
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    filterEventsByDate(date);
  };

  const getStatusColor = (type, status) => {
    if (type === 'service') {
      switch (status) {
        case 'agendado': return 'bg-blue-100 text-blue-800';
        case 'em_andamento': return 'bg-yellow-100 text-yellow-800';
        case 'concluido': return 'bg-green-100 text-green-800';
        case 'cancelado': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else if (type === 'order') {
      switch (status) {
        case 'pending': return 'bg-blue-100 text-blue-800';
        case 'in_progress': return 'bg-yellow-100 text-yellow-800';
        case 'completed': return 'bg-green-100 text-green-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else if (type === 'receita' || type === 'despesa') {
      if (status === 'pendente') {
        const dueDate = new Date(event.date);
        if (isBefore(dueDate, today)) {
          return 'bg-red-100 text-red-800'; // Atrasado
        }
        return 'bg-yellow-100 text-yellow-800'; // Pendente
      } else if (status === 'pago') {
        return 'bg-green-100 text-green-800';
      } else {
        return 'bg-gray-100 text-gray-800';
      }
    }
    
    return 'bg-gray-100 text-gray-800';
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'service': return <CheckCircle className="h-4 w-4" />;
      case 'order': return <Wrench className="h-4 w-4" />;
      case 'receita': return <ArrowUp className="h-4 w-4" />;
      case 'despesa': return <ArrowDown className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type, status, date) => {
    if (type === 'service') {
      return 'bg-blue-100 text-blue-800';
    } else if (type === 'order') {
      return 'bg-purple-100 text-purple-800';
    } else if (type === 'receita') {
      if (status === 'pendente' && date && isBefore(new Date(date), today)) {
        return 'bg-red-100 text-red-800'; // Atrasado
      }
      return 'bg-green-100 text-green-800';
    } else if (type === 'despesa') {
      if (status === 'pendente' && date && isBefore(new Date(date), today)) {
        return 'bg-red-100 text-red-800'; // Atrasado
      }
      return 'bg-red-100 text-red-800';
    }
    
    return 'bg-gray-100 text-gray-800';
  };

  const generateCalendarDays = () => {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const days = [];
    let currentDay = startDate;
    
    // Add empty cells for days before the first day of the month
    const firstDayOfWeek = startDate.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-prev-${i}`} className="h-28 p-2 bg-gray-50"></div>);
    }
    
    // Add days of the month
    while (currentDay <= endDate) {
      const day = new Date(currentDay);
      const dayEvents = events.filter(event => 
        event.date && isSameDay(new Date(event.date), day)
      );
      const isToday = isSameDay(day, new Date());
      const isSelected = isSameDay(day, selectedDate);
      
      days.push(
        <div
          key={day.toISOString()}
          onClick={() => handleDateClick(day)}
          className={`h-28 p-2 border border-gray-200 overflow-hidden transition-colors cursor-pointer ${
            isToday ? 'bg-blue-50' : ''
          } ${isSelected ? 'ring-2 ring-blue-500' : ''} hover:bg-blue-50`}
        >
          <div className="font-medium text-sm mb-1">
            {format(day, 'd')}
          </div>
          
          {dayEvents.slice(0, 3).map((event, idx) => (
            <div 
              key={`${event.id}-${idx}`} 
              className={`text-xs truncate mb-1 px-1.5 py-0.5 rounded ${getEventTypeColor(event.type, event.status, event.date)}`}
            >
              {event.title}
            </div>
          ))}
          
          {dayEvents.length > 3 && (
            <div className="text-xs text-center text-gray-500">
              +{dayEvents.length - 3} mais
            </div>
          )}
        </div>
      );
      
      currentDay = new Date(currentDay.setDate(currentDay.getDate() + 1));
    }
    
    // Add empty cells for days after the last day of the month
    const lastDayOfWeek = endDate.getDay();
    for (let i = lastDayOfWeek; i < 6; i++) {
      days.push(<div key={`empty-next-${i}`} className="h-28 p-2 bg-gray-50"></div>);
    }
    
    return days;
  };

  const getPendingEvents = () => {
    return events.filter(event => {
      // Para transações financeiras pendentes
      if ((event.type === 'receita' || event.type === 'despesa') && event.status === 'pendente' && event.date) {
        return isAfter(new Date(event.date), today) && isBefore(new Date(event.date), addDays(today, 7));
      }
      
      // Para serviços agendados
      if (event.type === 'service' && event.status === 'agendado' && event.date) {
        return isAfter(new Date(event.date), today) && isBefore(new Date(event.date), addDays(today, 7));
      }
      
      // Para ordens de serviço pendentes
      if (event.type === 'order' && (event.status === 'pending' || event.status === 'in_progress') && event.date) {
        return isAfter(new Date(event.date), today) && isBefore(new Date(event.date), addDays(today, 7));
      }
      
      return false;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getEventTypeName = (type) => {
    switch (type) {
      case 'service': return 'Serviço';
      case 'order': return 'Ordem de Serviço';
      case 'receita': return 'Receita';
      case 'despesa': return 'Despesa';
      default: return type;
    }
  };

  const getStatusName = (type, status) => {
    if (type === 'service') {
      switch (status) {
        case 'agendado': return 'Agendado';
        case 'em_andamento': return 'Em andamento';
        case 'concluido': return 'Concluído';
        case 'cancelado': return 'Cancelado';
        default: return status;
      }
    } else if (type === 'order') {
      switch (status) {
        case 'pending': return 'Pendente';
        case 'in_progress': return 'Em andamento';
        case 'completed': return 'Concluído';
        case 'cancelled': return 'Cancelado';
        default: return status;
      }
    } else if (type === 'receita' || type === 'despesa') {
      switch (status) {
        case 'pendente': return 'Pendente';
        case 'pago': return 'Pago';
        case 'cancelado': return 'Cancelado';
        default: return status;
      }
    }
    
    return status;
  };

  const pendingEvents = getPendingEvents();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Calendário</h1>
          <p className="text-muted-foreground mt-1">Agenda e compromissos</p>
        </div>
        <Button onClick={() => setSelectedDate(new Date())}>
          Hoje
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
              <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl font-semibold px-4">
                  {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                </h2>
                <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-7">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                  <div key={day} className="py-2 text-center font-medium text-sm bg-gray-50">
                    {day}
                  </div>
                ))}
                {generateCalendarDays()}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Tabs defaultValue="selected">
            <TabsList className="w-full">
              <TabsTrigger value="selected">Data Selecionada</TabsTrigger>
              <TabsTrigger value="upcoming">Próximos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="selected">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Eventos para {format(selectedDate, 'dd/MM/yyyy')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      Carregando eventos...
                    </div>
                  ) : selectedEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="mx-auto h-12 w-12 mb-2 text-muted-foreground" />
                      Nenhum evento para esta data
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {selectedEvents.map((event) => (
                          <Card key={`${event.id}-${event.type}`} className="overflow-hidden">
                            <div className={`h-2 ${
                              event.type === 'service' ? 'bg-blue-500' : 
                              event.type === 'order' ? 'bg-purple-500' : 
                              event.type === 'receita' ? 'bg-green-500' : 
                              'bg-red-500'
                            }`}></div>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge className={getEventTypeColor(event.type, event.status, event.date)}>
                                    {getEventTypeName(event.type)}
                                  </Badge>
                                  <h3 className="font-medium">{event.title}</h3>
                                </div>
                                <Badge variant="outline">
                                  {getStatusName(event.type, event.status)}
                                </Badge>
                              </div>
                              
                              <div className="text-sm text-muted-foreground mt-2">
                                {event.date && (
                                  <div className="flex items-center gap-1 mb-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{format(new Date(event.date), 'dd/MM/yyyy HH:mm')}</span>
                                  </div>
                                )}
                                
                                {event.clientName && (
                                  <div className="mb-1">Cliente: {event.clientName}</div>
                                )}
                                
                                {(event.type === 'receita' || event.type === 'despesa') && (
                                  <div className="font-medium mt-1">
                                    Valor: R$ {event.amount?.toFixed(2)}
                                  </div>
                                )}
                                
                                {(event.type === 'service' || event.type === 'order') && event.price && (
                                  <div className="font-medium mt-1">
                                    Valor: R$ {event.price?.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="upcoming">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Próximos Compromissos</CardTitle>
                  <CardDescription>7 dias à frente</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      Carregando eventos...
                    </div>
                  ) : pendingEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="mx-auto h-12 w-12 mb-2 text-muted-foreground" />
                      Nenhum compromisso para os próximos dias
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {pendingEvents.map((event) => (
                          <Card key={`${event.id}-${event.type}`} className="overflow-hidden">
                            <div className={`h-1 ${
                              event.type === 'service' ? 'bg-blue-500' : 
                              event.type === 'order' ? 'bg-purple-500' : 
                              event.type === 'receita' ? 'bg-green-500' : 
                              'bg-red-500'
                            }`}></div>
                            <CardContent className="p-3">
                              <div className="flex justify-between items-center">
                                <div className="font-medium">{event.title}</div>
                                <Badge className={getEventTypeColor(event.type, event.status, event.date)}>
                                  {getEventTypeName(event.type)}
                                </Badge>
                              </div>
                              <div className="text-sm mt-2 flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{format(new Date(event.date), 'dd/MM/yyyy')}</span>
                              </div>
                              
                              {event.clientName && (
                                <div className="text-sm mt-1">Cliente: {event.clientName}</div>
                              )}
                              
                              {(event.type === 'receita' || event.type === 'despesa') && (
                                <div className="font-medium mt-1 text-sm">
                                  R$ {event.amount?.toFixed(2)}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}