import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The AI SRE on Call: How Traversal Solves the Toughest Incidents',
  description: 'When your system breaks, it can feel like a fire drill with dozens of engineers, dashboards open, and nothing but chaos. Enter Traversal—the AI Site Reliability Engineer (SRE) agent that works 24/7 to troubleshoot, fix, and even prevent incidents. By traversing petabytes of logs, metrics, and data across tools like Datadog, Grafana, Splunk, and more, Traversal delivers clarity when nothing else will. It handles the big, high-stakes incidents that cause real damage—and it does it before you maybe even knew there was a problem. It’s the trusted AI teammate that brings reliability back to your team. (Promise: No dashboard dumpster diving required.)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}