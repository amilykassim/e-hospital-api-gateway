import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { request } from 'express';
import { SMSDto } from '../dto/send-sms-request.dto';
import { PollingHelper } from '../helpers/polling.helper';
import { ContactsLog } from '../logger/contacts.logs';
import { KafkaHelper } from '../utils/kafka-helper';

@Injectable()
export class ContactsService {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly polling: PollingHelper,
		private readonly kafkaHelper: KafkaHelper,
		private readonly contactsLog: ContactsLog,
	) { }

	async getContacts(sms: SMSDto) {
		const request = {
		trackId: sms.trackId,
		customerId: sms.customerId,
   	};
		this.contactsLog.forwardRequestLog(request, 'get contacts');
		this.kafkaHelper.send(request.trackId, request, 'getContacts', process.env.SMS_CONTACTS_GET_CONTACTS_REQUEST_TOPIC);

		// first step
		let response = null;
		try {
			response = await this.polling.poll(request.trackId);
			const { statusCode, data } = response;

			this.contactsLog.receivedResponseForValidateContactsLog(response, 'get contacts');
			if (statusCode !== 200 || data.length < 1) return [];

			const contacts: [] = data.contacts;
			const receivers = contacts.map(contact => contact['phoneNumber']);
			return receivers;

		} catch (error) {
			return [];
		}
	}

	async getContactsByGroupId(sms: SMSDto) {
		const arrayOfContacts = [];
		for (let i = 0; i < sms['receiverGroups'].length; i++) {
			const groupId = sms['receiverGroups'][i];
			const request = {
				groupId,
				trackId: sms.trackId,
				customerId: sms.customerId,
			};
			this.contactsLog.forwardRequestLog(request, 'get contacts');
			this.kafkaHelper.send(request.trackId, request, 'getContacts', process.env.SMS_CONTACTS_GET_CONTACTS_BY_GROUP_ID_REQUEST_TOPIC);

			const response = await this.polling.poll(request.trackId);
			const { statusCode, data } = response;

			if (statusCode === 200 && data.contacts.length > 0) arrayOfContacts.push(data.contacts);
			this.contactsLog.receivedResponseForValidateContactsLog(response, 'get contacts');
		}
		// flatten 2 dimensional array to one dimensional array
		const contacts = [].concat.apply([], arrayOfContacts);

		const receivers = contacts.map(contact => contact['phoneNumber']);
		return receivers;
	}
}
