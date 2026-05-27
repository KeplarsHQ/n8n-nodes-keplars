import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class KeplarsApi implements ICredentialType {
	name = 'keplarsApi';

	displayName = 'Keplars API';

	documentationUrl = 'https://docs.keplars.com';

	icon: Icon = 'file:keplars.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'kms_...',
			description: 'Your Keplars API key. Find it at dash.keplars.com',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials?.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.keplars.com',
			url: '/api/v1/integrations/verify',
			method: 'GET',
		},
	};
}
