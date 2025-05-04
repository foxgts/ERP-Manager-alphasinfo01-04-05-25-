
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User } from '@/entities/User';
import { 
  Building, Upload, Palette, Bell, Lock, Database, CreditCard, Mail,
  Globe, FileText, Image, Check, Users,
} from "lucide-react";
import { CreditCard as BankCard } from "lucide-react";

export default function Configuracoes() {
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [user, setUser] = useState(null);
  
  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };
    
    fetchUserData();
  }, []);
  
  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulação de salvar as configurações
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = user?.tipo === 'administrador';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground mt-1">Personalize o sistema</p>
        </div>
        {saveSuccess && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md flex items-center">
            <Check className="h-4 w-4 mr-2" />
            Configurações salvas com sucesso!
          </div>
        )}
      </div>

      <Tabs defaultValue="empresa">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-5">
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="integracao">Integrações</TabsTrigger>
          <TabsTrigger value="usuario">Meu Perfil</TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                <span>Dados da Empresa</span>
              </CardTitle>
              <CardDescription>Informações da sua empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="empresa_nome">Nome da Empresa</Label>
                  <Input id="empresa_nome" defaultValue="Minha Empresa" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="empresa_cnpj">CNPJ</Label>
                  <Input id="empresa_cnpj" defaultValue="00.000.000/0001-00" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="empresa_telefone">Telefone</Label>
                  <Input id="empresa_telefone" defaultValue="(00) 0000-0000" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="empresa_email">E-mail</Label>
                  <Input id="empresa_email" defaultValue="contato@minhaempresa.com" />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="empresa_endereco">Endereço</Label>
                  <Input id="empresa_endereco" defaultValue="Rua Exemplo, 123 - Centro" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="empresa_logo">Logo da Empresa</Label>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                    <Image className="h-6 w-6 text-gray-500" />
                  </div>
                  <Button variant="outline" className="flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Carregar Logo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>Documentos Fiscais</span>
              </CardTitle>
              <CardDescription>Configurações para documentos fiscais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fiscal_regime">Regime Tributário</Label>
                  <Select defaultValue="simples">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simples">Simples Nacional</SelectItem>
                      <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                      <SelectItem value="lucro_real">Lucro Real</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                  <Input id="inscricao_estadual" defaultValue="123456789" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="inscricao_municipal">Inscrição Municipal</Label>
                  <Input id="inscricao_municipal" defaultValue="987654321" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sistema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <span>Aparência</span>
              </CardTitle>
              <CardDescription>Personalize a aparência do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <div className="flex items-center justify-between">
                    <span>Tema Escuro</span>
                    <Switch defaultChecked={user?.tema === "escuro"} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Cor Primária</Label>
                  <Select defaultValue="blue">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Azul</SelectItem>
                      <SelectItem value="green">Verde</SelectItem>
                      <SelectItem value="purple">Roxo</SelectItem>
                      <SelectItem value="red">Vermelho</SelectItem>
                      <SelectItem value="orange">Laranja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <span>Notificações</span>
              </CardTitle>
              <CardDescription>Configure as notificações do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif_email">Receber notificações por e-mail</Label>
                  <Switch id="notif_email" defaultChecked />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif_browser">Notificações no navegador</Label>
                  <Switch id="notif_browser" defaultChecked />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif_vencimentos">Alertas de vencimentos financeiros</Label>
                  <Switch id="notif_vencimentos" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  <span>Dados</span>
                </CardTitle>
                <CardDescription>Configurações avançadas de dados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Backup Automático</Label>
                  <div className="flex items-center justify-between">
                    <span>Habilitar backup diário</span>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>E-mail para receber backups</Label>
                  <Input defaultValue="admin@minhaempresa.com" />
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline">
                    Fazer Backup Manual
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span>Métodos de Pagamento</span>
              </CardTitle>
              <CardDescription>Configure as formas de pagamento aceitas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pagamento_dinheiro">Dinheiro</Label>
                  <Switch id="pagamento_dinheiro" defaultChecked />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pagamento_cartao">Cartão de Crédito/Débito</Label>
                  <Switch id="pagamento_cartao" defaultChecked />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pagamento_pix">PIX</Label>
                  <Switch id="pagamento_pix" defaultChecked />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pagamento_boleto">Boleto</Label>
                  <Switch id="pagamento_boleto" defaultChecked />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pagamento_transferencia">Transferência Bancária</Label>
                  <Switch id="pagamento_transferencia" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BankCard className="h-5 w-5" />
                <span>Dados Bancários</span>
              </CardTitle>
              <CardDescription>Configure seus dados bancários</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Banco</Label>
                  <Input defaultValue="Banco do Brasil" />
                </div>
                
                <div className="space-y-2">
                  <Label>Agência</Label>
                  <Input defaultValue="1234" />
                </div>
                
                <div className="space-y-2">
                  <Label>Conta</Label>
                  <Input defaultValue="12345-6" />
                </div>
                
                <div className="space-y-2">
                  <Label>Tipo de Conta</Label>
                  <Select defaultValue="corrente">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corrente">Conta Corrente</SelectItem>
                      <SelectItem value="poupanca">Conta Poupança</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Chave PIX</Label>
                <Input defaultValue="12345678900" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <span>E-mail</span>
              </CardTitle>
              <CardDescription>Configure a integração com e-mail</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Servidor SMTP</Label>
                  <Input defaultValue="smtp.gmail.com" />
                </div>
                
                <div className="space-y-2">
                  <Label>Porta</Label>
                  <Input defaultValue="587" />
                </div>
                
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input defaultValue="sistema@minhaempresa.com" />
                </div>
                
                <div className="space-y-2">
                  <Label>Senha</Label>
                  <Input type="password" defaultValue="********" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ssl">Usar SSL/TLS</Label>
                  <Switch id="ssl" defaultChecked />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline">
                  Testar Conexão
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <span>API</span>
              </CardTitle>
              <CardDescription>Configurações de API para integrações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Chave de API</Label>
                <div className="flex gap-2">
                  <Input defaultValue="sk_test_abcdefghijklmnopqrstuvwxyz1234567890" readOnly />
                  <Button variant="outline">Copiar</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="api_active">API Ativa</Label>
                  <Switch id="api_active" defaultChecked />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Domínios Permitidos</Label>
                <Textarea defaultValue="minhaempresa.com&#10;app.minhaempresa.com" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuario" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Meus Dados</span>
              </CardTitle>
              <CardDescription>Suas informações pessoais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input defaultValue={user?.full_name || "Usuário"} />
                </div>
                
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input defaultValue={user?.email || "usuario@exemplo.com"} readOnly />
                </div>
                
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input defaultValue={user?.telefone || "(00) 00000-0000"} />
                </div>
                
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <Input defaultValue={user?.cargo || "Não definido"} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <span>Segurança</span>
              </CardTitle>
              <CardDescription>Configurações de segurança da sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Alterar Senha</Label>
                <Input type="password" placeholder="Senha atual" />
              </div>
              
              <div className="space-y-2">
                <Input type="password" placeholder="Nova senha" />
              </div>
              
              <div className="space-y-2">
                <Input type="password" placeholder="Confirmar nova senha" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="2fa">Autenticação em duas etapas</Label>
                  <Switch id="2fa" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancelar</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
}
