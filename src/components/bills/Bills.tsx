
import React, { useState } from 'react';
import { useBills, useMarkBillPaid, useDeleteBill } from '@/hooks/useBillsQueries';
import BillForm from './BillForm';
import BillCard from './BillCard';
import CustomCard, { CardContent } from '@/components/ui/CustomCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, ReceiptText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Bills: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: bills = [], isLoading, refetch } = useBills(
    activeTab !== 'all' ? { status: activeTab } : undefined
  );
  
  const markBillPaidMutation = useMarkBillPaid();
  const deleteBillMutation = useDeleteBill();

  const handleAddNew = () => {
    setEditingBill(null);
    setShowForm(true);
  };

  const handleEditBill = (bill: any) => {
    setEditingBill(bill);
    setShowForm(true);
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await markBillPaidMutation.mutateAsync(id);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark bill as paid",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBill = async (id: string) => {
    try {
      await deleteBillMutation.mutateAsync(id);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete bill",
        variant: "destructive"
      });
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    refetch();
    toast({
      title: editingBill ? "Bill updated" : "Bill created",
      description: editingBill 
        ? "The bill has been updated successfully." 
        : "Your bill has been created successfully."
    });
  };

  // Filter bills into categories for counting
  const pendingBills = bills.filter(bill => bill.status === 'pending');
  const paidBills = bills.filter(bill => bill.status === 'paid');
  const overdueBills = bills.filter(bill => 
    bill.status === 'overdue' || (bill.status === 'pending' && new Date(bill.due_date) < new Date())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bill Payment Tracking</h2>
        {!showForm ? (
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Bill
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setShowForm(false)}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        )}
      </div>

      {showForm ? (
        <BillForm
          bill={editingBill}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All ({bills.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingBills.length})
              </TabsTrigger>
              <TabsTrigger value="paid">
                Paid ({paidBills.length})
              </TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue ({overdueBills.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <BillsList 
                bills={bills}
                isLoading={isLoading}
                onMarkPaid={handleMarkPaid}
                onEdit={handleEditBill}
                onDelete={handleDeleteBill}
                onAddNew={handleAddNew}
              />
            </TabsContent>
            
            <TabsContent value="pending" className="mt-4">
              <BillsList 
                bills={pendingBills}
                isLoading={isLoading}
                onMarkPaid={handleMarkPaid}
                onEdit={handleEditBill}
                onDelete={handleDeleteBill}
                onAddNew={handleAddNew}
              />
            </TabsContent>
            
            <TabsContent value="paid" className="mt-4">
              <BillsList 
                bills={paidBills}
                isLoading={isLoading}
                onMarkPaid={handleMarkPaid}
                onEdit={handleEditBill}
                onDelete={handleDeleteBill}
                onAddNew={handleAddNew}
              />
            </TabsContent>
            
            <TabsContent value="overdue" className="mt-4">
              <BillsList 
                bills={overdueBills}
                isLoading={isLoading}
                onMarkPaid={handleMarkPaid}
                onEdit={handleEditBill}
                onDelete={handleDeleteBill}
                onAddNew={handleAddNew}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

interface BillsListProps {
  bills: any[];
  isLoading: boolean;
  onMarkPaid: (id: string) => void;
  onEdit: (bill: any) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

const BillsList: React.FC<BillsListProps> = ({
  bills,
  isLoading,
  onMarkPaid,
  onEdit,
  onDelete,
  onAddNew
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <CustomCard>
        <CardContent className="p-6 text-center">
          <ReceiptText className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No bills found</h3>
          <p className="text-muted-foreground mb-4">
            You haven't added any bills in this category yet.
          </p>
          <Button onClick={onAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Bill
          </Button>
        </CardContent>
      </CustomCard>
    );
  }

  return (
    <div className="space-y-4">
      {bills.map((bill: any) => (
        <BillCard
          key={bill.id}
          bill={bill}
          onMarkPaid={onMarkPaid}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default Bills;
