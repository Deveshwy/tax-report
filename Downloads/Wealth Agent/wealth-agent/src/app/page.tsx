import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Calculator, Zap, ArrowRight, Star, Shield } from 'lucide-react';
import Chat from '@/components/chat';

export default function Home() {
  return (
    <>
      <SignedOut>
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
          {/* Hero Section */}
          <div className="container mx-auto px-4 py-16 flex flex-col items-center text-center">
            <div className="mb-8 space-y-4">
              <Badge variant="secondary" className="gap-2 text-sm py-1.5 px-4">
                <Star className="w-4 h-4" />
                Exclusive for Legacy Wealth Blueprint Students
              </Badge>
              
              <div className="w-24 h-24 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                <BarChart3 className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>
            
            <div className="max-w-4xl space-y-6">
              <h1 className="text-6xl font-bold tracking-tight">
                Your AI-Powered
                <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent block mt-2">
                  Financial Co-Pilot
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Get personalized financial advice, portfolio analysis, and strategic guidance 
                powered by advanced AI. Transform your wealth-building journey with intelligent insights.
              </p>
            </div>
            
            {/* Feature Cards */}
            <div className="w-full max-w-6xl mt-16 grid md:grid-cols-3 gap-6">
              <Card className="relative group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Portfolio Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Deep dive into your investments with AI-powered insights, risk assessment, and optimization recommendations.
                  </CardDescription>
                  <div className="flex gap-2 mt-4">
                    <Badge variant="outline" className="text-xs">Risk Analysis</Badge>
                    <Badge variant="outline" className="text-xs">Performance</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="relative group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Calculator className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Financial Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Create comprehensive financial strategies tailored to your goals, timeline, and risk tolerance.
                  </CardDescription>
                  <div className="flex gap-2 mt-4">
                    <Badge variant="outline" className="text-xs">Goal Setting</Badge>
                    <Badge variant="outline" className="text-xs">Strategy</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="relative group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Real-time Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Get current market data, economic analysis, and real-time recommendations for informed decisions.
                  </CardDescription>
                  <div className="flex gap-2 mt-4">
                    <Badge variant="outline" className="text-xs">Live Data</Badge>
                    <Badge variant="outline" className="text-xs">Market Intel</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* CTA Section */}
            <div className="mt-16 space-y-6">
              <SignInButton mode="modal">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Access Your Financial Co-Pilot
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </SignInButton>
              
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Secure • Private • Exclusive Access</span>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>
      
      <SignedIn>
        <Chat />
      </SignedIn>
    </>
  );
}
