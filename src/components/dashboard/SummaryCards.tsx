
import React from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  DollarSign, 
  Calendar, 
  CreditCard,
  Wallet
} from 'lucide-react';
import CustomCard, { CardContent } from '@/components/ui/CustomCard';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { formatCurrency } from '@/utils/formatters';

interface SummaryCardsProps {
  income: number;
  expenses: number;
  balance: number;
  budget: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  income,
  expenses,
  balance,
  budget
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in">
      {/* Income Card */}
      <CustomCard className="border-l-4 border-l-emerald-500">
        <CardContent className="p-0">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Income</p>
              <div className="flex items-center">
                <AnimatedCounter
                  value={income}
                  formatter={(val) => formatCurrency(val)}
                  className="text-2xl font-bold"
                />
              </div>
              <div className="flex items-center text-emerald-500 text-sm">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span>10.2%</span>
                <span className="text-muted-foreground ml-1">vs last month</span>
              </div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </CustomCard>

      {/* Expenses Card */}
      <CustomCard className="border-l-4 border-l-red-500">
        <CardContent className="p-0">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
              <div className="flex items-center">
                <AnimatedCounter
                  value={expenses}
                  formatter={(val) => formatCurrency(val)}
                  className="text-2xl font-bold"
                />
              </div>
              <div className="flex items-center text-red-500 text-sm">
                <ArrowDownRight className="w-4 h-4 mr-1" />
                <span>12.4%</span>
                <span className="text-muted-foreground ml-1">vs last month</span>
              </div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </CustomCard>

      {/* Balance Card */}
      <CustomCard className="border-l-4 border-l-blue-500">
        <CardContent className="p-0">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
              <div className="flex items-center">
                <AnimatedCounter
                  value={balance}
                  formatter={(val) => formatCurrency(val)}
                  className="text-2xl font-bold"
                />
              </div>
              <div className="flex items-center text-blue-500 text-sm">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span>3.2%</span>
                <span className="text-muted-foreground ml-1">vs last month</span>
              </div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-500">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </CustomCard>

      {/* Budget Card */}
      <CustomCard className="border-l-4 border-l-purple-500">
        <CardContent className="p-0">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Monthly Budget</p>
              <div className="flex items-center">
                <AnimatedCounter
                  value={budget}
                  formatter={(val) => formatCurrency(val)}
                  className="text-2xl font-bold"
                />
              </div>
              <div className="flex items-center text-purple-500 text-sm">
                <span className="text-muted-foreground">Ends in</span>
                <span className="ml-1 font-medium">14 days</span>
              </div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-500">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </CustomCard>
    </div>
  );
};

export default SummaryCards;
