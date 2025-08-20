import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Mermaid from '../../components/Mermaid';

export default function Slide() {
  const markdown = `- Incident: After deploy to checkout-service v531, p95 latency 3x and 5xx spike; SLO burn rate 14x; canary at 10% shows immediate degradation
- Traversal response: Correlates ArgoCD deploy event with errors; surfaces diff (heap change + new flag); links Datadog errors, Grafana latency, Splunk stack traces
- Safe plan: Freeze canary, rollback to v530, optionally disable feature flag checkout.optimisticWrite; human-in-the-loop approval with blast radius checks
- Execution: Dry-run passes preflight; runbook executes rollback + flag toggle; continuous validation via synthetic checkout and SLO burn halt
- Result: MTTR ~6 minutes; postmortem pack with timeline, trace exemplars, slow query hints; bug filed and runbook updated
\`\`\`yaml
# Policy-as-code: guarded rollback plan executed by Traversal
runbook: rollback_checkout_v531
preflight:
  - check: slo_burn_rate < 2x after mitigation
  - check: db_write_latency_p95 < 120ms
  - check: capacity_in_region >= 2x current QPS
approvals:
  required_role: IncidentCommander
  max_blast_radius: service=checkout, region=us-east-1
steps:
  - name: freeze_canary
    exec: argo rollouts pause rollout/checkout
  - name: rollback_service
    exec: kubectl rollout undo deployment/checkout --to-revision=530
  - name: disable_flag
    when: metric("errors_per_min") > threshold
    exec: |
      curl -s -X PATCH https://flags.internal/api/flags/checkout.optimisticWrite \
        -H "Authorization: Bearer $FLAG_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"enabled": false}'
  - name: validate
    exec: ./synthetics run checkout-flow --timeout 60s
  - name: watch_slo
    exec: ./dd query "slo:checkout_availability burn_rate" --expect "< 1x"
\`\`\` 
\`\`\`bash
# Commands executed by Traversal (with audit trail)
# 1) Correlate evidence
open https://app.datadoghq.com/apm/service/checkout/errors?from_ts=$T0&to_ts=$T1
open https://grafana/internal/d/latency/checkout?p95&from=$T0&to=$T1
open https://splunk/search?q=service=checkout error AND version=v531
# 2) Dry-run and apply rollback
argo rollouts pause rollout/checkout --namespace prod
kubectl rollout undo deployment/checkout --to-revision=530 --namespace prod
# 3) Optional flag mitigation
curl -s -X PATCH https://flags.internal/api/flags/checkout.optimisticWrite -d '{"enabled": false}' -H "Authorization: Bearer $FLAG_TOKEN" -H "Content-Type: application/json"
# 4) Validate recovery
trv synthetics run checkout
trv slo status checkout
\`\`\` 
\`\`\`mermaid
sequenceDiagram
  participant CI as CI/CD
  participant Obs as Datadog/Grafana/Splunk
  participant Trav as Traversal
  participant K8s as Kubernetes
  participant IC as Incident Commander
  CI->>Obs: Deploy v531 event + metrics/logs
  Obs-->>Trav: 5xx spike, p95 up, traces
  Trav->>Trav: Change correlation + RCA hypothesis
  Trav-->>IC: Proposed plan (freeze, rollback, flag) & dry-run results
  IC-->>Trav: Approve with policy guardrails
  Trav->>K8s: Pause canary, rollout undo to v530
  Trav->>Obs: Validate via synthetics + SLO burn stop
  Trav-->>IC: Resolved summary + links + postmortem pack
\`\`\``;
  
  return (
    <div className="slide markdown-slide">
      <h1>Walkthrough: Deployment-Induced Outage Resolved in Minutes</h1>
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