import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Phone, ExternalLink } from 'lucide-react'

const DPOContactCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <div>
            <CardTitle>Contato do Encarregado de Dados</CardTitle>
            <CardDescription>
              Fale diretamente com nosso Data Protection Officer (DPO) sobre privacidade
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-1">Data Protection Officer (DPO)</h4>
            <p className="text-sm text-muted-foreground mb-4">Kronos Tech Solutions</p>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <a
                    href="mailto:dpo@kronos-tech.com.br"
                    className="text-sm text-primary hover:underline"
                  >
                    dpo@kronos-tech.com.br
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <a
                    href="tel:+551133334444"
                    className="text-sm text-primary hover:underline"
                  >
                    +55 (11) 3333-4444
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/60 rounded-lg p-4">
            <h4 className="font-semibold mb-2">O que você pode comunicar?</h4>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>✓ Questões sobre privacidade e LGPD</li>
              <li>✓ Solicitações de dados pessoais</li>
              <li>✓ Reclamações sobre tratamento de dados</li>
              <li>✓ Exercício de seus direitos (acesso, correção, exclusão)</li>
              <li>✓ Consentimentos e revogações</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              O DPO está disponível para ajudar com qualquer questão relacionada a privacidade
              e proteção de dados. Sua comunicação é confidencial e será tratada com urgência.
            </p>
          </div>
        </div>

        <Button className="w-full gap-2" variant="outline" asChild>
          <a href="mailto:dpo@kronos-tech.com.br">
            <Mail className="h-4 w-4" />
            Enviar Email para DPO
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}

export default DPOContactCard
