import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Slide() {
  const markdown = `- Ingest at scale: unify MELT + change + topology via connectors (Datadog, Grafana/Prometheus, Splunk, Kubernetes, CI/CD, feature flags), normalize tags/time/service identity
- Correlate for signal: compress alert storms using SLO impact, anomaly detection, service topology, and change events; produce a single incident view
- Reason with evidence: LLM + causal graph generate hypotheses, run counterfactual checks, and link to traces/logs/metrics that prove or disprove
- Act safely: execute vetted runbooks (rollback, traffic shaping, rate limiting, flag toggles) with human-in-the-loop for high risk; every step auditable
- Guardrails by policy: RBAC, approvals, blast-radius limits, canaries, timeouts, auto-rollback; trust built via precision/recall and win-rate metrics
\`\`\`yaml
# OpenTelemetry Collector (ingest & normalize)
receivers:
  otlp:
    protocols: { grpc: {}, http: {} }
exporters:
  datadog:
    api: { key: \${DATADOG_API_KEY} }
  splunk_hec:
    token: \${SPLUNK_HEC_TOKEN}
    endpoint: https://splunk.example.com:8088
  prometheusremotewrite:
    endpoint: https://mimir.example.com/api/v1/push
  kafka:
    brokers: ["kafka-1:9092"]
processors:
  batch: {}
service:
  pipelines:
    traces:  { receivers: [otlp], processors: [batch], exporters: [datadog, kafka] }
    metrics: { receivers: [otlp], processors: [batch], exporters: [datadog, prometheusremotewrite, kafka] }
    logs:    { receivers: [otlp], processors: [batch], exporters: [splunk_hec, kafka] }
\`\`\`
\`\`\`rego
# OPA guardrail (approve high-risk actions)
package traversal.guardrails

default allow = false

require_approval {
  input.action.risk_score >= 3
} or {
  input.action.targets_percent > 10
}

allow {
  not require_approval
  input.caller.role == "SRE"
  input.window == "maintenance"
}

deny[msg] {
  require_approval
  msg := "approval required: high risk or >10% traffic change"
}
\`\`\`
\`\`\`mermaid
flowchart LR
A["Ingest connectors: Datadog, Grafana, Splunk, K8s, CI/CD"] --> B["Normalize: tags, time, service identity, topology"]
B --> C["Correlate: SLO impact, anomalies, change events"]
C --> D["Reason: LLM + causal graph; hypotheses + evidence"]
D --> E["Plan actions: runbooks, flags, traffic, rollbacks"]
E --> F{"Guardrails: policy, RBAC, blast radius?"}
F -->|pass| G["Execute safely"]
F -->|needs approval| H["Human-in-the-loop"]
G --> I["Validate: SLOs stabilize, synthetic checks"]
I --> J["Learn: update detectors and runbooks"]
\`\`\`
`;
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
      <h1>Inside Traversal: Ingest, Correlate, Reason, and Act with Guardrails</h1>
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