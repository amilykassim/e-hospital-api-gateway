import { Controller, Get, Headers, Query, Res } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
require('dotenv').config();

@Controller('/api/v1/auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
  ) { }


  @Get('/timelineEventsHistory')
  async getTimelineEvents() {
    // Check customer id
    // const { customer_id } = user;
    // if (customer_id == undefined) return res.status(400).json({ statusCode: 400, error: 'Customer Id is not provided in the token' });

    // const result = await this.AuthenticationService.getTimelineEvents(customer_id);

    // // check if there is data
    // if (result.length == 0) {
    //   return res.status(404).json({ statusCode: 404, message: "You have no timeline events history. Please try again later. If the problem persists please contact Oltranz support team." });
    // }

    // return res.status(200).json({ statusCode: 200, data });
  }
}
