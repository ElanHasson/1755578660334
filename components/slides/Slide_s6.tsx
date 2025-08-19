import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
  const mermaidRef = useRef(0);
  
  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#667eea',
        primaryTextColor: '#fff',
        primaryBorderColor: '#7c3aed',
        lineColor: '#5a67d8',
        secondaryColor: '#764ba2',
        tertiaryColor: '#667eea',
        background: '#1a202c',
        mainBkg: '#2d3748',
        secondBkg: '#4a5568',
        tertiaryBkg: '#718096',
        textColor: '#fff',
        nodeTextColor: '#fff',
      }
    });
    
    // Find and render mermaid diagrams
    const renderDiagrams = async () => {
      const diagrams = document.querySelectorAll('.language-mermaid');
      for (let i = 0; i < diagrams.length; i++) {
        const element = diagrams[i];
        const graphDefinition = element.textContent;
        const id = `mermaid-${mermaidRef.current++}`;
        
        try {
          const { svg } = await mermaid.render(id, graphDefinition);
          element.innerHTML = svg;
          element.classList.remove('language-mermaid');
          element.classList.add('mermaid-rendered');
        } catch (error) {
          console.error('Mermaid rendering error:', error);
        }
      }
    };
    
    renderDiagrams();
  }, [markdown]);
  
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
                <pre className="language-mermaid">
                  <code>{String(children).replace(/\n$/, '')}</code>
                </pre>
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