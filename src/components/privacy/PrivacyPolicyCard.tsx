import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { APP_PATHS } from '@/config/app-routes'
import { FileText, ExternalLink } from 'lucide-react'

const PrivacyPolicyCard: React.FC = () => {
  const handleOpenPolicy = () => {
    window.open(APP_PATHS.privacyPolicy, '_blank', 'noopener,noreferrer')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <div>
            <CardTitle>Política de Privacidade</CardTitle>
            <CardDescription>
              Leia nossa política completa de privacidade e proteção de dados
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg p-4 bg-slate-50">
          <h4 className="font-semibold mb-2">Informações Importantes</h4>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>✓ Como coletamos e usamos seus dados</li>
            <li>✓ Bases legais para o tratamento de dados</li>
            <li>✓ Compartilhamento com terceiros</li>
            <li>✓ Retenção e exclusão de dados</li>
            <li>✓ Seus direitos sob a LGPD</li>
            <li>✓ Medidas de segurança implementadas</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Nossa política de privacidade foi desenvolvida em conformidade com a Lei Geral de
            Proteção de Dados (LGPD) e garante transparência total sobre como seus dados são
            tratados.
          </p>
        </div>

        <Button onClick={handleOpenPolicy} className="w-full gap-2">
          <FileText className="h-4 w-4" />
          Ler Política de Privacidade
          <ExternalLink className="h-4 w-4 ml-auto" />
        </Button>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default PrivacyPolicyCard
