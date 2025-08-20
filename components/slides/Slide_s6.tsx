import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Mermaid from '../../components/Mermaid';

export default function Slide() {
  const markdown = `- Quick chat poll: drop a number 1–5 for your biggest gap (we’ll tailor the demo to the top two)
- 1: Alert noise or missing SLO burn-rate alerts
- 2: Siloed telemetry across Datadog/Grafana/Splunk (dashboard dumpster diving)
- 3: Slow triage/unknown root cause across microservice topology
- 4: Missing safe automation/runbooks with guardrails
- 5: Weak change correlation and rollback confidence
\`\`\`mermaid
flowchart LR
User["You"] --> Poll["Vote 1–5 in chat"]
Poll --> A1["1: Alert noise/SLOs"] --> T1["Traversal: SLO burn-rate + alert correlation"]
Poll --> A2["2: Siloed telemetry"] --> T2["Traversal: unified MELT + topology"]
Poll --> A3["3: Slow triage/RCA"] --> T3["Traversal: topology-aware root cause analysis"]
Poll --> A4["4: Missing safe automation"] --> T4["Traversal: guardrailed runbooks & approvals"]
Poll --> A5["5: Change correlation/rollback"] --> T5["Traversal: change intelligence + auto-rollback"]
\`\`\`
\`\`\`yaml
# Example: SLO burn-rate alert (Prometheus)
alert: CheckoutSLOBurn
expr: (sum(rate(http_requests_errors_total{job="checkout"}[5m]))
      / sum(rate(http_requests_total{job="checkout"}[5m]))) > 0.02
for: 10m
labels:
  severity: page
annotations:
  runbook: https://runbooks/checkout/slo-burn
  summary: "Checkout error budget burning >2% over 5m"
\`\`\``;
  
  return (
    <div className="slide markdown-slide">
      <h1>Quick Pulse Check: Where Are Your Biggest Gaps?</h1>
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