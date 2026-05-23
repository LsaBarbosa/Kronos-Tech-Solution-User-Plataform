import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Info } from 'lucide-react'

const RevocationInfoCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <div>
            <CardTitle>Revogação de Consentimentos</CardTitle>
            <CardDescription>
              Entenda o que acontece quando você revoga seus consentimentos
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            A revogação é uma escolha sua e pode ser feita a qualquer momento, sem penalidades.
            Você não precisa justificar sua decisão.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Consentimento Biométrico
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Ao revogar o consentimento biométrico:
            </p>
            <ul className="text-sm space-y-2 ml-4 list-disc text-muted-foreground">
              <li>Sua imagem biométrica e templates serão permanentemente deletados</li>
              <li>Você não poderá mais usar autenticação biométrica</li>
              <li>Poderá voltar a usar autenticação por senha</li>
              <li>O documento de consentimento será preservado para auditoria</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Efeitos Imediatos</h4>
            <ul className="text-sm space-y-2 ml-4 list-disc text-muted-foreground">
              <li>Cessação imediata do uso de seus dados</li>
              <li>Direito de acesso, correção e portabilidade mantido</li>
              <li>Registro permanente da revogação para compliance</li>
            </ul>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              A revogação não afeta consentimentos que foram baseados em fundamentos legais
              diferentes (como obrigação legal ou interesse legítimo).
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}

export default RevocationInfoCard
