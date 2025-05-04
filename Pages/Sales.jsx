import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import PDVComponent from "../components/sales/PDV";
import FastPDV from "../components/sales/FastPDV";
import SalesList from "../components/sales/SalesList";
import ProductsList from "../components/sales/ProductsList";
import ClientsList from "../components/sales/ClientsList";

export default function Sales() {
  const [showFullPDV, setShowFullPDV] = useState(false);

  if (showFullPDV) {
    return <PDVComponent onClose={() => setShowFullPDV(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
          <p className="text-gray-500 mt-1">Gerencie suas vendas e produtos</p>
        </div>
        <Button 
          onClick={() => setShowFullPDV(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          PDV Completo
        </Button>
      </div>

      <div>
        <Tabs defaultValue="pdv">
          <TabsList>
            <TabsTrigger value="pdv">PDV Rápido</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
          </TabsList>

          <TabsContent value="pdv">
            <div className="mt-4">
              <FastPDV />
            </div>
          </TabsContent>

          <TabsContent value="sales">
            <div className="mt-4">
              <SalesList />
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="mt-4">
              <ProductsList />
            </div>
          </TabsContent>

          <TabsContent value="clients">
            <div className="mt-4">
              <ClientsList />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}