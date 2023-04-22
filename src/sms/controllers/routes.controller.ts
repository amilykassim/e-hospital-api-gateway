import { ValidateRegisterIDRequestAdmin } from './../validation/registerid-request-admin-validation';
import { RegisterIDRequestDTO } from './../dto/registerid-request.dto';
import { ValidateApproveRequest } from './../validation/approve-request-validation';
import { ValidateRegisterIDRequest } from './../validation/registerid-request-validation';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res } from '@nestjs/common';
import { AuthenticatedUser, RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { AuthenticatedUserDto } from '../dto/authenticated-user.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PollingHelper } from '../helpers/polling.helper';
import { RoutesService } from '../services/routes.service';
import { ValidateRouteRequest } from '../validation/route-request-validation';
import { RouteRequestDTO } from '../dto/route-request.dto';
import { RoutesHelper } from '../helpers/routes.helper';
import { UpdateValidateRouteRequest } from '../validation/update-route-request-validation';
import { RoutesLog } from '../logger/routes.logs';
import { ApproveRequestDTO } from '../dto/approve-request.dto';
import { v4 as uuidv4 } from 'uuid';
import { ValidateDeleteSenderIdRequest } from '../validation/delete-request-validation';
require('dotenv').config();

@Controller('/api/v1')
export class RoutesController {
	constructor(
		private readonly polling: PollingHelper,
		private readonly routeService: RoutesService,
		private readonly routeHelper: RoutesHelper,
		private readonly routesLog: RoutesLog,
	) { }

	@Post('admin/sms/routes')
	@Roles({ roles: ['basesms_admin'] })
	async setRoute(@AuthenticatedUser() user: AuthenticatedUserDto, @Body(ValidateRouteRequest) request: RouteRequestDTO, @Res() res) {
		this.routesLog.incomingRequestLog(request);
		this.routeHelper.setTrackIdAndCustomerId(request, user);

		const invalidResponse = this.routeHelper.validatePayload(request);
		if (invalidResponse) return res.status(400).json(invalidResponse);

		const response = await this.routeService.sendSMSRouteRequest(request, process.env.SMS_GW_SET_ROUTE_REQUEST_TOPIC, 'setSMSRoute');
		this.routesLog.smsGwResponseLog(response);
		const { statusCode, message, error, trackId } = response;

		if (statusCode !== 200) return res.status(400).json({ trackId, statusCode, error });
		return res.status(200).json({ trackId, statusCode, message });
	}

	@Get('admin/sms/routes')
	@Roles({ roles: ['basesms_admin'] })
	async getRoute(@AuthenticatedUser() user: AuthenticatedUserDto, @Body() request: RouteRequestDTO, @Res() res) {
		this.routesLog.incomingRequestLog(request);
		this.routeHelper.setTrackIdAndCustomerId(request, user);

		const invalidResponse = this.routeHelper.validatePayload(request);
		if (invalidResponse) return res.status(400).json(invalidResponse);

		const response = await this.routeService.sendSMSRouteRequest(request, process.env.SMS_GW_GET_ROUTE_REQUEST_TOPIC, 'getSMSRoute');
		this.routesLog.smsGwResponseLog(response);
		const { statusCode, message, error, data, trackId } = response;

		if (statusCode !== 200) return res.status(400).json({ trackId, statusCode, error });
		return res.status(200).json({ trackId, statusCode, message, data });
	}

	@Put('admin/sms/routes/:routeId')
	@Roles({ roles: ['basesms_admin'] })
	async updateRoute(@AuthenticatedUser() user: AuthenticatedUserDto, @Body(UpdateValidateRouteRequest) request: RouteRequestDTO, @Param('routeId') routeId, @Res() res) {
		request['routeId'] = routeId;
		this.routesLog.incomingRequestLog(request);
		this.routeHelper.setTrackIdAndCustomerId(request, user);

		const invalidResponse = this.routeHelper.validatePayload(request);
		if (invalidResponse) return res.status(400).json(invalidResponse);

		const response = await this.routeService.sendSMSRouteRequest(request, process.env.SMS_GW_UPDATE_ROUTE_REQUEST_TOPIC, 'updateSMSRoute');
		this.routesLog.smsGwResponseLog(response);
		const { statusCode, message, error, data, trackId } = response;

		if (statusCode !== 200) return res.status(400).json({ trackId, statusCode, error });
		return res.status(200).json({ trackId, statusCode, message, data });
	}

	@Delete('admin/sms/routes/:routeId')
	@Roles({ roles: ['basesms_admin'] })
	async deleteRoute(@AuthenticatedUser() user: AuthenticatedUserDto, @Body(UpdateValidateRouteRequest) request: RouteRequestDTO, @Param('routeId') routeId, @Res() res) {
		request['routeId'] = routeId;
		this.routesLog.incomingRequestLog(request);
		this.routeHelper.setTrackIdAndCustomerId(request, user);

		const invalidResponse = this.routeHelper.validatePayload(request);
		if (invalidResponse) return res.status(400).json(invalidResponse);

		const response = await this.routeService.sendSMSRouteRequest(request, process.env.SMS_GW_DELETE_ROUTE_REQUEST_TOPIC, 'deleteSMSRoute');
		this.routesLog.smsGwResponseLog(response);
		const { statusCode, message, error, data, trackId } = response;

		if (statusCode !== 200) return res.status(400).json({ trackId, statusCode, error });
		return res.status(200).json({ trackId, statusCode, message, data });
	}

	@Post('admin/sms/senderId')
	@Roles({ roles: ['basesms_admin', 'senderid_approver'] })
	async registerSenderIdByAdmin(@AuthenticatedUser() user: AuthenticatedUserDto, @Body(ValidateRegisterIDRequestAdmin) request, @Res() res) {
		this.routeHelper.setTrackIdAndCustomerId(request, user);
		this.routesLog.incomingRequestLog(request);

		const invalidResponse = this.routeHelper.validatePayload(request);
		if (invalidResponse) return res.status(400).json(invalidResponse);

		// if it's common senderIDs, set admin/sender_id approval personal info
		const isSenderIdsCommon = request['senderIds'][0].isCommon;
		if (isSenderIdsCommon) {
			request.customerName = user['preferred_username'];
			request.email = user.email;
			request = this.routeHelper.setPersonalInfo(request);
		}

		request['isSenderIdApprover'] = true;
		const response = await this.routeService.sendSMSRouteRequest(request, process.env.SMS_GW_REGISTER_SENDER_ID_REQUEST_TOPIC, 'registerSenderId');
		this.routesLog.smsGwSenderIdResponseAdminLog(response, request);

		const { statusCode, message, error, trackId, data } = response;

		if (statusCode !== 200) return res.status(statusCode).json({ trackId, statusCode, error });
		return res.status(200).json({ trackId, statusCode, message, data });
	}

	@Post('sms/senderId')
	@Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
	async registerSenderId(@AuthenticatedUser() user: AuthenticatedUserDto, @Body(ValidateRegisterIDRequest) request, @Res() res) {
		this.routeHelper.setTrackIdAndCustomerId(request, user);
		this.routesLog.incomingRequestLog(request);

		// add customer name and email (it's for logs)
		request.customerName = user['preferred_username'];
		request.email = user.email;

		const invalidResponse = this.routeHelper.validatePayload(request);
		if (invalidResponse) return res.status(400).json(invalidResponse);

		request = this.routeHelper.setPersonalInfo(request);

		const response = await this.routeService.sendSMSRouteRequest(request, process.env.SMS_GW_REGISTER_SENDER_ID_REQUEST_TOPIC, 'registerSenderId');
		this.routesLog.smsGwSenderIdResponseLog(response, request, user);

		const { statusCode, message, error, trackId, data } = response;

		if (statusCode !== 200) return res.status(statusCode).json({ trackId, statusCode, error });
		return res.status(200).json({ trackId, statusCode, message, data });
	}

	@Post('admin/sms/senderId/approve')
	@Roles({ roles: ['basesms_admin', 'senderid_approver'] })
	async approveSenderId(@AuthenticatedUser() user: AuthenticatedUserDto, @Body(ValidateApproveRequest) request: ApproveRequestDTO, @Res() res) {
		this.routeHelper.setTrackIdAndCustomerId(request, user);
		this.routesLog.incomingRequestLog(request);

		const invalidResponse = this.routeHelper.validatePayload(request);
		if (invalidResponse) return res.status(400).json(invalidResponse);

		request.status = 'APPROVED';
		const response = await this.routeService.sendSMSRouteRequest(request, process.env.SMS_GW_APPROVE_OR_REJECT_SENDER_ID_REQUEST_TOPIC, 'approveSenderId');

		const { statusCode, message, error, trackId, data } = response;

		if (statusCode !== 200) return res.status(statusCode).json({ trackId, statusCode, error });

		this.routesLog.smsGwSenderIdApprovedOrRejectedResponseAdminLog(response, request);
		return res.status(200).json({ trackId, statusCode, message, data });
	}

	@Post('admin/sms/senderId/reject')
	@Roles({ roles: ['basesms_admin', 'senderid_approver'] })
	async rejectSenderId(@AuthenticatedUser() user: AuthenticatedUserDto, @Body(ValidateApproveRequest) request: ApproveRequestDTO, @Res() res) {
		this.routeHelper.setTrackIdAndCustomerId(request, user);
		this.routesLog.incomingRequestLog(request);

		const invalidResponse = this.routeHelper.validatePayload(request);
		if (invalidResponse) return res.status(400).json(invalidResponse);

		request.status = 'REJECTED';
		const response = await this.routeService.sendSMSRouteRequest(request, process.env.SMS_GW_APPROVE_OR_REJECT_SENDER_ID_REQUEST_TOPIC, 'rejectSenderId');

		const { statusCode, message, error, trackId, data } = response;

		if (statusCode !== 200) return res.status(statusCode).json({ trackId, statusCode, error });

		this.routesLog.smsGwSenderIdApprovedOrRejectedResponseAdminLog(response, request);
		return res.status(200).json({ trackId, statusCode, message, data });
	}

	@Delete('admin/sms/senderId')
	@Roles({ roles: ['basesms_admin'] })
	async deleteSenderId(@AuthenticatedUser() user: AuthenticatedUserDto, @Body(ValidateDeleteSenderIdRequest) request: ApproveRequestDTO, @Res() res) {
		this.routeHelper.setTrackIdAndCustomerId(request, user);
		this.routesLog.incomingRequestLog(request);

		const invalidResponse = this.routeHelper.validatePayload(request);
		if (invalidResponse) return res.status(400).json(invalidResponse);

		const response = await this.routeService.sendSMSRouteRequest(request, process.env.SMS_GW_DELETE_SENDER_ID_REQUEST_TOPIC, 'deleteSenderId');

		this.routesLog.smsGwResponseLog(response);
		const { statusCode, message, error, trackId, data } = response;

		if (statusCode !== 200) return res.status(statusCode).json({ trackId, statusCode, error });
		return res.status(200).json({ trackId, statusCode, message, data });
	}

	@Get('admin/sms/senderIds')
	@Roles({ roles: ['basesms_admin', 'senderid_approver'] })
	async getSenderIds(@AuthenticatedUser() user: AuthenticatedUserDto, @Query() query, @Body() request: ApproveRequestDTO, @Res() res) {
		this.routeHelper.setTrackIdAndCustomerId(request, user);
		this.routesLog.incomingRequestLog(request);

		const invalidResponse = this.routeHelper.validatePayload(request);
		if (invalidResponse) return res.status(400).json(invalidResponse);

		request['isAdmin'] = true;
		request['search'] = this.routeHelper.removeCaseSensitive(query);
		const response = await this.routeService.sendSMSRouteRequest(request, process.env.SMS_GW_GET_SENDER_IDS_REQUEST_TOPIC, 'getSenderIds');

		this.routesLog.smsGwResponseLog(response);
		const { statusCode, message, error, trackId, data } = response;

		if (statusCode !== 200) return res.status(statusCode).json({ trackId, statusCode, error });
		return res.status(200).json({ trackId, statusCode, message, data });
	}

	@Get('sms/senderIds')
	@Roles({ roles: ['user'], mode: RoleMatchingMode.ANY })
	async getMySenderIds(@AuthenticatedUser() user: AuthenticatedUserDto, @Query() query, @Body() request: ApproveRequestDTO, @Res() res) {
		this.routeHelper.setTrackIdAndCustomerId(request, user);
		this.routesLog.incomingRequestLog(request);

		const invalidResponse = this.routeHelper.validatePayload(request);
		if (invalidResponse) return res.status(400).json(invalidResponse);

		request['search'] = this.routeHelper.removeCaseSensitive(query);
		const response = await this.routeService.sendSMSRouteRequest(request, process.env.SMS_GW_GET_SENDER_IDS_REQUEST_TOPIC, 'getSenderIds');

		this.routesLog.smsGwResponseLog(response);
		const { statusCode, message, error, trackId, data } = response;

		if (statusCode !== 200) return res.status(statusCode).json({ trackId, statusCode, error });
		return res.status(200).json({ trackId, statusCode, message, data });
	}

	@MessagePattern(process.env.SMS_GW_SET_ROUTE_RESPONSE_TOPIC)
	async listenToSettingRouteResponse(@Payload() payload) {
		const { value } = payload;
		await this.polling.setData(value.trackId, value);
	}

	@MessagePattern(process.env.SMS_GW_GET_ROUTE_RESPONSE_TOPIC)
	async listenToGetRouteResponse(@Payload() payload) {
		const { value } = payload;
		await this.polling.setData(value.trackId, value);
	}

	@MessagePattern(process.env.SMS_GW_UPDATE_ROUTE_RESPONSE_TOPIC)
	async listenToUpdateRouteResponse(@Payload() payload) {
		const { value } = payload;
		await this.polling.setData(value.trackId, value);
	}

	@MessagePattern(process.env.SMS_GW_DELETE_ROUTE_RESPONSE_TOPIC)
	async listenToDeleteRouteResponse(@Payload() payload) {
		const { value } = payload;
		await this.polling.setData(value.trackId, value);
	}

	@MessagePattern(process.env.SMS_GW_REGISTER_SENDER_ID_RESPONSE_TOPIC)
	async listenToRegisterSenderIDResponse(@Payload() payload) {
		const { value } = payload;
		await this.polling.setData(value.trackId, value);
	}

	@MessagePattern(process.env.SMS_GW_APPROVE_OR_REJECT_SENDER_ID_RESPONSE_TOPIC)
	async listenToApproveOrRejectSenderIdResponse(@Payload() payload) {
		const { value } = payload;
		await this.polling.setData(value.trackId, value);
	}

	@MessagePattern(process.env.SMS_GW_GET_SENDER_IDS_RESPONSE_TOPIC)
	async listenToGetSenderIdResponse(@Payload() payload) {
		const { value } = payload;
		await this.polling.setData(value.trackId, value);
	}

	@MessagePattern(process.env.SMS_GW_DELETE_SENDER_ID_RESPONSE_TOPIC)
	async listenToDeleteSenderIdResponse(@Payload() { value }) {
		await this.polling.setData(value.trackId, value);
	}
}
