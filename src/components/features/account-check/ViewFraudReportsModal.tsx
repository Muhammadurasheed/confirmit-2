import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface FraudReportsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reports: {
    total: number;
    recent_30_days: number;
    categories?: Array<{
      type: string;
      count: number;
    }>;
  };
}

export const ViewFraudReportsModal = ({ open, onOpenChange, reports }: FraudReportsModalProps) => {
  // Mock detailed reports for display
  const detailedReports = [
    {
      id: "1",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      category: "Non-delivery of goods",
      pattern: "Customer paid but never received items",
      severity: "high" as const,
    },
    {
      id: "2",
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      category: "Fake products",
      pattern: "Counterfeit items sold as original",
      severity: "high" as const,
    },
    {
      id: "3",
      date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      category: "Account takeover",
      pattern: "Similar to known phishing accounts",
      severity: "medium" as const,
    },
  ].slice(0, Math.min(reports.recent_30_days, 5));

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive" as const;
      case "medium":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            Fraud Reports
          </DialogTitle>
          <DialogDescription>
            Community-reported fraudulent activity for this account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-destructive/5 border-destructive/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">Total Reports</span>
              </div>
              <p className="text-3xl font-bold text-destructive">{reports.total}</p>
            </div>
            <div className="p-4 rounded-lg border bg-warning/5 border-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">Last 30 Days</span>
              </div>
              <p className="text-3xl font-bold text-warning">{reports.recent_30_days}</p>
            </div>
          </div>

          {/* Report Categories */}
          {reports.categories && reports.categories.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Common Scam Patterns</h4>
              <div className="flex flex-wrap gap-2">
                {reports.categories.map((cat, index) => (
                  <Badge key={index} variant="outline" className="gap-2">
                    <span>{cat.type}</span>
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {cat.count}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recent Reports */}
          <div className="space-y-2">
            <h4 className="font-semibold">Recent Reports (Anonymized)</h4>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {detailedReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={getSeverityColor(report.severity)}>
                        {report.severity} risk
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(report.date, "MMM d, yyyy")}
                      </span>
                    </div>
                    <p className="font-medium mb-1">{report.category}</p>
                    <p className="text-sm text-muted-foreground">{report.pattern}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Disclaimer */}
          <div className="p-4 rounded-lg bg-muted/50 border border-muted">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> All reports are anonymized to protect user privacy. Reports are verified by our system before being counted. Similar account patterns are analyzed to detect fraud networks.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
