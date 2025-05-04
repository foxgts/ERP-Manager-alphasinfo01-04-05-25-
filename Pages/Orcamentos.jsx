import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import QuotesList from '../components/quotes/QuotesList';
import QuoteForm from '../components/quotes/QuoteForm';

export default function Orcamentos() {
  const [showForm, setShowForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Orçamentos</h1>
          <p className="text-muted-foreground mt-1">Gestão de orçamentos</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {showForm ? (
        <QuoteForm
          quote={editingQuote}
          onClose={() => {
            setShowForm(false);
            setEditingQuote(null);
          }}
        />
      ) : (
        <QuotesList onEdit={(quote) => {
          setEditingQuote(quote);
          setShowForm(true);
        }} />
      )}
    </div>
  );
}