import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product } from '@/entities/Product';
import { Client } from '@/entities/Client';
import { Sale } from '@/entities/Sale';
import { Search, ShoppingCart, Trash2, ArrowLeft, CheckCircle, FileUp, FilePlus, Barcode } from 'lucide-react';

export default function PDV({ onClose }) {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [installments, setInstallments] = useState(1);
  const [saleCompleted, setSaleCompleted] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [productsData, clientsData] = await Promise.all([
      Product.list(),
      Client.list()
    ]);
    setProducts(productsData);
    setClients(clientsData);
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      }]);
    }
  };

  const handleBarcodeSearch = () => {
    if (!barcodeInput) return;
    
    const product = products.find(p => 
      p.barcode === barcodeInput || 
      p.sku === barcodeInput
    );
    
    if (product) {
      addToCart(product);
      setBarcodeInput('');
    } else {
      alert('Produto não encontrado');
    }
  };

  const handleBarcodeKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleBarcodeSearch();
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCart(cart.map(item =>
      item.product_id === productId
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const resetForm = () => {
    setCart([]);
    setSelectedClient(null);
    setPaymentMethod('');
    setInstallments(1);
    setSaleCompleted(false);
  };

  const handleFinalizeSale = async () => {
    if (!selectedClient || !paymentMethod || cart.length === 0) {
      alert('Por favor, preencha todos os campos necessários');
      return;
    }

    const saleData = {
      client_id: selectedClient,
      items: cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      })),
      total: calculateTotal(),
      payment_method: paymentMethod,
      installments: parseInt(installments),
      status: 'completed'
    };

    try {
      await Sale.create(saleData);
      setSaleCompleted(true);
    } catch (error) {
      alert('Erro ao finalizar venda');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.barcode && product.barcode.includes(searchTerm))
  );

  const handlePrint = () => {
    alert("Imprimindo comprovante de venda...");
    // Implemente a lógica de impressão
  };

  const handleSaveAsPDF = () => {
    alert("Salvando comprovante como PDF...");
    // Implemente a exportação para PDF
  };

  if (saleCompleted) {
    return (
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="max-w-xl mx-auto mt-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl text-green-600">Venda Realizada com Sucesso!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center p-8">
                <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
                <p className="text-gray-600 text-center">
                  A venda foi registrada com sucesso no sistema.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-medium">{clients.find(c => c.id === selectedClient)?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-medium">R$ {calculateTotal().toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Método de Pagamento</p>
                  <p className="font-medium">{
                    paymentMethod === 'dinheiro' ? 'Dinheiro' :
                    paymentMethod === 'cartao_credito' ? 'Cartão de Crédito' :
                    paymentMethod === 'cartao_debito' ? 'Cartão de Débito' : 'PIX'
                  }</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantidade de Itens</p>
                  <p className="font-medium">{cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-between pt-4">
                <div className="space-x-2">
                  <Button variant="outline" onClick={handlePrint}>
                    <FileUp className="w-4 h-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button variant="outline" onClick={handleSaveAsPDF}>
                    <FilePlus className="w-4 h-4 mr-2" />
                    Salvar PDF
                  </Button>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={onClose}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
                    Nova Venda
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-120px)]">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={onClose} className="mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PDV - Ponto de Venda</h1>
              <p className="text-gray-500">Registre suas vendas de forma completa</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Produtos */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative flex-1">
                <Barcode className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Código de barras..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={handleBarcodeKeyPress}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleBarcodeSearch} className="bg-blue-600">
                <Barcode className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addToCart(product)}
                >
                  <CardContent className="p-4">
                    <div className="text-sm font-medium">{product.name}</div>
                    <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                    <div className="mt-2 text-lg font-bold text-blue-600">
                      R$ {product.price.toFixed(2)}
                    </div>
                    {product.barcode && (
                      <div className="mt-1 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Barcode className="h-3 w-3 mr-1" /> 
                          {product.barcode}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Carrinho */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Select
                    value={selectedClient}
                    onValueChange={setSelectedClient}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="border rounded-lg">
                    <div className="p-4 border-b bg-gray-50">
                      <div className="flex items-center gap-2 text-lg font-medium">
                        <ShoppingCart className="w-5 h-5" />
                        Carrinho
                      </div>
                    </div>
                    <ScrollArea className="h-64">
                      <div className="p-4 space-y-4">
                        {cart.map((item) => (
                          <div key={item.product_id} className="flex items-center gap-4">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value))}
                              className="w-20"
                            />
                            <div className="flex-1">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-gray-500">
                                R$ {item.price.toFixed(2)} un.
                              </div>
                            </div>
                            <div className="font-medium">
                              R$ {(item.price * item.quantity).toFixed(2)}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.product_id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}

                        {cart.length === 0 && (
                          <div className="text-center text-gray-500 py-4">
                            Carrinho vazio
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="space-y-4 pt-4">
                    <Select
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Forma de pagamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                        <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                      </SelectContent>
                    </Select>

                    {paymentMethod === 'cartao_credito' && (
                      <Select
                        value={installments.toString()}
                        onValueChange={(value) => setInstallments(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Número de parcelas" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                            <SelectItem key={n} value={n.toString()}>
                              {n}x {n === 1 ? 'à vista' : `de R$ ${(calculateTotal() / n).toFixed(2)}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    <div className="flex justify-between items-center text-lg font-bold pt-4 border-t">
                      <span>Total:</span>
                      <span>R$ {calculateTotal().toFixed(2)}</span>
                    </div>

                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                      onClick={handleFinalizeSale}
                      disabled={cart.length === 0 || !selectedClient || !paymentMethod}
                    >
                      Finalizar Venda
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}