import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link as LinkIcon, Copy, Share2, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HederaAnchorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptId: string;
  onAnchor: () => Promise<{ transactionId: string; explorerUrl: string }>;
  existingAnchor?: {
    transaction_id: string;
    explorer_url: string;
    consensus_timestamp: string;
  };
}

export const HederaAnchorModal = ({
  open,
  onOpenChange,
  receiptId,
  onAnchor,
  existingAnchor,
}: HederaAnchorModalProps) => {
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [anchorResult, setAnchorResult] = useState<{
    transactionId: string;
    explorerUrl: string;
  } | null>(existingAnchor ? {
    transactionId: existingAnchor.transaction_id,
    explorerUrl: existingAnchor.explorer_url
  } : null);

  const handleAnchor = async () => {
    setIsAnchoring(true);
    try {
      const result = await onAnchor();
      setAnchorResult(result);
      toast.success('Successfully anchored to Hedera blockchain!');
    } catch (error) {
      toast.error('Failed to anchor. Please try again.');
      console.error('Anchor error:', error);
    } finally {
      setIsAnchoring(false);
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/receipt/${receiptId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/receipt/${receiptId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Legit Verification Report',
          text: 'Verified on Hedera Blockchain',
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-purple-500/10">
              <LinkIcon className="h-5 w-5 text-purple-500" />
            </div>
            <DialogTitle className="text-xl">Blockchain Verification</DialogTitle>
          </div>
          <DialogDescription>
            Create immutable proof of this analysis on the Hedera blockchain
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!anchorResult ? (
            <motion.div
              key="pre-anchor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 py-4"
            >
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <h4 className="font-semibold text-sm">What is blockchain anchoring?</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                    <span>Creates permanent, tamper-proof record of this verification</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                    <span>Verifiable by anyone, anywhere, anytime</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                    <span>Powered by Hedera Consensus Service (HCS)</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                    <span>Cryptographic proof for legal or business purposes</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Recommended</Badge>
                  <span className="text-sm font-medium">Free for all users</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="post-anchor"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 py-4"
            >
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-success/10">
                  <CheckCircle2 className="h-12 w-12 text-success" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Successfully Anchored!</h3>
                <p className="text-sm text-muted-foreground">
                  This verification is now permanently recorded on Hedera blockchain
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Transaction ID</p>
                  <p className="text-sm font-mono break-all">{anchorResult.transactionId}</p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <a href={anchorResult.explorerUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on HashScan Explorer
                  </a>
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleCopyLink}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter>
          {!anchorResult ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAnchoring}>
                Cancel
              </Button>
              <Button onClick={handleAnchor} disabled={isAnchoring}>
                {isAnchoring ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Anchoring...
                  </>
                ) : (
                  'Anchor to Hedera'
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
