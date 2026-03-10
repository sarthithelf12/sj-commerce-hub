import { useRef, useState } from "react";
import { usePDF } from "react-to-pdf";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Download, X, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PDFDownloadWrapperProps {
  filename: string;
  documentTitle: string;
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
}

export const PDFDownloadWrapper = ({ filename, documentTitle, children, open, onClose }: PDFDownloadWrapperProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toPDF, targetRef } = usePDF({
    filename: `${filename}.pdf`,
    page: {
      format: "A4",
      orientation: "portrait",
      margin: 10,
    },
    canvas: {
      qualityRatio: 1,
    },
  });

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await toPDF();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Preview: {documentTitle}</DialogTitle>
          <DialogDescription>Review your document before downloading as PDF</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 max-h-[70vh]">
          <div ref={targetRef} className="bg-white text-black p-8 mx-auto" style={{ width: "210mm", minHeight: "297mm" }}>
            {children}
          </div>
        </ScrollArea>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            <X size={16} /> Close
          </Button>
          <Button onClick={handleDownload} disabled={isGenerating}>
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isGenerating ? "Generating..." : "Download PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
