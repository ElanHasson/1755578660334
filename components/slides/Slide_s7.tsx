import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Slide() {
  const markdown = `- Pilot one critical service first: define SLOs, propagate trace context, align tags; connect Datadog, Grafana/Prometheus, Splunk, Kubernetes, CI/CD change events
- Safeguard actions: RBAC, approvals, blast radius limits; runbooks as code with dry-run, canary, rollback; immutable audit trail
- Run a game day: trigger a safe failure; let Traversal detect→diagnose→propose; approve mitigations; verify SLO burn stops
- Measure and iterate: track MTTD/MTTM/MTTR, alert precision/recall, pages per week, % auto-mitigated, toil hours saved; feed postmortems into detectors/runbooks
\`\`\`rego
# Policy-as-code: require approval for high-risk production actions
package traversal.guardrails

default allow = false

allow {
  input.env == "prod"
  input.action.risk == "low"
  input.actor.role == "sre-bot"
}

# Medium/high risk in prod requires human approval and small blast radius
allow {
  input.env == "prod"
  input.action.risk != "low"
  input.approvals >= 1
  input.action.blast_radius <= 5  # e.g., percent traffic or node count
  time.now_ns() >= input.change_window.start
  time.now_ns() <= input.change_window.end
}
\`\`\`
\`\`\`mermaid
flowchart LR
  A["Instrument & SLOs"] --> B["Wire Datadog/Grafana/Splunk + change events"]
  B --> C["Import runbooks; enable guardrails"]
  C --> D["Game day: safe failure + human-in-the-loop"]
  D --> E["Measure KPIs & iterate"]
  E --> F["Expand blast radius gradually"]
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
      <h1>Action Plan: Ship an AI SRE Safely—Checklist and KPIs</h1>
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