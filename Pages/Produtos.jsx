import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search, FileDown, Printer, MoreHorizontal, Barcode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from '@/entities/Product';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function Produtos() {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await Product.list();
      setProducts(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await Product.update(editingProduct.id, productData);
      } else {
        await Product.create(productData);
      }
      setShowForm(false);
      loadProducts();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(filter.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(filter.toLowerCase())) ||
    (product.description && product.description.toLowerCase().includes(filter.toLowerCase())) ||
    (product.barcode && product.barcode.includes(filter))
  );

  if (showForm) {
    return (
      <ProductForm
        product={editingProduct}
        onSave={handleSaveProduct}
        onCancel={handleCancelForm}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus produtos e estoque</p>
        </div>
        <Button
          onClick={handleCreateProduct}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos por nome, código ou barcode..."
                className="pl-10"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-270px)]">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>SKU/Barcode</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum produto encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-md">
                            {product.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>SKU: {product.sku}</div>
                        {product.barcode && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Barcode className="h-3 w-3 mr-1" /> 
                            {product.barcode}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Badge 
                            className={product.stock > 10 ? "bg-green-100 text-green-800" : 
                                      product.stock > 0 ? "bg-yellow-100 text-yellow-800" : 
                                      "bg-red-100 text-red-800"}
                          >
                            {product.stock} {product.unit || 'unid'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.category || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => alert(`Imprimindo etiqueta para ${product.name}...`)}>
                              <Printer className="mr-2 h-4 w-4" />
                              Imprimir Etiqueta
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => alert(`Exportando dados de ${product.name}...`)}>
                              <FileDown className="mr-2 h-4 w-4" />
                              Exportar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductForm({ product, onSave, onCancel }) {
  const [formData, setFormData] = useState(product || {
    name: '',
    description: '',
    price: '',
    cost: '',
    stock: '',
    category: '',
    sku: '',
    barcode: '',
    weight: '',
    volume: '',
    length: '',
    width: '',
    height: '',
    unit: 'unidade'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      cost: parseFloat(formData.cost) || 0,
      stock: parseFloat(formData.stock) || 0,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      volume: formData.volume ? parseFloat(formData.volume) : undefined,
      length: formData.length ? parseFloat(formData.length) : undefined,
      width: formData.width ? parseFloat(formData.width) : undefined,
      height: formData.height ? parseFloat(formData.height) : undefined
    };
    onSave(processedData);
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">{product ? 'Editar Produto' : 'Novo Produto'}</h2>
          <p className="text-muted-foreground">Preencha os dados do produto</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="barcode">Código de Barras</Label>
            <Input
              id="barcode"
              value={formData.barcode || ''}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Preço de Venda (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cost">Custo (R$)</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              min="0"
              value={formData.cost || ''}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stock">Estoque</Label>
            <Input
              id="stock"
              type="number"
              step="0.01"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unit">Unidade de Medida</Label>
            <Select
              value={formData.unit}
              onValueChange={(value) => setFormData({ ...formData, unit: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unidade">Unidade</SelectItem>
                <SelectItem value="kg">Quilograma (kg)</SelectItem>
                <SelectItem value="litro">Litro</SelectItem>
                <SelectItem value="metro">Metro</SelectItem>
                <SelectItem value="caixa">Caixa</SelectItem>
                <SelectItem value="par">Par</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-3">Dimensões e Peso</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.001"
                min="0"
                value={formData.weight || ''}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="volume">Volume (m³)</Label>
              <Input
                id="volume"
                type="number"
                step="0.001"
                min="0"
                value={formData.volume || ''}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Comprimento (cm)</Label>
              <Input
                id="length"
                type="number"
                step="0.1"
                min="0"
                value={formData.length || ''}
                onChange={(e) => setFormData({ ...formData, length: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="width">Largura (cm)</Label>
              <Input
                id="width"
                type="number"
                step="0.1"
                min="0"
                value={formData.width || ''}
                onChange={(e) => setFormData({ ...formData, width: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                min="0"
                value={formData.height || ''}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Salvar
          </Button>
        </div>
      </form>
    </Card>
  );
}