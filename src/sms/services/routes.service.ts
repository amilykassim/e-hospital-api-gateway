import { Injectable } from '@nestjs/common';
import { PollingHelper } from '../helpers/polling.helper';
import { KafkaHelper } from '../utils/kafka-helper';

@Injectable()
export class RoutesService {
	constructor(
		private readonly polling: PollingHelper,
		private readonly kafkaHelper: KafkaHelper,
	) { }

	async sendSMSRouteRequest(request, topic: string, transactionName: string) {		
		// send request to SMS GW
		this.kafkaHelper.send(request.trackId, request, transactionName, topic);

		// Starts polling to get the response from redis
		let response = null;
		try {
			response = await this.polling.poll(request.trackId);
			return response;
		} catch (error) {
			return response;
		}
	}
}
