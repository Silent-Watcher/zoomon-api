import { networkInterfaces } from 'node:os';
import { Server as HttpServer } from 'node:http';
import { Server as HttpsServer } from 'node:https';
import { INestApplication, LoggerService } from '@nestjs/common';
import { LOCAL_HOST_ADDR } from '../constants/server.constant';
import { styleText } from 'node:util';
import { ConfigService } from '@nestjs/config';

export function getLocalIPAddr(): null | string {
	let localIpAddr: string | null = null;
	const networks = Object.values(networkInterfaces()).flat();

	for (const net of networks) {
		if (net?.internal === false && net.family === 'IPv4') {
			localIpAddr = net.address;
			break;
		}
	}

	return localIpAddr;
}

export type ServerTypes = HttpServer | HttpsServer;

export enum SERVER_PROTOCOLS {
	HTTP = 'http',
	HTTPS = 'https',
}

export type ServerProtocols =
	`${(typeof SERVER_PROTOCOLS)[keyof typeof SERVER_PROTOCOLS]}`;

export function getServerProtocol(server: any): ServerProtocols | undefined {
	if (server instanceof HttpServer) {
		return SERVER_PROTOCOLS.HTTP;
	}

	if (server instanceof HttpsServer) {
		return SERVER_PROTOCOLS.HTTPS;
	}

	return undefined;
}

export function startHttpServer(
	app: INestApplication,
	serverOptions: {
		host: string;
		port: number;
		logger: LoggerService;
	},
) {
	const { host, logger, port } = serverOptions;

	const protocol = getServerProtocol(app.getHttpServer());

	if (!protocol) throw new Error('Unknown Protocol');

	let hostAddrs = [host];

	if ('0.0.0.0' === host) {
		hostAddrs = [LOCAL_HOST_ADDR];
		const localIPAddr = getLocalIPAddr();
		localIPAddr ? hostAddrs.push(localIPAddr) : null;
	}

	const config = app.get(ConfigService);
	const nodeEnv = config.get('environment.nodeEnv');

	let serverLogMsg = (protocol: string, host: string, port: number) => {
		if (nodeEnv === 'development')
			return `Server listening at ${styleText('cyan', `${protocol}://${host}:${port}`)}`;
		return `Server listening at ${protocol}://${host}:${port}`;
	};

	return app.listen(port, host, () => {
		for (const host of hostAddrs) {
			logger.log(serverLogMsg(protocol, host, port));
		}
	});
}
