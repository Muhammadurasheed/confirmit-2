import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldCheck, TrendingDown, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AccountInput } from "@/components/features/account-check/AccountInput";
import { AccountCheckProgress } from "@/components/features/account-check/AccountCheckProgress";
import { TrustScore } from "@/components/features/account-check/TrustScore";
import { FraudAlerts } from "@/components/features/account-check/FraudAlerts";
import { accountsService, type AccountCheckResult } from "@/services/accounts";

const AccountCheck = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<AccountCheckResult | null>(null);

  const handleCheckAccount = async (
    accountNumber: string,
    bankCode?: string,
    businessName?: string
  ) => {
    setIsChecking(true);

    try {
      const checkResult = await accountsService.checkAccount({
        accountNumber,
        bankCode,
        businessName,
      });

      setResult(checkResult);
      toast.success("Account check complete!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Account check failed");
      console.error("Account check error:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  const getRecommendation = (data: AccountCheckResult["data"]): string => {
    const hasRecentReports = data.checks.fraud_reports.recent_30_days > 0;
    const hasFlags = data.checks.flags.length > 0;
    const trustScore = data.trust_score;

    if (hasRecentReports || hasFlags || trustScore < 40) {
      return "⛔ DO NOT SEND MONEY to this account. Multiple security red flags detected. This account has been reported for fraudulent activity.";
    } else if (data.risk_level === "medium" || trustScore < 70) {
      return "⚠️ PROCEED WITH CAUTION. Verify recipient details carefully before sending money. Contact the recipient through a trusted channel to confirm their account number.";
    } else {
      return "✅ This account appears safe based on our analysis. However, always verify recipient details before sending money.";
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <main className="flex-1">
        <Container className="py-8 md:py-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">
              <ShieldCheck className="h-3 w-3 mr-1" />
              AI-Powered Account Verification
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Account Check
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Verify any bank account before sending money. Check for fraud reports and trust scores instantly.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12"
          >
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <ShieldCheck className="h-8 w-8 text-success mb-2" />
                <CardTitle className="text-lg">Trust Score</CardTitle>
                <CardDescription className="text-sm">
                  Instant risk assessment based on historical data
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <AlertTriangle className="h-8 w-8 text-warning mb-2" />
                <CardTitle className="text-lg">Fraud Reports</CardTitle>
                <CardDescription className="text-sm">
                  Community-reported scams and suspicious activity
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <TrendingDown className="h-8 w-8 text-destructive mb-2" />
                <CardTitle className="text-lg">Risk Analysis</CardTitle>
                <CardDescription className="text-sm">
                  AI-powered pattern detection for known scams
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Main Content */}
          <AnimatePresence mode="wait">
            {!result && !isChecking && (
              <motion.div
                key="input"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="shadow-2xl border-primary/10">
                  <CardHeader>
                    <CardTitle className="text-2xl">Check Account Number</CardTitle>
                    <CardDescription className="text-base">
                      Enter a 10-digit Nigerian bank account number to verify
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AccountInput onSubmit={handleCheckAccount} isLoading={isChecking} />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {isChecking && (
              <motion.div
                key="checking"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <AccountCheckProgress />
              </motion.div>
            )}

            {result && !isChecking && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* Back Button */}
                <Button onClick={handleReset} variant="outline" size="lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Check Another Account
                </Button>

                {/* Trust Score Display */}
                <TrustScore
                  score={result.data.trust_score}
                  riskLevel={result.data.risk_level}
                  checkCount={result.data.checks.check_count}
                  lastChecked={result.data.checks.last_checked}
                />

                {/* Fraud Alerts */}
                <FraudAlerts
                  fraudReports={result.data.checks.fraud_reports}
                  flags={result.data.checks.flags}
                  verifiedBusiness={result.data.verified_business}
                  recommendation={getRecommendation(result.data)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default AccountCheck;
