import { useState } from "react";
import { Upload, FileSpreadsheet, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const banks = [
  { id: "hdfc", name: "HDFC Bank" },
  { id: "icici", name: "ICICI Bank" },
  { id: "sbi", name: "State Bank of India" },
  { id: "axis", name: "Axis Bank" },
  { id: "kotak", name: "Kotak Mahindra Bank" },
  { id: "yes", name: "Yes Bank" },
  { id: "idfc", name: "IDFC First Bank" },
  { id: "other", name: "Other" },
];

export const BankStatementUpload = () => {
  const [open, setOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const validTypes = [
        "application/pdf",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
      ];
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload PDF, Excel, or CSV file",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!selectedBank || !file) {
      toast({
        title: "Missing information",
        description: "Please select a bank and upload a file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    // Simulate upload and parsing
    setTimeout(() => {
      setIsUploading(false);
      setIsSuccess(true);
      toast({
        title: "Statement uploaded successfully",
        description: "45 transactions have been extracted and are ready for matching",
      });
      
      // Reset after showing success
      setTimeout(() => {
        setOpen(false);
        setIsSuccess(false);
        setFile(null);
        setSelectedBank("");
      }, 2000);
    }, 2000);
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload size={16} />
          Upload Statement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Bank Statement</DialogTitle>
          <DialogDescription>
            Upload your bank statement (PDF, Excel, or CSV) to extract transactions
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <CheckCircle className="text-accent" size={32} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Upload Complete!</p>
              <p className="text-sm text-muted-foreground">
                45 transactions extracted
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Bank Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Select Bank
              </label>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Statement File
              </label>
              {file ? (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                  <FileSpreadsheet className="text-primary" size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleRemoveFile}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.xlsx,.xls,.csv"
                    className="hidden"
                    id="statement-upload"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="statement-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="text-muted-foreground" size={24} />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, Excel, or CSV (max 10MB)
                    </p>
                  </label>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <Button
              className="w-full"
              onClick={handleUpload}
              disabled={!selectedBank || !file || isUploading}
            >
              {isUploading ? "Processing..." : "Upload & Extract Transactions"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
