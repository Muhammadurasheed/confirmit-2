import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Lock } from "lucide-react";

const QuickScan = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Container className="py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Receipt Verification</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload any receipt and get instant AI-powered fraud analysis. 
              Know if you're dealing with a legitimate business in seconds.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Instant Analysis</CardTitle>
                <CardDescription>
                  Get results in under 8 seconds with AI-powered forensics
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-success mb-2" />
                <CardTitle>Multi-Agent AI</CardTitle>
                <CardDescription>
                  Advanced computer vision and forensic analysis agents
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Lock className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Blockchain Proof</CardTitle>
                <CardDescription>
                  Anchor results to Hedera for immutable verification
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Upload Zone - Coming in Phase 1 */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Upload Receipt</CardTitle>
              <CardDescription>
                Drag and drop, take a photo, or browse your files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-lg bg-muted/30">
                <p className="text-muted-foreground">
                  Upload functionality coming in Phase 1 implementation
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

export default QuickScan;
