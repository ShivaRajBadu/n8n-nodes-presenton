import { IExecuteFunctions, NodeApiError, JsonObject } from 'n8n-workflow';
import { IDataObject, IRequestOptions } from 'n8n-workflow';

export async function apiRequest(this: IExecuteFunctions, method: 'GET'|'POST'|'PUT'|'DELETE', endpoint: string, body?: IDataObject): Promise<any> {
  const credentials = await this.getCredentials('PresentonApi') as { apiKey: string, baseUrl?: string };

  const options: IRequestOptions = {
    method,
    uri: `${credentials.baseUrl ?? 'https://api.presenton.ai'}${endpoint}`,
    headers: {
      'Authorization': `Bearer ${credentials.apiKey}`,
      'Content-Type': 'application/json',
    },
    json: true,
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = body;
  }

  try {
    return await this.helpers.request!(options);
  } catch (error) {
    throw new NodeApiError(this.getNode(), error as JsonObject);
  }
}



export async function apiRequestFormData(this: IExecuteFunctions, endpoint: string, formData: IDataObject): Promise<any> {
    const credentials = await this.getCredentials('PresentonApi') as { apiKey: string, baseUrl?: string };

  const options: IRequestOptions = {
    method: 'POST',
    uri: `${credentials.baseUrl ?? 'https://api.presenton.ai'}${endpoint}`,
    headers: {
      'Authorization': `Bearer ${credentials.apiKey}`,
    },
    json: true,
    formData,
  };

  try {
    return await this.helpers.request!(options);
  } catch (error) {
    throw new NodeApiError(this.getNode(), error as JsonObject);
  }
}
