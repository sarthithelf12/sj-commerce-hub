import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Pencil, Trash2, ArrowRight, ExternalLink, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getEnquiries, deleteEnquiry, type Enquiry, type EnquiryStatus } from "@/utils/enquiryStorage";

const statusConfig: Record<EnquiryStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  quoted: { label: "Quoted", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
  converted: { label: "Converted", className: "bg-purple-100 text-purple-800 hover:bg-purple-100" },
  won: { label: "Won", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  lost: { label: "Lost", className: "bg-red-100 text-red-800 hover:bg-red-100" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-600 hover:bg-gray-100" },
};

const Enquiries = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  const allEnquiries = getEnquiries();
  const filtered = allEnquiries.filter(e => {
    const matchesSearch = !search ||
      e.enquiryNo.toLowerCase().includes(search.toLowerCase()) ||
      e.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: allEnquiries.length,
    open: allEnquiries.filter(e => e.status === "open").length,
    won: allEnquiries.filter(e => e.status === "won").length,
    lostCancelled: allEnquiries.filter(e => e.status === "lost" || e.status === "cancelled").length,
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteEnquiry(deleteId);
      toast({ title: "Enquiry deleted" });
      setDeleteId(null);
      setRefresh(r => r + 1);
    }
  };

  const handleConvert = (enq: Enquiry) => {
    if (enq.status === "converted" || enq.linkedQuotationId) {
      toast({ title: "Already converted", description: enq.linkedQuotationDocNumber ? `Linked to ${enq.linkedQuotationDocNumber}` : "Opening linked quotation" });
      if (enq.linkedQuotationId) navigate(`/documents/quotations/edit/${enq.linkedQuotationId}`);
      return;
    }
    navigate(`/documents/quotations/new/from-enquiry/${enq.id}`);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Enquiries</h1>
            <p className="text-muted-foreground text-sm">Track and manage customer enquiries</p>
          </div>
          <Button onClick={() => navigate("/enquiries/new")}>
            <Plus size={16} className="mr-2" /> New Enquiry
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Enquiries", value: stats.total, icon: ClipboardList, color: "text-primary" },
            { label: "Open", value: stats.open, icon: ClipboardList, color: "text-blue-600" },
            { label: "Won", value: stats.won, icon: ClipboardList, color: "text-green-600" },
            { label: "Lost / Cancelled", value: stats.lostCancelled, icon: ClipboardList, color: "text-red-600" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon size={24} className={s.color} />
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search by enquiry no or customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="quoted">Quoted</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardList size={48} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No enquiries found</p>
                <p className="text-sm">Create your first enquiry to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Enquiry No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(enq => (
                    <TableRow key={enq.id}>
                      <TableCell className="font-medium">{enq.enquiryNo}</TableCell>
                      <TableCell>{new Date(enq.date).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell>{enq.customerName}</TableCell>
                      <TableCell>{enq.items.length} item{enq.items.length !== 1 ? "s" : ""}</TableCell>
                      <TableCell>
                        <Badge className={statusConfig[enq.status].className}>
                          {statusConfig[enq.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/enquiries/edit/${enq.id}`)}>
                          <Pencil size={14} />
                        </Button>
                        {enq.status === "converted" ? (
                          <Button variant="ghost" size="sm" title="View Quotation" onClick={() => handleConvert(enq)}>
                            <ExternalLink size={14} />
                          </Button>
                        ) : (enq.status === "open" || enq.status === "quoted") && (
                          <Button variant="ghost" size="sm" title="Convert to Quotation" onClick={() => handleConvert(enq)}>
                            <ArrowRight size={14} />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(enq.id)}>
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Enquiry?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Enquiries;
