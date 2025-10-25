import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AnalysisProgressProps {
  progress: number;
  status: string;
  message: string;
}

const statusConfig = {
  upload_complete: { label: 'Upload Complete', icon: Check, color: 'text-green-500' },
  ocr_started: { label: 'Extracting Text', icon: Loader2, color: 'text-blue-500' },
  forensics_running: { label: 'Forensic Analysis', icon: Loader2, color: 'text-purple-500' },
  analysis_complete: { label: 'Analysis Complete', icon: Check, color: 'text-green-500' },
  hedera_anchoring: { label: 'Blockchain Anchoring', icon: Loader2, color: 'text-orange-500' },
  hedera_anchored: { label: 'Verified on Blockchain', icon: Check, color: 'text-green-500' },
  complete: { label: 'Verification Complete', icon: Check, color: 'text-green-500' },
  failed: { label: 'Verification Failed', icon: AlertCircle, color: 'text-red-500' },
};

export const AnalysisProgress = ({ progress, status, message }: AnalysisProgressProps) => {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: 'Processing',
    icon: Loader2,
    color: 'text-blue-500',
  };

  const Icon = config.icon;
  const isLoading = Icon === Loader2;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full bg-background ${config.color}`}>
          <Icon className={`h-6 w-6 ${isLoading ? 'animate-spin' : ''}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{config.label}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 border-t"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI agents are analyzing your receipt...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
