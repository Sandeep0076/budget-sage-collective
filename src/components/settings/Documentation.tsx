import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Documentation: React.FC = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="features">
        <TabsList className="mb-4">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="features" className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="dashboard">
              <AccordionTrigger className="text-lg font-medium">Dashboard</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2 pb-4">
                <p>The Dashboard provides an overview of your financial status at a glance.</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Income:</strong> Shows your total monthly income from all sources.</li>
                  <li><strong>Expenses:</strong> Displays your total monthly expenses across all categories.</li>
                  <li><strong>Balance:</strong> Calculates the difference between your income and expenses.</li>
                  <li><strong>Budget:</strong> Shows your remaining budget for the current month.</li>
                  <li><strong>Income vs Expenses Chart:</strong> Visualizes your income and expenses over time.</li>
                  <li><strong>Spending by Category:</strong> Shows how your expenses are distributed across different categories.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="transactions">
              <AccordionTrigger className="text-lg font-medium">Transactions</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2 pb-4">
                <p>The Transactions page allows you to track all your financial transactions.</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Add Transaction:</strong> Record new income or expense transactions.</li>
                  <li><strong>Edit Transaction:</strong> Modify details of existing transactions.</li>
                  <li><strong>Delete Transaction:</strong> Remove transactions you no longer want to track.</li>
                  <li><strong>Filter Transactions:</strong> View transactions by type (income/expense), date range, or category.</li>
                  <li><strong>Search Transactions:</strong> Find specific transactions by description or amount.</li>
                  <li><strong>Categories:</strong> Organize transactions by customizable categories.</li>
                  <li><strong>Recurring Transactions:</strong> Set up transactions that repeat on a regular schedule.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="budgets">
              <AccordionTrigger className="text-lg font-medium">Budgets</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2 pb-4">
                <p>The Budgets page helps you plan and manage your spending limits.</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Create Budget:</strong> Set spending limits for different categories.</li>
                  <li><strong>Edit Budget:</strong> Adjust your budget allocations as needed.</li>
                  <li><strong>Delete Budget:</strong> Remove budget categories you no longer need.</li>
                  <li><strong>Budget Progress:</strong> Track how much of your budget you've used.</li>
                  <li><strong>Budget Alerts:</strong> Get notifications when you're approaching or exceeding your budget.</li>
                  <li><strong>Monthly Reset:</strong> Budgets automatically reset at the beginning of each month.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="bills">
              <AccordionTrigger className="text-lg font-medium">Bills</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2 pb-4">
                <p>The Bills page helps you track and manage your recurring bills and payments.</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Add Bill:</strong> Create a new bill with name, amount, due date, and recurrence.</li>
                  <li><strong>Edit Bill:</strong> Update details of existing bills.</li>
                  <li><strong>Delete Bill:</strong> Remove bills you no longer need to track.</li>
                  <li><strong>Mark as Paid:</strong> Update the status of a bill to indicate it has been paid.</li>
                  <li><strong>Bill Status:</strong> Track bills as pending, paid, or overdue.</li>
                  <li><strong>Recurring Bills:</strong> Set up bills that repeat on a regular schedule (monthly, weekly, etc.).</li>
                  <li><strong>Due Date Tracking:</strong> Keep track of when your bills are due to avoid late payments.</li>
                  <li><strong>Filter Bills:</strong> View bills by status (all, pending, paid, overdue).</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="reports">
              <AccordionTrigger className="text-lg font-medium">Reports</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2 pb-4">
                <p>The Reports page provides detailed insights into your financial patterns.</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Income Analysis:</strong> View your income sources and trends over time.</li>
                  <li><strong>Expense Analysis:</strong> Analyze your spending patterns by category and time period.</li>
                  <li><strong>Savings Rate:</strong> Track how much of your income you're saving.</li>
                  <li><strong>Budget Performance:</strong> See how well you're sticking to your budgets.</li>
                  <li><strong>Monthly Comparison:</strong> Compare your finances across different months.</li>
                  <li><strong>Custom Date Range:</strong> Generate reports for specific time periods.</li>
                  <li><strong>Export Reports:</strong> Download reports for your records or financial planning.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="settings">
              <AccordionTrigger className="text-lg font-medium">Settings</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2 pb-4">
                <p>The Settings page allows you to customize your experience and manage your account.</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Account Settings:</strong> Update your personal information.</li>
                  <li><strong>Preferences:</strong> Set your default currency and other preferences.</li>
                  <li><strong>Recurring Transactions:</strong> Manage transactions that repeat on a schedule.</li>
                  <li><strong>Documentation:</strong> Access help and information about app features.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
        
        <TabsContent value="faq" className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq-1">
              <AccordionTrigger>How do I add a new transaction?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>To add a new transaction:</p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Navigate to the Transactions page</li>
                  <li>Click the "Add Transaction" button</li>
                  <li>Fill in the transaction details (amount, type, category, date, description)</li>
                  <li>Click "Save" to record the transaction</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-2">
              <AccordionTrigger>How do I set up a budget?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>To create a new budget:</p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Go to the Budgets page</li>
                  <li>Click "Add Budget"</li>
                  <li>Select a category for your budget</li>
                  <li>Enter the budget amount</li>
                  <li>Click "Save" to create the budget</li>
                </ol>
                <p>Your budget will reset at the beginning of each month, and you'll see progress bars showing how much of each budget you've used.</p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-3">
              <AccordionTrigger>How do I track my bills?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>To track your bills:</p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Navigate to the Bills page</li>
                  <li>Click "Add Bill"</li>
                  <li>Enter the bill details (name, amount, due date, recurrence)</li>
                  <li>Click "Save" to add the bill</li>
                </ol>
                <p>Once added, you can mark bills as paid when you pay them, and the app will track which bills are pending, paid, or overdue.</p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-4">
              <AccordionTrigger>Can I use the app offline?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>Yes! Budget Sage is a Progressive Web App (PWA), which means you can install it on your device and use some features offline. When you're offline, you can view previously loaded data, but you won't be able to add new transactions or sync with the server until you're back online.</p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-5">
              <AccordionTrigger>How do I set up recurring transactions?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>To set up a recurring transaction:</p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Go to Settings</li>
                  <li>Select the "Recurring Transactions" tab</li>
                  <li>Click "Add Recurring Transaction"</li>
                  <li>Fill in the transaction details</li>
                  <li>Set the recurrence pattern (daily, weekly, monthly, etc.)</li>
                  <li>Click "Save"</li>
                </ol>
                <p>The app will automatically create these transactions according to your specified schedule.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
        
        <TabsContent value="shortcuts" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Add new transaction</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + N</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Search</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + F</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Go to Dashboard</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">G + D</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Go to Transactions</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">G + T</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Go to Budgets</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">G + B</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Go to Bills</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">G + I</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Go to Reports</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">G + R</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Go to Settings</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">G + S</kbd>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documentation;
