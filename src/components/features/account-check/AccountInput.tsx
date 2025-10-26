import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

interface AccountInputProps {
  onSubmit: (accountNumber: string, bankCode?: string, businessName?: string) => void;
  isLoading: boolean;
}

const NIGERIAN_BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "063", name: "Access Bank (Diamond)" },
  { code: "023", name: "Citibank Nigeria" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "084", name: "Enterprise Bank" },
  { code: "070", name: "Fidelity Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "214", name: "First City Monument Bank" },
  { code: "058", name: "Guaranty Trust Bank" },
  { code: "030", name: "Heritage Bank" },
  { code: "301", name: "Jaiz Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "526", name: "Parallex Bank" },
  { code: "076", name: "Polaris Bank" },
  { code: "101", name: "Providus Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "068", name: "Standard Chartered Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "100", name: "Suntrust Bank" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "033", name: "United Bank For Africa" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
];

export const AccountInput = ({ onSubmit, isLoading }: AccountInputProps) => {
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAccountNumber = (value: string): boolean => {
    if (!value) {
      setErrors((prev) => ({ ...prev, accountNumber: "Account number is required" }));
      return false;
    }
    if (!/^\d{10}$/.test(value)) {
      setErrors((prev) => ({ ...prev, accountNumber: "Must be exactly 10 digits" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, accountNumber: "" }));
    return true;
  };

  const handleAccountNumberChange = (value: string) => {
    // Only allow digits and limit to 10 characters
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    setAccountNumber(cleaned);
    
    if (cleaned.length === 10) {
      validateAccountNumber(cleaned);
    } else {
      setErrors((prev) => ({ ...prev, accountNumber: "" }));
    }
  };

  const handleSubmit = () => {
    if (!validateAccountNumber(accountNumber)) {
      return;
    }

    onSubmit(accountNumber, bankCode || undefined, businessName || undefined);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && accountNumber.length === 10) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Number Input */}
      <div className="space-y-2">
        <Label htmlFor="accountNumber" className="text-base font-semibold">
          Account Number *
        </Label>
        <Input
          id="accountNumber"
          type="text"
          inputMode="numeric"
          placeholder="Enter 10-digit account number"
          value={accountNumber}
          onChange={(e) => handleAccountNumberChange(e.target.value)}
          onKeyPress={handleKeyPress}
          maxLength={10}
          className={`text-lg h-14 ${errors.accountNumber ? "border-destructive" : ""}`}
          disabled={isLoading}
        />
        {errors.accountNumber && (
          <p className="text-sm text-destructive">{errors.accountNumber}</p>
        )}
        {accountNumber.length > 0 && accountNumber.length < 10 && (
          <p className="text-sm text-muted-foreground">
            {10 - accountNumber.length} digits remaining
          </p>
        )}
      </div>

      {/* Bank Selection */}
      <div className="space-y-2">
        <Label htmlFor="bankCode" className="text-base font-semibold">
          Bank (Optional)
        </Label>
        <Select value={bankCode} onValueChange={setBankCode} disabled={isLoading}>
          <SelectTrigger className="h-14 text-base">
            <SelectValue placeholder="Select bank for better accuracy" />
          </SelectTrigger>
          <SelectContent>
            {NIGERIAN_BANKS.map((bank) => (
              <SelectItem key={bank.code} value={bank.code}>
                {bank.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Selecting the bank improves verification accuracy
        </p>
      </div>

      {/* Business Name (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="businessName" className="text-base font-semibold">
          Expected Business Name (Optional)
        </Label>
        <Input
          id="businessName"
          type="text"
          placeholder="e.g., ABC Trading Ltd"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="h-12"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          If you're expecting to pay a specific business, enter their name here
        </p>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading || accountNumber.length !== 10}
        size="lg"
        className="w-full h-14 text-lg font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Checking Account...
          </>
        ) : (
          <>
            <Search className="mr-2 h-5 w-5" />
            Check Account Trust Score
          </>
        )}
      </Button>

      {/* Privacy Notice */}
      <div className="p-4 rounded-lg bg-muted/50 border">
        <p className="text-xs text-muted-foreground">
          🔒 <strong>Privacy Protected:</strong> Account numbers are hashed before storage. 
          We never store plain-text account information.
        </p>
      </div>
    </div>
  );
};
