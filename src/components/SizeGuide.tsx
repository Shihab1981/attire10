import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Ruler } from "lucide-react";

const SizeGuide = () => (
  <Dialog>
    <DialogTrigger asChild>
      <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
        <Ruler size={14} />
        Size Guide
      </button>
    </DialogTrigger>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="font-display">Size Guide</DialogTitle>
      </DialogHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 font-display font-semibold">Size</th>
              <th className="text-center py-2 font-display font-semibold">Chest (in)</th>
              <th className="text-center py-2 font-display font-semibold">Length (in)</th>
              <th className="text-center py-2 font-display font-semibold">Shoulder (in)</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {[
              ["S", "36-38", "27", "16.5"],
              ["M", "38-40", "28", "17"],
              ["L", "40-42", "29", "17.5"],
              ["XL", "42-44", "30", "18"],
              ["XXL", "44-46", "31", "18.5"],
            ].map(([size, chest, length, shoulder]) => (
              <tr key={size} className="border-b border-border/50">
                <td className="py-2 font-medium text-foreground">{size}</td>
                <td className="py-2 text-center">{chest}</td>
                <td className="py-2 text-center">{length}</td>
                <td className="py-2 text-center">{shoulder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DialogContent>
  </Dialog>
);

export default SizeGuide;
