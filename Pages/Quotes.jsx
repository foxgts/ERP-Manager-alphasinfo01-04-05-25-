import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import QuotesList from '../components/quotes/QuotesList';
import QuoteForm from '../components/quotes/QuoteForm';

export default function Quotes() {
  const [showForm, setShowForm] = React.useState(false);
  const [editingQuote, setEditingQuote] = React.useState(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-gray-500 mt-1">Gestão de orçamentos</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
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