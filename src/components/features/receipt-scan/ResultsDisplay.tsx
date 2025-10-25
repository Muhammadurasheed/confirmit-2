import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, HelpCircle, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TrustScoreGauge from '@/components/shared/TrustScoreGauge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ResultsDisplayProps {
  receiptId: string;
  trustScore: number;
  verdict: 'authentic' | 'suspicious' | 'fraudulent' | 'unclear';
  issues: Array<{
    type: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
  }>;
  recommendation: string;
  forensicDetails: {
    ocr_confidence: number;
    manipulation_score: number;
    metadata_flags: string[];
  };
  merchant?: {
    name: string;
    verified: boolean;
    trust_score: number;
  } | null;
  hederaAnchor?: {
    transaction_id: string;
    consensus_timestamp: string;
    explorer_url: string;
  } | null;
}

const verdictConfig = {
  authentic: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    label: 'Authentic',
  },
  suspicious: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    label: 'Suspicious',
  },
  fraudulent: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: 'Fraudulent',
  },
  unclear: {
    icon: HelpCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'Unclear',
  },
};

export const ResultsDisplay = ({
  receiptId,
  trustScore,
  verdict,
  issues,
  recommendation,
  forensicDetails,
  merchant,
  hederaAnchor,
}: ResultsDisplayProps) => {
  const config = verdictConfig[verdict];
  const VerdictIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Trust Score & Verdict */}
      <Card className="p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <TrustScoreGauge score={trustScore} size={200} />
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className={`p-3 rounded-full ${config.bgColor}`}>
                <VerdictIcon className={`h-8 w-8 ${config.color}`} />
              </div>
              <div>
                <Badge variant={verdict === 'authentic' ? 'default' : verdict === 'fraudulent' ? 'destructive' : 'secondary'} className="text-lg px-4 py-1">
                  {config.label}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Verification Results</h2>
              <p className="text-muted-foreground">Receipt ID: {receiptId}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Recommendation Banner */}
      <Card className={`p-6 border-l-4 ${verdict === 'authentic' ? 'border-l-green-500' : verdict === 'fraudulent' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
        <h3 className="font-semibold mb-2">Recommendation</h3>
        <p className="text-sm">{recommendation}</p>
      </Card>

      {/* Issues */}
      {issues.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Detected Issues ({issues.length})</h3>
          <div className="space-y-3">
            {issues.map((issue, index) => (
              <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                <Badge variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'default' : 'secondary'}>
                  {issue.severity}
                </Badge>
                <div className="flex-1">
                  <p className="font-medium text-sm">{issue.type.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-muted-foreground">{issue.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Merchant Info */}
      {merchant && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Merchant Information</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{merchant.name}</p>
              <p className="text-sm text-muted-foreground">Trust Score: {merchant.trust_score}/100</p>
            </div>
            {merchant.verified && (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>
        </Card>
      )}

      {/* Forensic Details Accordion */}
      <Accordion type="single" collapsible>
        <AccordionItem value="forensics">
          <AccordionTrigger className="text-base font-semibold">
            Forensic Analysis Details
          </AccordionTrigger>
          <AccordionContent>
            <Card className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">OCR Confidence</p>
                  <p className="text-2xl font-bold">{forensicDetails.ocr_confidence}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Manipulation Score</p>
                  <p className="text-2xl font-bold">{forensicDetails.manipulation_score}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Metadata Flags</p>
                  <p className="text-2xl font-bold">{forensicDetails.metadata_flags.length}</p>
                </div>
              </div>
              
              {forensicDetails.metadata_flags.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Metadata Findings:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {forensicDetails.metadata_flags.map((flag, index) => (
                      <li key={index}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Hedera Blockchain Anchor */}
      {hederaAnchor && (
        <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Verified on Hedera Blockchain
              </h3>
              <p className="text-sm text-muted-foreground">
                Transaction: {hederaAnchor.transaction_id.substring(0, 20)}...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Consensus: {hederaAnchor.consensus_timestamp}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={hederaAnchor.explorer_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Explorer
              </a>
            </Button>
          </div>
        </Card>
      )}
    </motion.div>
  );
};
