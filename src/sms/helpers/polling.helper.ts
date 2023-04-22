import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { RedisHelper } from "../utils/redis-helper";

@Injectable()
export class PollingHelper {
  constructor(private readonly redis: RedisHelper) { }

  sleep(millsec = 10) {
    return new Promise((resolve) => {
      setTimeout(resolve, millsec);
    });
  }

  async poll(trackId: string, times = 300) {
    let data;
    for (let i = 0; i < times; i++) {
      await this.sleep(100);
      data = await this.redis.getPollingData(trackId);
      if (data) {
        break;
      }
    }

    if (!data) throw new HttpException("Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR);

    if (data.status == "FAILED") {
      if (!data.response) throw new HttpException(data.response, HttpStatus.INTERNAL_SERVER_ERROR);

      throw new HttpException(data.response.message, data.response.statusCode);
    }
    return data;
  }

  async setData(trackId: string, data: any) {
    await this.redis.setPollingData(trackId, data);
  }
}
