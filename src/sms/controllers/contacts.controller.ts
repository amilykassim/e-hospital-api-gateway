import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res } from '@nestjs/common';
import { AuthenticatedUser, RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { AuthenticatedUserDto } from '../dto/authenticated-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { ContactsRequestDTO } from '../dto/contacts-validation-request.dto';
import { ValidateContacts } from '../validation/contacts-validation.dto';
import { CommandBus } from '@nestjs/cqrs';
import { ValidateContactsCommand } from '../commands/implementation';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PollingHelper } from '../helpers/polling.helper';
import { KafkaHelper } from '../utils/kafka-helper';
import { ContactsLog } from '../logger/contacts.logs';
import { UpdateGroupValidation } from '../validation/update-group-validation.dtoz';
import { UpdateContactDetailsValidation } from '../validation/update-contact-validation.dto';
require('dotenv').config();

@Controller('/api/v1/sms')
export class ContactsController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly polling: PollingHelper,
		private readonly kafkaHelper: KafkaHelper,
		private readonly contactsLog: ContactsLog,
	) { }

	@Post('/contacts')
	@Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
	async validateContacts(@AuthenticatedUser() user: AuthenticatedUserDto, @Body(ValidateContacts) request: ContactsRequestDTO, @Res() res) {
		const { customer_id } = user;
		const trackId = uuidv4();

		// check customer id
		if (customer_id == undefined) return res.status(400).json({ statusCode: 400, error: 'Customer Id is not provided in the token' });

		// Validate send sms request payload with the help of validation pipeline
		if (request != undefined && request['error']) {
			this.contactsLog.invalidRequestLog(request);

			return res.status(400).json({ statusCode: 400, error: request['error'] });
		}
		this.contactsLog.forwardRequestLog(request, 'validate contacts');

		request.trackId = trackId;
		request.customerId = customer_id;
		await this.commandBus.execute(new ValidateContactsCommand(request));

		const response = await this.polling.poll(trackId);
		const { statusCode, data, error } = response;
		this.contactsLog.receivedResponseForValidateContactsLog(response, 'validate contacts');

		// failed to get validation response
		if (response.statusCode !== 200) return res.status(400).json({ statusCode, error });

		return res.status(200).json({ statusCode: 200, message: 'success', data });
	}

	@Get('/contacts')
	@Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
	async getContacts(@AuthenticatedUser() user: AuthenticatedUserDto, @Query() query, @Res() res) {
		const { customer_id } = user;
		const trackId = uuidv4();
		const { skip, take } = query;

		// check customer id
		if (customer_id == undefined) return res.status(400).json({ statusCode: 400, error: 'Customer Id is not provided in the token' });

		const request = {
			trackId,
			customerId: customer_id,
			skip: Number(skip),
			take: Number(take)
		};
		this.contactsLog.forwardRequestLog(request, 'get contacts');
		this.kafkaHelper.send(trackId, request, 'getContacts', process.env.SMS_CONTACTS_GET_CONTACTS_REQUEST_TOPIC);

		const response = await this.polling.poll(trackId);
		const { statusCode, data, error } = response;

		this.contactsLog.receivedResponseForValidateContactsLog(response, 'get contacts');

		// failed to get contacts response
		if (response.statusCode !== 200) return res.status(400).json({ statusCode, error });

		return res.status(200).json({ statusCode, message: 'success', data });
	}

	@Get('/contacts/:contactId')
	@Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
	async getContactById(@AuthenticatedUser() user: AuthenticatedUserDto, @Param('contactId') contactId, @Query() query, @Res() res) {
		const { customer_id } = user;
		const trackId = uuidv4();
		const { skip, take } = query;

		// check customer id
		if (customer_id == undefined) return res.status(400).json({ statusCode: 400, error: 'Customer Id is not provided in the token' });

		const request = {
			contactId: contactId,
			trackId,
			customerId: customer_id,
			skip: Number(skip),
			take: Number(take)
		};
		this.contactsLog.forwardRequestLog(request, 'get contacts');
		this.kafkaHelper.send(trackId, request, 'getContacts', process.env.SMS_CONTACTS_GET_CONTACTS_REQUEST_TOPIC);

		const response = await this.polling.poll(trackId);
		const { statusCode, data, error } = response;

		this.contactsLog.receivedResponseForValidateContactsLog(response, 'get contacts');

		// failed to get contacts response
		if (response.statusCode !== 200) return res.status(400).json({ statusCode, error });

		return res.status(200).json({ statusCode, message: 'success', data });
	}

	@Put('/contacts/:contactId')
	@Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
	async updateContactDetailsById(@AuthenticatedUser() user: AuthenticatedUserDto, @Body(UpdateContactDetailsValidation) updateRequest, @Param('contactId') contactId, @Res() res) {
		const { customer_id } = user;
		const trackId = uuidv4();

		// Validate send sms request payload with the help of validation pipeline
		if (updateRequest != undefined && updateRequest['error']) {
			return res.status(400).json({ statusCode: 400, error: updateRequest['error'] });
		}

		// check customer id
		if (customer_id == undefined) return res.status(400).json({ statusCode: 400, error: 'Customer Id is not provided in the token' });

		const request = {
			contactId,
			firstName: updateRequest.firstName,
			lastName: updateRequest.lastName,
			email: updateRequest.email,
			profileImage: updateRequest.profileImage,
			trackId,
			customerId: customer_id,
		};
		this.contactsLog.forwardRequestLog(request, 'update group');
		this.kafkaHelper.send(trackId, request, 'updateGroup', process.env.SMS_CONTACTS_UPDATE_CONTACT_REQUEST_TOPIC);

		const response = await this.polling.poll(trackId);
		const { statusCode, data, error } = response;

		this.contactsLog.receivedResponseForValidateContactsLog(response, 'update group');

		// failed to get contacts response
		if (response.statusCode !== 200) return res.status(400).json({ statusCode, error });

		return res.status(200).json({ statusCode, message: 'success', data });
	}

	@Get('/groups/:groupId/contacts')
	@Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
	async getContactsByGroupId(@AuthenticatedUser() user: AuthenticatedUserDto, @Param('groupId') id, @Query() query, @Res() res) {
		const { customer_id } = user;
		const trackId = uuidv4();
		const { skip, take } = query;

		// check customer id
		if (customer_id == undefined) return res.status(400).json({ statusCode: 400, error: 'Customer Id is not provided in the token' });

		const request = {
			groupId: id,
			trackId,
			customerId: customer_id,
			skip: Number(skip),
			take: Number(take)
		};
		this.contactsLog.forwardRequestLog(request, 'get contacts');
		this.kafkaHelper.send(trackId, request, 'getContacts', process.env.SMS_CONTACTS_GET_CONTACTS_BY_GROUP_ID_REQUEST_TOPIC);

		const response = await this.polling.poll(trackId);
		const { statusCode, data, error } = response;

		this.contactsLog.receivedResponseForValidateContactsLog(response, 'get contacts');

		// failed to get contacts response
		if (response.statusCode !== 200) return res.status(400).json({ statusCode, error });

		return res.status(200).json({ statusCode, message: 'success', data });
	}

	@Get('/groups/')
	@Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
	async getGroups(@AuthenticatedUser() user: AuthenticatedUserDto, @Query() query, @Res() res) {
		const { customer_id } = user;
		const trackId = uuidv4();
		const { skip, take } = query;

		// check customer id
		if (customer_id == undefined) return res.status(400).json({ statusCode: 400, error: 'Customer Id is not provided in the token' });

		const request = {
			trackId,
			customerId: customer_id,
			skip: Number(skip),
			take: Number(take)
		};
		this.contactsLog.forwardRequestLog(request, 'get groups');
		this.kafkaHelper.send(trackId, request, 'getContacts', process.env.SMS_CONTACTS_GET_GROUPS_REQUEST_TOPIC);

		const response = await this.polling.poll(trackId);
		const { statusCode, data, error } = response;

		this.contactsLog.receivedResponseForValidateContactsLog(response, 'get groups');

		// failed to get contacts response
		if (response.statusCode !== 200) return res.status(400).json({ statusCode, error });

		return res.status(200).json({ statusCode, message: 'success', data });
	}

	@Get('/groups/:groupId')
	@Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
	async getGroupById(@AuthenticatedUser() user: AuthenticatedUserDto, @Param('groupId') groupId, @Query() query, @Res() res) {
		const { customer_id } = user;
		const trackId = uuidv4();
		const { skip, take } = query;

		// check customer id
		if (customer_id == undefined) return res.status(400).json({ statusCode: 400, error: 'Customer Id is not provided in the token' });

		const request = {
			groupId: groupId,
			trackId,
			customerId: customer_id,
			skip: Number(skip),
			take: Number(take)
		};
		this.contactsLog.forwardRequestLog(request, 'get groups');
		this.kafkaHelper.send(trackId, request, 'getContacts', process.env.SMS_CONTACTS_GET_GROUPS_REQUEST_TOPIC);

		const response = await this.polling.poll(trackId);
		const { statusCode, data, error } = response;

		this.contactsLog.receivedResponseForValidateContactsLog(response, 'get groups');

		// failed to get contacts response
		if (response.statusCode !== 200) return res.status(400).json({ statusCode, error });

		return res.status(200).json({ statusCode, message: 'success', data });
	}

	@Put('/groups/:groupId')
	@Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
	async updateGroupById(@AuthenticatedUser() user: AuthenticatedUserDto, @Body(UpdateGroupValidation) updateRequest, @Param('groupId') groupId, @Res() res) {
		const { customer_id } = user;
		const trackId = uuidv4();

		// Validate send sms request payload with the help of validation pipeline
		if (updateRequest != undefined && updateRequest['error']) {
			return res.status(400).json({ statusCode: 400, error: updateRequest['error'] });
		}

		// check customer id
		if (customer_id == undefined) return res.status(400).json({ statusCode: 400, error: 'Customer Id is not provided in the token' });

		const request = {
			groupId: groupId,
			groupName: updateRequest.groupName,
			trackId,
			customerId: customer_id,
		};
		this.contactsLog.forwardRequestLog(request, 'update group');
		this.kafkaHelper.send(trackId, request, 'updateGroup', process.env.SMS_CONTACTS_UPDATE_GROUP_REQUEST_TOPIC);

		const response = await this.polling.poll(trackId);
		const { statusCode, data, error } = response;

		this.contactsLog.receivedResponseForValidateContactsLog(response, 'update group');

		// failed to get contacts response
		if (response.statusCode !== 200) return res.status(400).json({ statusCode, error });

		return res.status(200).json({ statusCode, message: 'success', data });
	}

	@Delete('/groups/:groupId')
	@Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
	async deleteGroup(@AuthenticatedUser() user: AuthenticatedUserDto, @Param('groupId') groupId, @Res() res) {
		const { customer_id } = user;
		const trackId = uuidv4();

		// check customer id
		if (customer_id == undefined) return res.status(400).json({ statusCode: 400, error: 'Customer Id is not provided in the token' });

		const request = {
			groupId: groupId,
			trackId,
			customerId: customer_id,
		};
		this.contactsLog.forwardRequestLog(request, 'delete group');
		this.kafkaHelper.send(trackId, request, 'deleteGroup', process.env.SMS_CONTACTS_DELETE_GROUP_REQUEST_TOPIC);

		const response = await this.polling.poll(trackId);
		const { statusCode, data, error } = response;

		this.contactsLog.receivedResponseForValidateContactsLog(response, 'delete group');

		// failed to get contacts response
		if (response.statusCode !== 200) return res.status(400).json({ statusCode, error });

		return res.status(200).json({ statusCode, message: 'success', data });
	}

	@Delete('/contacts/:contactId')
	@Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
	async deleteContact(@AuthenticatedUser() user: AuthenticatedUserDto, @Param('contactId') contactId, @Res() res) {
		const { customer_id } = user;
		const trackId = uuidv4();

		// check customer id
		if (customer_id == undefined) return res.status(400).json({ statusCode: 400, error: 'Customer Id is not provided in the token' });

		const request = {
			contactId: contactId,
			trackId,
			customerId: customer_id,
		};
		this.contactsLog.forwardRequestLog(request, 'delete contact');
		this.kafkaHelper.send(trackId, request, 'deleteContact', process.env.SMS_CONTACTS_DELETE_CONTACT_REQUEST_TOPIC);

		const response = await this.polling.poll(trackId);
		const { statusCode, data, error } = response;

		this.contactsLog.receivedResponseForValidateContactsLog(response, 'delete contact');

		// failed to get contacts response
		if (response.statusCode !== 200) return res.status(400).json({ statusCode, error });

		return res.status(200).json({ statusCode, message: 'success', data });
	}

	@MessagePattern(process.env.SMS_CONTACTS_VALIDATE_RESPONSE_TOPIC)
	async listenToValidateResponse(@Payload() { value }) {
		await this.polling.setData(value.trackId, value);
	}

	@MessagePattern(process.env.SMS_CONTACTS_GET_CONTACTS_RESPONSE_TOPIC)
	async listenToGetContactsResponse(@Payload() { value }) {
		await this.polling.setData(value.trackId, value);
	}

	@MessagePattern(process.env.SMS_CONTACTS_GET_CONTACTS_BY_GROUP_ID_RESPONSE_TOPIC)
	async listenToGetContactsByGroupIdResponse(@Payload() { value }) {
		await this.polling.setData(value.trackId, value);
	}

	@MessagePattern(process.env.SMS_CONTACTS_GET_GROUPS_RESPONSE_TOPIC)
	async listenToGetGroupsResponse(@Payload() { value }) {
		await this.polling.setData(value.trackId, value);
	}

	@MessagePattern(process.env.SMS_CONTACTS_UPDATE_GROUP_RESPONSE_TOPIC)
	async listenToUpdateGroupesponse(@Payload() { value }) {
		await this.polling.setData(value.trackId, value);
	}

	@MessagePattern(process.env.SMS_CONTACTS_UPDATE_CONTACT_RESPONSE_TOPIC)
	async listenToUpdateContactResponse(@Payload() { value }) {
		await this.polling.setData(value.trackId, value);
	}

	@MessagePattern(process.env.SMS_CONTACTS_DELETE_GROUP_RESPONSE_TOPIC)
	async listenToDeleteGroupResponse(@Payload() { value }) {
		await this.polling.setData(value.trackId, value);
	}

	@MessagePattern(process.env.SMS_CONTACTS_DELETE_CONTACT_RESPONSE_TOPIC)
	async listenToDeleteContactResponse(@Payload() { value }) {
		await this.polling.setData(value.trackId, value);
	}
}
