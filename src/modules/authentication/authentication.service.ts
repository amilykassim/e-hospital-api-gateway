import { Injectable } from '@nestjs/common';
import axios from 'axios';
require('dotenv').config();

@Injectable()
export class AuthenticationService {

  async registerByEmail(email: string, password: string) {
    try {
      const { status, data } = await axios.post(`${process.env.BASE_URL}/register`, { email, password });

      return { status, data }

    } catch (error) {
      return { error }
    }
  }

  async login(email: string, password: string) {
    try {
      const { status, data } = await axios.post(`${process.env.BASE_URL}/login`, { email, password });

      return { status, data }

    } catch (error) {
      return { error }
    }
  }
}
