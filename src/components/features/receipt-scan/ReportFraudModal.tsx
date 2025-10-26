import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const formSchema = z.object({
  businessName: z.string().optional(),
  accountNumber: z.string().optional(),
  story: z.string().min(10, 'Please provide at least 10 characters'),
});

interface ReportFraudModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptId: string;
}

export const ReportFraudModal = ({ open, onOpenChange, receiptId }: ReportFraudModalProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: '',
      accountNumber: '',
      story: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // TODO: Implement fraud report submission to backend
      console.log('Fraud report:', { ...values, receiptId });
      
      setIsSubmitted(true);
      toast.success('Thank you for reporting. This helps protect others.');
      
      setTimeout(() => {
        onOpenChange(false);
        setIsSubmitted(false);
        form.reset();
      }, 3000);
    } catch (error) {
      toast.error('Failed to submit report. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {!isSubmitted ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <DialogTitle className="text-xl">Report Fraud</DialogTitle>
              </div>
              <DialogDescription>
                Help us protect the community by sharing details about this suspicious receipt.
                All reports are reviewed by our team.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ABC Electronics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number Used (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 0123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="story"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Story *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe what happened, how you discovered the fraud, and any other relevant details..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Submit Report
                  </Button>
                </div>
              </form>
            </Form>
          </>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-success/10">
                <CheckCircle2 className="h-12 w-12 text-success" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
              <p className="text-muted-foreground">
                Your report helps protect others from fraud. We'll review this immediately.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
