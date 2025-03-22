
import React from 'react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import CustomCard, { CardContent } from '@/components/ui/CustomCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReceiptText, Calendar, Edit, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';

interface BillCardProps {
  bill: any;
  onMarkPaid: (id: string) => void;
  onEdit: (bill: any) => void;
  onDelete: (id: string) => void;
}

const BillCard: React.FC<BillCardProps> = ({
  bill,
  onMarkPaid,
  onEdit,
  onDelete
}) => {
  // Calculate if bill is overdue
  const isDueToday = new Date(bill.due_date).toDateString() === new Date().toDateString();
  const isPastDue = new Date(bill.due_date) < new Date() && bill.status === 'pending';
  
  // Get status color
  const getStatusColor = () => {
    switch (bill.status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return isPastDue 
          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  return (
    <CustomCard className="w-full mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <div className="p-2 rounded-full bg-primary/10">
              <ReceiptText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{bill.name}</h3>
              <div className="flex flex-col space-y-1 mt-1">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">
                    Due: {formatDate(bill.due_date)}
                    {isDueToday && <span className="ml-2 text-amber-500 font-medium">Due today</span>}
                    {isPastDue && <span className="ml-2 text-red-500 font-medium">Past due</span>}
                  </span>
                </div>
                {bill.recurring && (
                  <div className="flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      Recurring: {bill.frequency.charAt(0).toUpperCase() + bill.frequency.slice(1)}
                    </span>
                  </div>
                )}
                {bill.categories && (
                  <Badge 
                    className="w-fit mt-1"
                    style={{ backgroundColor: bill.categories.color }}
                  >
                    {bill.categories.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-lg font-semibold">{formatCurrency(bill.amount)}</span>
            <Badge variant="outline" className={`mt-1 ${getStatusColor()}`}>
              {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
            </Badge>
            <div className="flex space-x-2 mt-3">
              {bill.status !== 'paid' && (
                <Button variant="outline" size="sm" className="text-green-600" onClick={() => onMarkPaid(bill.id)}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Paid
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => onEdit(bill)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(bill.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        {bill.notes && (
          <div className="mt-3 pt-3 border-t border-border text-sm text-muted-foreground">
            {bill.notes}
          </div>
        )}
      </CardContent>
    </CustomCard>
  );
};

export default BillCard;
