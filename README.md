
# Budget Sage: Personal Finance Tracker

## Overview
Budget Sage is a comprehensive personal finance tracker that helps users manage their finances, track expenses, visualize spending patterns, and set budgets. The application provides an intuitive interface for monitoring financial health and making informed decisions about spending and saving.

## Features
- **Dashboard**: Get a quick overview of your financial health with summary cards and visualizations
- **Transaction Management**: Add, edit, and categorize expenses and income
- **Budget Tracking**: Set category-based budgets and monitor your spending against them
- **Visualization**: View your spending patterns through interactive charts and graphs
- **Settings**: Customize your experience with personal preferences

## Technology Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **State Management**: React hooks for local state
- **Data Visualization**: Recharts for interactive charts
- **Backend**: Supabase for authentication, database, and storage
- **Deployment**: Vite for development and building

## Project Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd budget-sage

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Project Structure
- `src/`: Source code
  - `components/`: Reusable UI components
    - `dashboard/`: Dashboard-related components
    - `transactions/`: Transaction-related components
    - `budgets/`: Budget-related components
    - `layout/`: Layout components
    - `ui/`: UI components (buttons, cards, etc.)
  - `pages/`: Main application pages
  - `utils/`: Utility functions
  - `integrations/`: Integration with external services (Supabase)

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.
