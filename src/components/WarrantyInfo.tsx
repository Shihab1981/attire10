import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShieldCheck } from "lucide-react";

const rows: [string, string][] = [
  ["Official Warranty", "1 year brand / seller warranty on all devices"],
  ["Replacement", "7-day replacement if the unit is DOA or faulty"],
  ["Authenticity", "100% genuine, sealed-box products only"],
  ["Support", "Setup & after-sales help over WhatsApp"],
];

const WarrantyInfo = () => (
  <Dialog>
    <DialogTrigger asChild>
      <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
        <ShieldCheck size={14} />
        Warranty Info
      </button>
    </DialogTrigger>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="font-display">Warranty &amp; Support</DialogTitle>
      </DialogHeader>
      <ul className="space-y-4">
        {rows.map(([title, desc]) => (
          <li key={title} className="flex gap-3">
            <ShieldCheck size={16} className="text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-display font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground font-body leading-relaxed">{desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </DialogContent>
  </Dialog>
);

export default WarrantyInfo;
