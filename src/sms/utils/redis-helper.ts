import { Injectable } from '@nestjs/common';
const asyncRedis = require('async-redis');
require('dotenv').config(); // setup the necessary kafka configs

@Injectable()
export class RedisHelper {
	private readonly client;
	private readonly appName = process.env.APPLICATION_NAME;

	constructor() {
		this.client = asyncRedis.createClient(`//${process.env.REDIS_URL}`);
		this.client.on('error', function (error) {
			console.error(error);
		});

		this.client.on('connect', function () {
			console.log('Connected to redis successfully');
		});
	}

	async set(key: string, value: any, expiryTime?: number) {
		// The key should only last for 1 day
		await this.client.set(key, JSON.stringify(value), 'EX', (expiryTime) ? expiryTime : 86400);
	}

	async getAndDel(key: string) {
		const result = JSON.parse(await this.client.get(key));

		// delete data from redis after fetching it from redis
		if (result !== null) {
			await this.del(key);
		}
		return result;
	}

	async get(key: string) {
		return JSON.parse(await this.client.get(key));
	}

	async del(key: string) {
		return await this.client.del(key);
	}

	async setPollingData(key: string, value: any, ttl?: number) {
		// The key should only last for 5 minutes
		await this.client.set(`${this.appName}-${key}`, JSON.stringify(value), "EX", ttl || 300); // 5 minutes
	}

	async getPollingData(key: string) {
		return JSON.parse(await this.client.get(`${this.appName}-${key}`));
	}

	async delPollingData(key: string) {
		return await this.client.del(`${this.appName}-${key}`);
	}
}
