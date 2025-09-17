
import {
    IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
    NodeConnectionType,
    NodeOperationError,
    NodeApiError,
} from 'n8n-workflow';

import * as GenericFunctions from './GenericFunctions';





export class Presenton implements INodeType {
    description: INodeTypeDescription ={
         displayName: 'Presenton',
    name: 'presenton',
    icon: 'file:presenton.svg',
    group: ['transform'],
    
    version: 1,
    description: 'Interact with presenton API (async generation + status checking)',
    defaults: {
      name: 'presenton',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'presentonApi',
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
            name: 'Generate Presentation (Async)',
            value: 'generateAsync',
            description: 'Initiate presentation generation asynchronously',
            action: 'Initiate presentation generation',
          },
          {
            name: 'Check Presentation Status',
            value: 'checkStatus',
            description: 'Poll or check until presentation is done',
            action: 'Poll or check until presentation is done',
          },
          {
            name: 'Upload File',
            value: 'uploadFile',
            description: 'Upload a file to Presenton to reference later',
            action: 'Upload a file to presenton to reference later',
          },
        ],
        default: 'generateAsync',
        description: 'What you want to do with Presenton',
        required: true
      },
      {
        displayName: 'Content',
        name: 'content',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['generateAsync'],
          },
        },
        default: '',
        description: 'Main content to generate presentation from (required for generateAsync)',
      },
      {
        displayName: 'Instructions',
        name: 'instructions',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['generateAsync'],
          },
        },
        default: '',
        description: 'Additional instructions (required for generateAsync)',
      },
      {
        displayName: 'Tone',
        name: 'tone',
        type: 'options',
        options:[
          { name: 'Causal', value: 'causal' },
          { name: 'Default', value: 'default' },
          { name: 'Educational', value: 'educational' },
          { name: 'Funny', value: 'funny' },
          { name: 'Professional', value: 'professional' },
          { name: 'Sale Pitch', value: 'sale_pitch' },
        ],
        displayOptions: {
          show: {
            operation: ['generateAsync'],
          },
        },
        default: 'default',
        description: 'Writing tone, e.g. default, professional, friendly (required for generateAsync)',
      },
      {
        displayName: 'Verbosity',
        name: 'verbosity',
        type: 'options',
        options:[
          { name: 'Concise', value: 'concise' },
          { name: 'Standard', value: 'standard' },
          { name: 'Text Heavy', value: 'text-heavy' },
        ],
        displayOptions: {
          show: {
            operation: ['generateAsync'],
          },
        },
        default: 'standard',
        description: 'Verbosity level, e.g. standard, concise, verbose (required for generateAsync)',
      },
      {
        displayName: 'Enable Web Search',
        name: 'web_search',
        type: 'boolean',
        displayOptions: {
          show: {
            operation: ['generateAsync'],
          },
        },
        default: false,
        description: 'Whether to allow web search during generation (required for generateAsync)',
      },
      {
        displayName: 'Image Type',
        name: 'image_type',
        type: 'options',
        options:[
          { name: 'AI Generated', value: 'ai-generated' },
          { name: 'Stock', value: 'stock' },
         
        ],
        displayOptions: {
          show: {
            operation: ['generateAsync'],
          },
        },
        default: 'stock',
        description: 'Image type to use (stock, none, etc.) (required for generateAsync)',
      },
      {
        displayName: 'Theme',
        name: 'theme',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['generateAsync'],
          },
        },
        default: '',
        description: 'Theme name (required for generateAsync) (optional)',
      },
      {
        displayName:'No of Slides',
        name: 'noOfSlides',
        type: 'number',
        required: true,
        displayOptions: {
          show: {
            operation: ['generateAsync'],
          },
        },
        default: 5,
        description: 'Number of slides to generate (required for generateAsync)',
      },
      {
        displayName: 'Language',
        name: 'language',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['generateAsync'],
          },
        },
        default: 'English',
        description: 'Language to use (required for generateAsync)',
      },
      {
        displayName: 'Template',
        name: 'template',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['generateAsync'],
          },
        },
        default: 'general',
        description: 'Template to use (required for generateAsync)',
      },
      {
        displayName: 'Include Table of Contents',
        name: 'include_table_of_contents',
        type: 'boolean',
        displayOptions: {
          show: {
            operation: ['generateAsync'],
          },
        },
        default: false,
        description: 'Whether to include a table of contents (required for generateAsync)',
      },
      {
        displayName: 'Include Title Slide',
        name: 'include_title_slide',
        type: 'boolean',
        displayOptions: {
          show: {
            operation: ['generateAsync'],
          },
        },
        default: true,
        description: 'Whether to include a title slide (required for generateAsync)',
      },
      {
        displayName: 'Files (IDs From Upload)',
        name: 'files',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['generateAsync'],
          },
        },
        default: '',
        description: 'ID of file previously uploaded (required for generateAsync)',
      },
      {
        displayName: 'Export As',
        name: 'export_as',
        type: 'options',
        options: [
          { name: 'PPTX', value: 'pptx' },
          { name: 'PDF', value: 'pdf' },
        ],
        displayOptions: {
          show: {
            operation: ['generateAsync'],
          },
        },
        default: 'pptx',
        description: 'Output format (required for generateAsync)',
      },
      {
        displayName: 'Binary Property',
        name: 'binaryPropertyName',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            operation: ['uploadFile'],
          },
        },
        default: 'data',
        description: 'Name of the binary property containing the file (required for uploadFile)',
      },
      {
        displayName: 'Task ID',
        name: 'taskId',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            operation: ['checkStatus'],
          },
        },
        default: '',
        description: 'The ID returned from generate-presentation-async to check status (single check only) (required for checkStatus)',
      },
    ],
    };
    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const results:INodeExecutionData[] = [];
        for(let i = 0; i < items.length; i++){
            try {
                const operation = this.getNodeParameter('operation', i) as string;
                if(operation === 'generateAsync'){
                    const noOfSlides = this.getNodeParameter('noOfSlides', i, 5) as number;
                    if (typeof noOfSlides !== 'number' || noOfSlides <= 0) {
                        throw new NodeOperationError(this.getNode(), 'Invalid number of slides', {
                            description: 'No of Slides must be a positive number.',
                            itemIndex: i,
                        });
                    }

                    // Build base body
                    const body: any = {
                      content: this.getNodeParameter('content', i, '') as string ,
                      instructions: this.getNodeParameter('instructions', i, '') as string,
                      tone: this.getNodeParameter('tone', i, 'default') as string,
                      verbosity: this.getNodeParameter('verbosity', i, 'standard') as string,
                      web_search: this.getNodeParameter('web_search', i, false) as boolean,
                      image_type: this.getNodeParameter('image_type', i, 'stock') as string,
                      theme: this.getNodeParameter('theme', i, 'general') as string,
                      n_slides: noOfSlides,
                      language: this.getNodeParameter('language', i, 'English') as string,
                      template: this.getNodeParameter('template', i, 'general') as string,
                      include_table_of_contents: this.getNodeParameter('include_table_of_contents', i, false) as boolean,
                      include_title_slide: this.getNodeParameter('include_title_slide', i, true) as boolean,
                      export_as: this.getNodeParameter('export_as', i, 'pptx') as string,
                      files: this.getNodeParameter('files', i, null) as string,
                    };
                    
                    Object.keys(body).forEach((k) => {
                      const v = (body as any)[k];
                      if (v === null || v=== 'null') {
                        delete (body as any)[k];
                      } else if (typeof v === 'string' && v.trim() === '') {
                        delete (body as any)[k];
                      } else if (Array.isArray(v) && v.length === 0) {
                        delete (body as any)[k];
                      }
                    });
                    
                   
                    const response = await GenericFunctions.apiRequest.call(this,'POST','/api/v1/ppt/presentation/generate/async', body);
                    results.push({json:response});
                }else if (operation === 'checkStatus'){
                    const taskId = this.getNodeParameter('taskId', i) as string;
                    if (!taskId || taskId.trim() === '') {
                        throw new NodeOperationError(this.getNode(), 'Task ID is required', { itemIndex: i });
                    }
                    const response = await GenericFunctions.apiRequest.call(this, 'GET', `/api/v1/ppt/presentation/status/${taskId}`);
                    results.push({json:response});
                } else if (operation === 'uploadFile') {
                    const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
                    const item = items[i];
                    if (!item.binary || !item.binary[binaryPropertyName]) {
                      throw new NodeOperationError(this.getNode(), `No binary data property '${binaryPropertyName}' exists on item index ${i}`, {
                        itemIndex: i,
                      });
                    }
                    const binaryData = item.binary[binaryPropertyName] as any;
                    const dataBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
                    const formData: any = {
                      files: {
                        value: dataBuffer,
                        options: {
                          filename: binaryData.fileName || 'file',
                          contentType: binaryData.mimeType || 'application/octet-stream',
                        },
                      },
                    };
                    const response = await GenericFunctions.apiRequestFormData.call(this, '/api/v1/ppt/files/upload', formData);
                    results.push({ json: response });
                }
            } catch (error) {
                if (this.continueOnFail()) {
                    results.push({ json: { error: (error as any).message }, pairedItem: { item: i } });
                    continue;
                }
                if (error instanceof NodeOperationError || error instanceof NodeApiError) {
                    throw error;
                }
                throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
            }
        }
        return this.prepareOutputData(results);

	}
    
  };
