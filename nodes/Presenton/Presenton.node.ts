import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
	NodeApiError,
	IDataObject,
} from 'n8n-workflow';

import * as GenericFunctions from './GenericFunctions';

export class Presenton implements INodeType {
	description: INodeTypeDescription = {
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
				required: true,
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
				description: 'Main content to generate presentation from',
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
				description: 'Template name',
			},
			{
				displayName: 'No of Slides',
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
				default: 'pdf',
				description: 'Output format',
			},

			{
				displayName: 'Advanced Options',
				name: 'advancedOptions',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['generateAsync'],
					},
				},
				options: [
					{
						displayName: 'Instructions',
						name: 'instructions',
						type: 'string',
						default: null,
						description: 'Additional instructions',
					},
					{
						displayName: 'Tone',
						name: 'tone',
						type: 'options',
						options: [
							{ name: 'Casual', value: 'casual' },
							{ name: 'Default', value: 'default' },
							{ name: 'Educational', value: 'educational' },
							{ name: 'Funny', value: 'funny' },
							{ name: 'Professional', value: 'professional' },
							{ name: 'Sale Pitch', value: 'sale_pitch' },
						],
						default: 'default',
						description: 'Writing tone',
					},
					{
						displayName: 'Verbosity',
						name: 'verbosity',
						type: 'options',
						options: [
							{ name: 'Concise', value: 'concise' },
							{ name: 'Standard', value: 'standard' },
							{ name: 'Text Heavy', value: 'text-heavy' },
						],
						default: 'standard',
						description: 'Verbosity level',
					},
					{
						displayName: 'Enable Web Search',
						name: 'web_search',
						type: 'boolean',
						default: false,
						description: 'Whether to allow web search during generation',
					},
					{
						displayName: 'Image Type',
						name: 'image_type',
						type: 'options',
						options: [
							{ name: 'AI Generated', value: 'ai-generated' },
							{ name: 'Stock', value: 'stock' },
						],
						default: 'stock',
						description: 'Image type to use',
					},
					{
						displayName: 'Language',
						name: 'language',
						type: 'string',
						default: 'English',
						description: 'Language to use',
					},
					{
						displayName: 'Theme',
						name: 'theme',
						type: 'string',
						default: null,
						description: 'Theme to use',
					},
					{
						displayName: 'Include Table of Contents',
						name: 'include_table_of_contents',
						type: 'boolean',
						default: false,
						description: 'Whether to include a table of contents',
					},
					{
						displayName: 'Include Title Slide',
						name: 'include_title_slide',
						type: 'boolean',
						default: true,
						description: 'Whether to include a title slide',
					},
					{
						displayName: 'Files (IDs From Upload)',
						name: 'files',
						type: 'string',

						default: null,
						description: 'ID of file previously uploaded (required for generateAsync)',
					},

				],
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
				description:
					'The ID returned from generate-presentation-async to check status (single check only) (required for checkStatus)',
			},
		],
	};
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const results: INodeExecutionData[] = [];
		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				if (operation === 'generateAsync') {
					const noOfSlides = this.getNodeParameter('noOfSlides', i, 5) as number;
					if (typeof noOfSlides !== 'number' || noOfSlides <= 0) {
						throw new NodeOperationError(this.getNode(), 'Invalid number of slides', {
							description: 'No of Slides must be a positive number.',
							itemIndex: i,
						});
					}

					// Read additional (optional) fields
					const advancedOptions = this.getNodeParameter('advancedOptions', i, {}) as IDataObject;

					// Build base body
					const body: any = {
						content: this.getNodeParameter('content', i, '') as string,
						template: this.getNodeParameter('template', i, 'general') as string,
						n_slides: noOfSlides,
						export_as: this.getNodeParameter('export_as', i, 'pdf') as string,
						files: advancedOptions.files ? JSON.parse(advancedOptions.files as string) : null,
						// Defaults for additional fields (applied unless overridden)
						instructions: advancedOptions.instructions as string,
						tone: advancedOptions.tone as string,
						verbosity: advancedOptions.verbosity as string,
						web_search: advancedOptions.web_search as boolean,
						image_type: advancedOptions.image_type as string,
						language: advancedOptions.language as string,
						theme: advancedOptions.theme as string,
						include_table_of_contents: advancedOptions.include_table_of_contents as boolean,
						include_title_slide: advancedOptions.include_title_slide as boolean,

					};

					Object.keys(body).forEach((k) => {
						const v = (body as any)[k];
						if (v === null || v === 'null') {
							delete (body as any)[k];
						} else if (typeof v === 'string' && v.trim() === '') {
							delete (body as any)[k];
						} else if (Array.isArray(v) && v.length === 0) {
							delete (body as any)[k];
						}
					});


					const response = await GenericFunctions.apiRequest.call(
						this,
						'POST',
						'/api/v1/ppt/presentation/generate/async',
						body,
					);
					results.push({ json: response, pairedItem: { item: i } });
				} else if (operation === 'checkStatus') {
					const taskId = this.getNodeParameter('taskId', i) as string;
					if (!taskId || taskId.trim() === '') {
						throw new NodeOperationError(this.getNode(), 'Task ID is required', { itemIndex: i });
					}
					const response = await GenericFunctions.apiRequest.call(
						this,
						'GET',
						`/api/v1/ppt/presentation/status/${taskId}`,
					);
					results.push({ json: response, pairedItem: { item: i } });
				} else if (operation === 'uploadFile') {
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
					const item = items[i];
					if (!item.binary || !item.binary[binaryPropertyName]) {
						throw new NodeOperationError(
							this.getNode(),
							`No binary data property '${binaryPropertyName}' exists on item index ${i}`,
							{
								itemIndex: i,
							},
						);
					}
					const binaryData = item.binary[binaryPropertyName] as any;
					const dataBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
					const formData: any = {
						files: [
							{
								value: dataBuffer,
								options: {
									filename: binaryData.fileName || 'file',
									contentType: binaryData.mimeType || 'application/octet-stream',
								},
							},
						],
					};
					const response = await GenericFunctions.apiRequestFormData.call(
						this,
						'/api/v1/ppt/files/upload',
						formData,
					);
					results.push({ json: response, pairedItem: { item: i } });
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
}
