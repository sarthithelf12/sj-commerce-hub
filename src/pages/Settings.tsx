import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMPANY_INFO } from "@/config/companyInfo";
import { Building2, Phone, Mail, MapPin, CreditCard, Landmark } from "lucide-react";

const Settings = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your business settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Business Identity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Building2 size={18} />
                Business Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-semibold text-lg text-primary">{COMPANY_INFO.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">GSTIN</p>
                  <p className="font-medium">{COMPANY_INFO.gstin}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">PAN</p>
                  <p className="font-medium">{COMPANY_INFO.pan}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">State</p>
                <p className="font-medium">{COMPANY_INFO.state}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Phone size={18} />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin size={12} /> Address
                </p>
                <p className="font-medium">{COMPANY_INFO.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone size={12} /> Phone
                  </p>
                  <p className="font-medium">{COMPANY_INFO.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail size={12} /> Email
                  </p>
                  <p className="font-medium">{COMPANY_INFO.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bank Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Landmark size={18} />
              Bank Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Bank Name</p>
                <p className="font-medium">{COMPANY_INFO.bankName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account Name</p>
                <p className="font-medium">{COMPANY_INFO.accountName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account Number</p>
                <p className="font-medium">{COMPANY_INFO.accountNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">IFSC Code</p>
                <p className="font-medium">{COMPANY_INFO.ifsc}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Branch</p>
                <p className="font-medium">{COMPANY_INFO.branch}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">💡 Coming Soon</p>
          <p>Edit company details functionality will be available in a future update with database persistence.</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
