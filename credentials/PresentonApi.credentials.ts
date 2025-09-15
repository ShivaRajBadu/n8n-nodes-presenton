import { IAuthenticateGeneric, ICredentialType, INodeProperties } from 'n8n-workflow';

export class PresentonApi implements ICredentialType {
  name = 'PresentonApi';
  displayName = 'Presenton API';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      default: '',
      description: 'Your API key for Presenton',
    },
    {
      displayName: 'Base API URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.presenton.ai',
      description: '(Optional) Override base URL if using staging / custom domain',
      required: false,
    },
  ];
  authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: 'Bearer {{$credentials.apiKey}}',
			},
		},
	};
}
