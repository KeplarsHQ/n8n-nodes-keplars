# n8n-nodes-keplars

[Keplars](https://keplars.com) node for [n8n](https://n8n.io). Send transactional emails through Keplars' priority-queue API directly from your n8n workflows.

## Install

In your n8n instance go to **Settings - Community Nodes - Install** and enter:

```
n8n-nodes-keplars
```

## Operations

| Operation | Priority | Delivery |
|---|---|---|
| Send Email | Instant | 0-5 seconds |
| Send High Priority Email | High | 0-30 seconds |
| Send Async Email | Async | 0-5 minutes |

## Credentials

1. Go to **Credentials** in n8n
2. Add new credential: **Keplars API**
3. Enter your API key from [dash.keplars.com](https://dash.keplars.com)

## Fields

| Field | Required | Description |
|---|---|---|
| To | Yes | Recipient email address |
| From | Yes | Sender address (must be verified in Keplars) |
| Sender Name | No | Sender display name |
| Subject | Yes | Email subject line |
| Body | No | HTML or plain text content |
| Template ID | No | Keplars template ID |
| Template Parameters | No | Key-value variables for templates |

## Development

```bash
npm install
npm run build      # compile TypeScript
npm run dev        # watch mode with n8n hot reload
npm run lint       # check code quality
npm run lint:fix   # auto-fix lint issues
```

## License

MIT
