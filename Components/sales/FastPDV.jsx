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
import { Product } from '@/entities/Product';
import { Client } from '@/entities/Client';
import { Sale } from '@/entities/Sale';
import { Search, ShoppingCart, Barcode, X, Plus, Minus, CreditCard, Wallet, QrCode, DollarSign, Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function FastPDV() {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Busca por código de barras
    if (barcodeSearch) {
      const product = products.find(p => 
        p.barcode === barcodeSearch || 
        p.sku === barcodeSearch);
      
      if (product) {
        addToCart(product);
        setBarcodeSearch('');
      }
    }
  }, [barcodeSearch, products]);

  const loadData = async () => {
    try {
      const [productsData, clientsData] = await Promise.all([
        Product.list(),
        Client.list()
      ]);
      setProducts(productsData);
      setClients(clientsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
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

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setCart(cart.map(item =>
      item.product_id === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleFinalizeSale = async () => {
    if (!selectedClient || !paymentMethod || cart.length === 0) {
      alert("Por favor, preencha todos os campos necessários");
      return;
    }

    try {
      await Sale.create({
        client_id: selectedClient,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        })),
        total: calculateTotal(),
        payment_method: paymentMethod,
        status: 'completed'
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setCart([]);
        setSelectedClient(null);
        setPaymentMethod('');
      }, 3000);
    } catch (error) {
      console.error("Erro ao finalizar venda:", error);
      alert('Erro ao finalizar venda');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.barcode && product.barcode.includes(searchTerm))
  );

  if (showSuccess) {
    return (
      <Card className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto bg-green-100 text-green-800 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
            <Check className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Venda Realizada!</h2>
          <p className="text-gray-600 mb-6">A venda foi registrada com sucesso.</p>
          <Button onClick={() => {
            setShowSuccess(false);
            setCart([]);
            setSelectedClient(null);
            setPaymentMethod('');
          }}>
            Nova Venda
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Coluna da Esquerda: Busca e Lista de Produtos */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Produtos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              
              <div className="relative w-1/3">
                <Barcode className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Código/EAN"
                  value={barcodeSearch}
                  onChange={(e) => setBarcodeSearch(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && barcodeSearch) {
                      const product = products.find(p => 
                        p.barcode === barcodeSearch || 
                        p.sku === barcodeSearch);
                      
                      if (product) {
                        addToCart(product);
                        setBarcodeSearch('');
                      } else {
                        alert('Produto não encontrado!');
                      }
                    }
                  }}
                />
              </div>
            </div>

            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredProducts.map((product) => (
                  <Button
                    key={product.id}
                    variant="outline"
                    className="h-auto py-2 px-3 flex flex-col items-start text-left justify-start"
                    onClick={() => addToCart(product)}
                  >
                    <div className="font-medium truncate w-full">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.sku}
                    </div>
                    <div className="font-semibold mt-1">
                      R$ {product.price.toFixed(2)}
                    </div>
                  </Button>
                ))}
                
                {filteredProducts.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-muted-foreground">
                    Nenhum produto encontrado
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Coluna da Direita: Carrinho */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Carrinho
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[200px] rounded-md border p-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Seu carrinho está vazio</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.product_id} className="flex justify-between items-center p-2 border-b">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          R$ {item.price.toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="w-8 text-center font-medium">{item.quantity}</div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            <Separator />
            
            <div className="flex justify-between items-center text-xl font-semibold">
              <span>Total:</span>
              <span>R$ {calculateTotal().toFixed(2)}</span>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Forma de Pagamento</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={paymentMethod === 'dinheiro' ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => setPaymentMethod('dinheiro')}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Dinheiro
                </Button>
                <Button
                  variant={paymentMethod === 'cartao_credito' ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => setPaymentMethod('cartao_credito')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Cartão de Crédito
                </Button>
                <Button
                  variant={paymentMethod === 'cartao_debito' ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => setPaymentMethod('cartao_debito')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Cartão de Débito
                </Button>
                <Button
                  variant={paymentMethod === 'pix' ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => setPaymentMethod('pix')}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  PIX
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <Button 
              className="w-full" 
              size="lg" 
              disabled={cart.length === 0 || !selectedClient || !paymentMethod}
              onClick={handleFinalizeSale}
            >
              Finalizar Venda
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}