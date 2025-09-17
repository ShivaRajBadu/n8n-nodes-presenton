import { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class PresentonApi implements ICredentialType {
  name = 'presentonApi';
  displayName = 'Presenton API';
  documentationUrl = 'https://docs.presenton.ai/using-presenton-api#authentication';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      default: '',
      typeOptions:{
        password: true,
      },
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
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};
  test:ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl}}',
      url: `/api/v1/auth/profile`,
      headers:{
        'Authorization': '=Bearer {{$credentials.apiKey}}',
      }
    },
  };
}
