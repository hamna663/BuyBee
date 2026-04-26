"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Address = {
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
};

type CheckoutAddressDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: Address;
  onAddressChange: (address: Address) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
};

export function CheckoutAddressDialog({
  open,
  onOpenChange,
  address,
  onAddressChange,
  onSubmit,
  loading = false,
}: CheckoutAddressDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg glassmorphism dark:glassmorphism-dark border border-white/15 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-gradient">
            Shipping Address
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="street" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">
              Street Address
            </Label>
            <Input
              id="street"
              required
              placeholder="123 Commerce St"
              className="h-11 bg-white/45 dark:bg-black/20 border-white/10"
              value={address.street}
              onChange={(e) => onAddressChange({ ...address, street: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">
                City
              </Label>
              <Input
                id="city"
                required
                placeholder="New York"
                className="h-11 bg-white/45 dark:bg-black/20 border-white/10"
                value={address.city}
                onChange={(e) => onAddressChange({ ...address, city: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">
                State
              </Label>
              <Input
                id="state"
                required
                placeholder="NY"
                className="h-11 bg-white/45 dark:bg-black/20 border-white/10"
                value={address.state}
                onChange={(e) => onAddressChange({ ...address, state: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="country" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">
                Country
              </Label>
              <Input
                id="country"
                required
                placeholder="USA"
                className="h-11 bg-white/45 dark:bg-black/20 border-white/10"
                value={address.country}
                onChange={(e) => onAddressChange({ ...address, country: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zipcode" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">
                Zip Code
              </Label>
              <Input
                id="zipcode"
                required
                placeholder="10001"
                className="h-11 bg-white/45 dark:bg-black/20 border-white/10"
                value={address.zipcode}
                onChange={(e) => onAddressChange({ ...address, zipcode: e.target.value })}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 font-black text-sm uppercase tracking-widest shadow-md shadow-primary/20"
          >
            {loading ? "Processing..." : "Continue to Payment"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Secure payment powered by Stripe
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
