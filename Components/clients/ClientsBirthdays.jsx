import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from '@/entities/Client';
import { format, addYears, isAfter, isBefore, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Gift } from 'lucide-react';

export default function ClientsBirthdays() {
  const [clients, setClients] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const data = await Client.list();
    setClients(data);
    
    const filtered = data
      .filter(client => client.birth_date)
      .map(client => {
        const birthDate = new Date(client.birth_date);
        const thisYearBirthday = new Date(
          new Date().getFullYear(),
          birthDate.getMonth(),
          birthDate.getDate()
        );
        
        // Se a data já passou este ano, considerar para o próximo ano
        const nextBirthday = isAfter(new Date(), thisYearBirthday)
          ? addYears(thisYearBirthday, 1)
          : thisYearBirthday;
          
        return {
          ...client,
          nextBirthday
        };
      })
      .filter(client => {
        // Mostrar apenas aniversários dos próximos 3 meses
        return isBefore(client.nextBirthday, addMonths(new Date(), 3));
      })
      .sort((a, b) => a.nextBirthday - b.nextBirthday);
      
    setUpcomingBirthdays(filtered);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Aniversários</CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingBirthdays.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            Não há aniversários próximos
          </p>
        ) : (
          <div className="space-y-4">
            {upcomingBirthdays.map(client => (
              <div 
                key={client.id}
                className="flex items-center gap-4 p-3 border rounded-lg"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <Gift className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <div className="font-medium">{client.name}</div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(client.birth_date), "dd 'de' MMMM", { locale: ptBR })}
                  </div>
                </div>
                <div className="ml-auto text-sm">
                  Faltam {Math.ceil((client.nextBirthday - new Date()) / (1000 * 60 * 60 * 24))} dias
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}