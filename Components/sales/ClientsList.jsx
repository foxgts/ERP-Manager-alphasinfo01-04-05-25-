import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Client } from '@/entities/Client';
import { Plus, Pencil } from 'lucide-react';
import ClientForm from './ClientForm';

export default function ClientsList() {
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const data = await Client.list();
    setClients(data);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleSave = async (clientData) => {
    try {
      if (editingClient) {
        await Client.update(editingClient.id, clientData);
      } else {
        await Client.create(clientData);
      }
      setShowForm(false);
      setEditingClient(null);
      loadClients();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.document.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      {showForm ? (
        <ClientForm
          client={editingClient}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
        />
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead width="70"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.document}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>
                      {client.type === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(client)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredClients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}