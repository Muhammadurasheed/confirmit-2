import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ShieldCheck, TrendingDown } from "lucide-react";

const AccountCheck = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Container className="py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Account Check</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Verify any bank account before sending money. 
              Check for fraud reports and trust scores instantly.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <ShieldCheck className="h-8 w-8 text-success mb-2" />
                <CardTitle>Trust Score</CardTitle>
                <CardDescription>
                  Instant risk assessment based on historical data
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <AlertTriangle className="h-8 w-8 text-warning mb-2" />
                <CardTitle>Fraud Reports</CardTitle>
                <CardDescription>
                  Community-reported scams and suspicious activity
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <TrendingDown className="h-8 w-8 text-danger mb-2" />
                <CardTitle>Risk Analysis</CardTitle>
                <CardDescription>
                  AI-powered pattern detection for known scams
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Account Input - Coming in Phase 2 */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Check Account Number</CardTitle>
              <CardDescription>
                Enter a 10-digit Nigerian bank account number
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-lg bg-muted/30">
                <p className="text-muted-foreground">
                  Account check functionality coming in Phase 2 implementation
                </p>
              </div>
            </CardContent>
          </Card>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default AccountCheck;
