
import "./globals.css";
import { TransactionProvider } from "@/components/TransactionProvider";

export const metadata = {
  title: "Spendly | Personal Finance Tracker",
  description: "Track your income, expenses, and budgets with Spendly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <TransactionProvider>
          {children}
        </TransactionProvider>
      </body>
    </html>
  );
}
