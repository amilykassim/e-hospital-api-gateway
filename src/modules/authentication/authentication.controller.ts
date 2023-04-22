import { Body, Controller, Get, Headers, HttpStatus, Post, Query, Res } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
require('dotenv').config();

@Controller('/api/v1/auth')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
  ) { }


  @Post('/register')
  async registerUser(@Body() payload, @Res() res) {

    const { username, email, phone, password } = payload;

    let error, data;

    if (username) {
      // const { error: err, data: results } = await this.authService.registerByUsername(username, password);
      // error =  err;
      // data =  results;
    }

    else if (email) {
      const { error: err, data: results } = await this.authService.registerByEmail(email, password);
      error = err;
      data = results;
    }

    else if (phone) {
      // const { error: err, data: results } = await this.authService.registerByPhone(phone, password);
      // error =  err;
      // data =  results;
    }

    if (error) return res.status(HttpStatus.BAD_REQUEST).json({ error: error.response.data });

    return res.status(HttpStatus.OK).json({ data });
  }

  @Post('/login')
  async addMedicine(@Body() payload, @Res() res) {

    const { email, password } = payload;

    const { error, data } = await this.authService.login(email, password);

    if (error) return res.status(HttpStatus.BAD_REQUEST).json({ error: error.response.data });

    return res.status(HttpStatus.OK).json({ data });
  }
}
