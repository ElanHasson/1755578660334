import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Slide() {
  const markdown = `- Detects SLO burn, correlates provider status and topology to scope impact- Proposes safe, reversible actions; you approve or auto-run with guardrails- Validates via synthetics and SLOs; auto-rollback on regression- Full audit trail with links to Datadog, Grafana, and Splunk evidence

\`\`\`bash
# Regional failover (safe plan)
traversal plan traffic-shift \
  --from us-east-1 --to us-west-2 \
  --canary 10 --ramp 10,25,50,100 \
  --synthetics checkout,login --slo-error-threshold 1.0
# Execute after preview and approval
traversal execute --plan last --approve
\`\`\`

\`\`\`sql
-- DB lock storm triage (Postgres example)
SELECT a.pid, a.state, a.query, l.locktype, l.mode
FROM pg_stat_activity a JOIN pg_locks l USING (pid)
WHERE NOT l.granted ORDER BY a.query_start;
-- Mitigation: terminate long blockers and add missing index
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
WHERE state='active' AND now()-query_start > interval '30 seconds';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON orders(created_at);
\`\`\`

\`\`\`mermaid
flowchart LR
Start["Detect SLO burn"] --> Branch{"Which scenario?"}
Branch -->|"Regional outage"| R["Plan traffic shift"]
R --> P["Preflight synthetics"]
P --> E["Execute weighted DNS/service-mesh shift"]
Branch -->|"DB lock storm"| D["Rate-limit hot path; kill long blockers"]
D --> Q["Lock/slow query analysis; propose index or revert schema"]
E --> V["Validate SLO & error rate"]
Q --> V
V -->|"Stable"| C["Auto-close; postmortem pack"]
V -->|"Regressing"| RB["Rollback & escalate"]
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
      <h1>Rapid Scenarios: Regional Failover and Database Lock Storm</h1>
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