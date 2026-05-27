import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { type IDataObject, type JsonObject, NodeApiError, NodeConnectionTypes } from 'n8n-workflow';

export class Keplars implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Keplars',
		name: 'keplars',
		icon: 'file:keplars.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Send transactional emails using Keplars priority-queue API',
		defaults: {
			name: 'Keplars',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'keplarsApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Send Async Email',
						value: 'sendAsync',
						description: 'Send an async email (0-5 minutes)',
						action: 'Send an async email',
					},
					{
						name: 'Send Email',
						value: 'sendInstant',
						description: 'Send an instant priority email (0-5 seconds)',
						action: 'Send an instant priority email',
					},
					{
						name: 'Send High Priority Email',
						value: 'sendHigh',
						description: 'Send a high priority email (0-30 seconds)',
						action: 'Send a high priority email',
					},
				],
				default: 'sendInstant',
			},
			{
				displayName: 'To',
				name: 'to',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'user@example.com',
				description: 'Recipient email address',
			},
			{
				displayName: 'From',
				name: 'from',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'hello@yourdomain.com',
				description: 'Sender email address (must be verified in Keplars)',
			},
			{
				displayName: 'Sender Name',
				name: 'from_name',
				type: 'string',
				default: '',
				placeholder: 'Your App',
				description: 'Sender display name',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				required: true,
				default: '',
				description: 'Email subject line',
			},
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: '',
				description: 'Email body content (HTML or plain text)',
			},
			{
				displayName: 'Template ID',
				name: 'template_id',
				type: 'string',
				default: '',
				description: 'Optional Keplars template ID. When set, body is optional.',
			},
			{
				displayName: 'Template Parameters',
				name: 'params',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Key-value pairs for template variables',
				options: [
					{
						name: 'data',
						displayName: 'Parameter',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
							},
						],
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;

				const to = this.getNodeParameter('to', i) as string;
				const from = this.getNodeParameter('from', i) as string;
				const from_name = this.getNodeParameter('from_name', i) as string;
				const subject = this.getNodeParameter('subject', i) as string;
				const body_content = this.getNodeParameter('body', i) as string;
				const template_id = this.getNodeParameter('template_id', i) as string;
				const paramsRaw = this.getNodeParameter('params', i) as {
					data?: Array<{ key: string; value: string }>;
				};

				const params: Record<string, string> = {};
				if (paramsRaw.data) {
					for (const item of paramsRaw.data) {
						params[item.key] = item.value;
					}
				}

				const body: Record<string, unknown> = { to: [to], from, subject };
				if (from_name) body.from_name = from_name;
				if (body_content) body.body = body_content;
				if (template_id) body.template_id = template_id;
				if (Object.keys(params).length) body.params = params;

				const endpoints: Record<string, string> = {
					sendInstant: '/api/v1/send-email/instant',
					sendHigh: '/api/v1/send-email/high',
					sendAsync: '/api/v1/send-email/async',
				};

				const response = (await this.helpers.httpRequestWithAuthentication.call(
					this,
					'keplarsApi',
					{
						method: 'POST',
						url: `https://api.keplars.com${endpoints[operation]}`,
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(body),
					},
				)) as IDataObject;

				returnData.push({ json: response, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
