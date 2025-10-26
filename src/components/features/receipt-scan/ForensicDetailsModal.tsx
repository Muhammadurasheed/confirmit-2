import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Microscope, FileText, Database, Cpu } from 'lucide-react';

interface ForensicDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forensicDetails: {
    ocr_confidence: number;
    manipulation_score: number;
    metadata_flags: string[];
  };
  ocrText?: string;
  agentLogs?: Array<{ agent: string; finding: string }>;
}

export const ForensicDetailsModal = ({
  open,
  onOpenChange,
  forensicDetails,
  ocrText,
  agentLogs,
}: ForensicDetailsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Microscope className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Forensic Analysis Details</DialogTitle>
          </div>
          <DialogDescription>
            Deep dive into the AI-powered forensic analysis of this receipt
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ocr">OCR</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="p-4 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">OCR Confidence</span>
                  <span className="text-sm font-bold">{forensicDetails.ocr_confidence}%</span>
                </div>
                <Progress value={forensicDetails.ocr_confidence} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  How confident the AI is in text extraction accuracy
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Manipulation Score</span>
                  <span className="text-sm font-bold">{forensicDetails.manipulation_score}%</span>
                </div>
                <Progress 
                  value={forensicDetails.manipulation_score} 
                  className="h-2"
                  // @ts-ignore
                  indicatorClassName={forensicDetails.manipulation_score > 50 ? "bg-destructive" : "bg-success"}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Likelihood that the image has been digitally altered
                </p>
              </div>

              <div>
                <span className="text-sm font-medium">Metadata Flags</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {forensicDetails.metadata_flags.length > 0 ? (
                    forensicDetails.metadata_flags.map((flag, index) => (
                      <Badge key={index} variant="outline">{flag}</Badge>
                    ))
                  ) : (
                    <Badge variant="secondary">No flags detected</Badge>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-muted/30">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Microscope className="h-4 w-4" />
                Forensic Techniques Applied
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Error Level Analysis (ELA) for compression artifacts</li>
                <li>• Copy-Move detection using SIFT features</li>
                <li>• Noise pattern consistency analysis</li>
                <li>• EXIF metadata forensics</li>
                <li>• Font and text alignment verification</li>
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="ocr" className="space-y-4">
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Extracted Text
              </h4>
              <div className="bg-muted/50 rounded-lg p-4">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {ocrText || "No OCR text available"}
                </pre>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Confidence score: {forensicDetails.ocr_confidence}% - 
                {forensicDetails.ocr_confidence > 80 ? " Excellent" : forensicDetails.ocr_confidence > 60 ? " Good" : " Poor"}
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="metadata" className="space-y-4">
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Image Metadata Analysis
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Flags Detected:</div>
                  <div className="font-medium">{forensicDetails.metadata_flags.length}</div>
                  
                  <div className="text-muted-foreground">Manipulation Risk:</div>
                  <div className="font-medium">
                    {forensicDetails.manipulation_score > 70 ? "High" : 
                     forensicDetails.manipulation_score > 40 ? "Medium" : "Low"}
                  </div>
                </div>

                {forensicDetails.metadata_flags.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-xs font-medium mb-2">Detected Anomalies:</p>
                    <ul className="space-y-1">
                      {forensicDetails.metadata_flags.map((flag, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-warning">▸</span>
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-4">
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Multi-Agent Analysis
              </h4>
              <div className="space-y-3">
                {agentLogs && agentLogs.length > 0 ? (
                  agentLogs.map((log, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/50 border">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">{log.agent}</Badge>
                      </div>
                      <p className="text-sm">{log.finding}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <Badge variant="secondary" className="text-xs mb-2">Vision Agent</Badge>
                      <p className="text-sm">Extracted text and analyzed visual elements</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <Badge variant="secondary" className="text-xs mb-2">Forensic Agent</Badge>
                      <p className="text-sm">Performed ELA and pixel-level manipulation detection</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <Badge variant="secondary" className="text-xs mb-2">Metadata Agent</Badge>
                      <p className="text-sm">Analyzed EXIF data and editing software traces</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <Badge variant="secondary" className="text-xs mb-2">Reputation Agent</Badge>
                      <p className="text-sm">Cross-referenced merchant and account data</p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
