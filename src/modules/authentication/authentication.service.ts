import { Injectable } from '@nestjs/common';
import axios from 'axios';
require('dotenv').config();

@Injectable()
export class AuthenticationService {

  async getBalance(customerId: string) {
    const query = "";

    try {
      const { data } = await axios.get(query);
      return data.data
    } catch (e) {
      return []
    }
  }
}
