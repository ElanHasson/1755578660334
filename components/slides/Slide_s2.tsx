import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Mermaid from '../../components/Mermaid';

export default function Slide() {
  const markdown = `- **Why these three matter:** SLOs define what “broken” means, MELT provides the evidence, topology explains impact and blast radius—together they turn AI from noise into action
- **SLOs and error budgets:** Alert on burn rate tied to user journeys, not raw CPU; page only when budget is at risk; annotate alerts with owners and runbooks
- **MELT unification:** Normalize metrics, events, logs, traces across Datadog, Grafana/Prometheus, Splunk via consistent tags and OpenTelemetry; include change events from CI/CD and flags
- **Topology-first context:** Maintain a live service graph of microservices, DBs, queues, and external APIs; map ownership; correlate incidents to deploys and dependencies
- **How Traversal uses it:** Prioritizes by SLO impact, correlates MELT by dependency path, links to changes, proposes guarded actions (rollbacks, traffic shifts), and explains decisions with evidence
\`\`\`yaml
# Prometheus multi-window burn-rate alert for a checkout availability SLO
groups:
- name: checkout-slo
  rules:
  - alert: CheckoutErrorBudgetBurn
    expr: |
      (sum(rate(http_requests_total{service="checkout",status=~"5.."}[5m])) /
       sum(rate(http_requests_total{service="checkout"}[5m]))) > 0.02
      and
      (sum(rate(http_requests_total{service="checkout",status=~"5.."}[1h])) /
       sum(rate(http_requests_total{service="checkout"}[1h]))) > 0.005
    for: 5m
    labels:
      severity: page
      slo: "checkout-availability"
    annotations:
      runbook: "https://runbooks/checkout-slo"
      owners: "@team-checkout"
\`\`\`
\`\`\`mermaid
flowchart LR
  SLO["SLOs & error budgets"] --> T["Traversal AI SRE"]
  MELT["MELT data (metrics, events, logs, traces)"] --> T
  TOPO["Topology graph & ownership"] --> T
  CHG["Change events (deploys, flags, infra)"] --> T
  TOOLS["Tools: Datadog, Grafana, Splunk"] --> MELT
  T --> DET["Detect & prioritize by SLO impact"]
  T --> MIT["Mitigate with guardrails (rollback, traffic shift)"]
  T --> EXP["Explain with linked evidence"]
\`\`\`
`;
  
  return (
    <div className="slide markdown-slide">
      <h1>Foundations That Make AI Useful: SLOs, MELT, and Topology</h1>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          code({node, inline, className, children, ...props}: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            // Handle inline code
            if (inline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            
            // Handle mermaid diagrams
            if (language === 'mermaid') {
              return (
                <Mermaid chart={String(children).replace(/\n$/, '')} />
              );
            }
            
            // Handle code blocks with syntax highlighting
            if (language) {
              return (
                <SyntaxHighlighter
                  language={language}
                  style={atomDark}
                  showLineNumbers={true}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            }
            
            // Default code block without highlighting
            return (
              <pre>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          }
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}