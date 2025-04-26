/**
 * EnhancedSpendingReport Component
 * 
 * Displays an interactive spending summary report with customizable time periods
 * and chart visualizations, matching the application's blue theme.
 */

import React, { useState, useMemo } from 'react';
import { Box, Typography, Paper, Select, MenuItem, FormControl, InputLabel, CircularProgress, SelectChangeEvent, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTransactions } from '@/hooks/useSupabaseQueries'; 
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO, getWeek, getYear, getMonth, subMonths } from 'date-fns';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import type { Tables } from '@/integrations/supabase/types'; 

// Define the Transaction type based on the Supabase auto-generated types
type Transaction = Tables<'transactions'>;

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface AggregatedData {
    name: string; // Period label (e.g., '2023-01-01', 'Week 1, 2023', 'Jan 2023', '2023')
    income: number;
    expense: number;
    // Store original date for sorting
    originalDate: Date;
}

const EnhancedSpendingReport: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<Period>('monthly');
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({ 
        from: subMonths(new Date(), 6), // Default to last 6 months
        to: new Date(),
    });
    
    // Use the user-selected date range
    const endDate = endOfDay(dateRange.to);
    const startDate = startOfDay(dateRange.from);

    const { data: transactions, isLoading, error } = useTransactions({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
    });

    const handlePeriodChange = (event: SelectChangeEvent<Period>) => {
        setSelectedPeriod(event.target.value as Period);
    };

    // --- Data Aggregation Logic ---
    const aggregatedData = useMemo(() => {
        if (!transactions) return [];

        const dataMap = new Map<string, { income: number; expense: number; originalDate: Date }>();

        const getPeriodData = (date: Date): { key: string; sortDate: Date } | null => {
            try {
                switch (selectedPeriod) {
                    case 'daily':
                        const dayStart = startOfDay(date);
                        return { key: format(dayStart, 'yyyy-MM-dd'), sortDate: dayStart };
                    case 'weekly':
                        const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
                        // Ensure week number and year are correctly associated
                        const weekYear = getYear(weekStart);
                        const weekNum = getWeek(weekStart, { weekStartsOn: 1 });
                        return { key: `W${weekNum}, ${weekYear}`, sortDate: weekStart };
                    case 'monthly':
                        const monthStart = startOfMonth(date);
                        return { key: format(monthStart, 'MMM yyyy'), sortDate: monthStart };
                    case 'yearly':
                        const yearStart = startOfYear(date);
                        return { key: format(yearStart, 'yyyy'), sortDate: yearStart };
                    default:
                        return null;
                }
            } catch (e) {
                console.error("Error generating period key for date:", date, e);
                return null;
            }
        };

        transactions.forEach((t: Transaction) => {
            if (!t.transaction_date) return; // Skip transactions without a date
            const date = parseISO(t.transaction_date);
            const periodInfo = getPeriodData(date);
            if (!periodInfo) return;

            const { key, sortDate } = periodInfo;

            const current = dataMap.get(key) || { income: 0, expense: 0, originalDate: sortDate };
            // Use transaction_type to determine income/expense
            // Assuming 'income' is explicitly stored, otherwise adapt this logic
            if (t.transaction_type === 'income') { 
                current.income += t.amount;
            } else { // Assuming other types are expenses
                current.expense += t.amount;
            }
            // Ensure we keep the earliest date for sorting purposes if multiple transactions fall in the same period
            if (sortDate < current.originalDate) {
                current.originalDate = sortDate;
            }
            dataMap.set(key, current);
        });

        // Convert map to array and sort chronologically
        const sortedData: AggregatedData[] = Array.from(dataMap.entries())
            .map(([name, values]) => ({ name, ...values }))
            .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());

        return sortedData;
    }, [transactions, selectedPeriod]);

    // --- Render Logic ---
    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
    if (error) return <Typography color="error" sx={{ p: 3 }}>Error loading data: {error.message}</Typography>;

    return (
        <>
        <Paper sx={{ p: 3, mb: 6, backgroundColor: '#0091FF', borderRadius: '16px', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                <Typography variant="h6" component="h2" sx={{ color: 'white', fontWeight: 'bold', mb: { xs: 2, md: 0 } }}>Total Spending Breakdown</Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {/* Date Range Picker */}
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DatePicker
                                label="From"
                                value={dateRange.from}
                                onChange={(newValue) => {
                                    if (newValue) setDateRange(prev => ({ ...prev, from: newValue }));
                                }}
                                slotProps={{ 
                                    textField: { 
                                        size: 'small', 
                                        sx: { 
                                            backgroundColor: 'rgba(25, 118, 210, 0.1)', 
                                            color: 'white',
                                            borderRadius: '4px',
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: 'white',
                                            },
                                            '& .MuiInputBase-input': {
                                                color: 'white',
                                            },
                                            '& .MuiIconButton-root': {
                                                color: 'white',
                                            },
                                            '& .MuiSvgIcon-root': {
                                                color: 'white',
                                            }
                                        } 
                                    },
                                    layout: {
                                        sx: {
                                            backgroundColor: '#0091FF',
                                            color: 'white',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            '& .MuiPickersDay-root': {
                                                color: 'white',
                                            },
                                            '& .MuiDayCalendar-header': {
                                                color: 'white',
                                            },
                                            '& .MuiDayCalendar-weekContainer': {
                                                color: 'white',
                                            },
                                            '& .MuiPickersCalendarHeader-label': {
                                                color: 'white',
                                            },
                                            '& .MuiPickersCalendarHeader-switchViewButton': {
                                                color: 'white',
                                            },
                                            '& .MuiPickersArrowSwitcher-button': {
                                                color: 'white',
                                            },
                                            '& .MuiPickersDay-root.Mui-selected': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                            },
                                            '& .MuiPickersDay-root:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            },
                                            '& .MuiPickersDay-today': {
                                                border: '1px solid white',
                                            }
                                        }
                                    }
                                }}
                            />
                            <Typography sx={{ mx: 1, color: 'white' }}>to</Typography>
                            <DatePicker
                                label="To"
                                value={dateRange.to}
                                onChange={(newValue) => {
                                    if (newValue) setDateRange(prev => ({ ...prev, to: newValue }));
                                }}
                                slotProps={{ 
                                    textField: { 
                                        size: 'small', 
                                        sx: { 
                                            backgroundColor: 'rgba(25, 118, 210, 0.1)', 
                                            color: 'white',
                                            borderRadius: '4px',
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: 'white',
                                            },
                                            '& .MuiInputBase-input': {
                                                color: 'white',
                                            },
                                            '& .MuiIconButton-root': {
                                                color: 'white',
                                            },
                                            '& .MuiSvgIcon-root': {
                                                color: 'white',
                                            }
                                        } 
                                    },
                                    layout: {
                                        sx: {
                                            backgroundColor: '#0091FF',
                                            color: 'white',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            '& .MuiPickersDay-root': {
                                                color: 'white',
                                            },
                                            '& .MuiDayCalendar-header': {
                                                color: 'white',
                                            },
                                            '& .MuiDayCalendar-weekContainer': {
                                                color: 'white',
                                            },
                                            '& .MuiPickersCalendarHeader-label': {
                                                color: 'white',
                                            },
                                            '& .MuiPickersCalendarHeader-switchViewButton': {
                                                color: 'white',
                                            },
                                            '& .MuiPickersArrowSwitcher-button': {
                                                color: 'white',
                                            },
                                            '& .MuiPickersDay-root.Mui-selected': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                            },
                                            '& .MuiPickersDay-root:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            },
                                            '& .MuiPickersDay-today': {
                                                border: '1px solid white',
                                            }
                                        }
                                    }
                                }}
                            />
                        </Box>
                    </LocalizationProvider>
                    
                    {/* Period Selector */}
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel id="period-select-label" sx={{ color: 'white' }}>Period</InputLabel>
                        <Select
                            labelId="period-select-label"
                            id="period-select"
                            value={selectedPeriod}
                            label="Period"
                            onChange={handlePeriodChange}
                            sx={{ 
                                backgroundColor: 'rgba(25, 118, 210, 0.1)', 
                                color: 'white',
                                borderRadius: '4px',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                    },
                                },
                                '& .MuiSelect-select': {
                                    color: 'white',
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'white !important',
                                },
                                '& .MuiSvgIcon-root': {
                                    color: 'white',
                                }
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        backgroundColor: '#0091FF',
                                        '& .MuiMenuItem-root': {
                                            color: 'white',
                                        },
                                        '& .MuiMenuItem-root.Mui-selected': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        },
                                        '& .MuiMenuItem-root:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        }
                                    }
                                }
                            }}
                        >
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                            <MenuItem value="yearly">Yearly</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, color: 'white' }}>
                Total Spending ({selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}) - {format(dateRange.from, 'MMM d, yyyy')} to {format(dateRange.to, 'MMM d, yyyy')}
            </Typography>

             {aggregatedData.length === 0 && !isLoading ? (
                 <Typography sx={{ textAlign: 'center', mt: 4, color: 'white' }}>
                     No transaction data available for the selected period.
                 </Typography>
             ) : (
                <Box sx={{ height: 400, backgroundColor: 'rgba(255, 255, 255, 0.1)', p: 2, borderRadius: '8px', mb: 3 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={aggregatedData}
                            margin={{
                                top: 5, right: 30, left: 20, bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.3)" />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: 'white', fontSize: 12 }}
                                // Add angle since we might have many periods
                                angle={-30}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis 
                                tick={{ fill: 'white', fontSize: 12 }} 
                                tickFormatter={(value) => `€${value}`} 
                                stroke="white" 
                            />
                            <Tooltip
                                formatter={(value: number, name: string) => [`€${value.toFixed(2)}`, name]}
                                labelFormatter={(label: string) => `Period: ${label}`}
                                contentStyle={{ 
                                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    borderRadius: '4px',
                                    color: 'white'
                                }}
                                itemStyle={{ color: 'white' }}
                                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                            />
                            <Legend wrapperStyle={{ color: 'white' }} />
                            <Bar dataKey="expense" fill="#F44336" name="Total Spending" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            )}
        </Paper>
        </>
    );
};

export default EnhancedSpendingReport;
