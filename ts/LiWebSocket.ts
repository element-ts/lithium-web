/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */


import {
	LiCommandRegistry,
	LiCommandRegistryStructure,
	LiSocket
} from "@element-ts/lithium-core";
import {PromResolve, PromReject} from "@elijahjcobb/prom-type";

export interface LiWebSocketConfig {
	address: string;
	debug?: boolean;
	bearer?: string;
	allowPeerToPeer?: boolean;
}

export class LiWebSocket<
	LC extends LiCommandRegistryStructure<LC>,
	RC extends LiCommandRegistryStructure<RC>,
	SC extends LiCommandRegistryStructure<SC> = any
	> extends LiSocket<LC, RC, SC> {

	private constructor(config: LiWebSocketConfig, socket: WebSocket, commandRegistry?: LiCommandRegistry<LC>, id: string = "", onDidReceiveId: ((() => void) | undefined) = undefined, allowPeerToPeer: boolean = false, debug?: boolean) {

		if (config.debug) {
			LiWebSocket.logger.enable();
			LiWebSocket.logger.setTitle("@element-ts/lithium LiWebSocket");
		}

		super({
			close: socket.close,
			send: socket.send,
			onMessage: (handler: (data: any) => void): void => {
				socket.onmessage = ((event: MessageEvent): void => {
					handler(event.data);
				});
			},
			onError: (handler: (err: Error) => void): void => {
				socket.onerror = ((event: Event): void => {
					handler(new Error("An error occurred in socket."));
				});
			},
			onClose: (handler: (code?: number, reason?: string) => void): void => {
				socket.onclose = ((event: CloseEvent): void => {
					handler(event.code, event.reason);
				});
			}
		}, commandRegistry, id, onDidReceiveId, allowPeerToPeer, debug);

	}

	public static init<LC extends LiCommandRegistryStructure<LC>, RC extends LiCommandRegistryStructure<RC>, SC extends LiCommandRegistryStructure<SC> = any>(config: LiWebSocketConfig): Promise<LiWebSocket<LC, RC, SC>> {

		if (config.debug) LiWebSocket.logger.enable();

		return new Promise((resolve: PromResolve<LiWebSocket<LC, RC, SC>>, reject: PromReject): void => {

			LiWebSocket.logger.log(`Preparing to open new socket to: '${config.address}'.`);
			const ws: WebSocket = new WebSocket(config.address);
			LiWebSocket.logger.log(`Waiting to open new socket with: '${config.address}'.`);

			ws.onopen = (): void => {

				LiWebSocket.logger.log(`Did open new socket with: '${config.address}'.`);
				LiWebSocket.logger.log("Waiting for my id.");

				const socket: LiWebSocket<LC, RC, SC> = new LiWebSocket<LC, RC, SC>(config, ws, undefined, undefined, (): void => {
					LiWebSocket.logger.log(`Did receive my id: ${socket.getId()}.`);
					resolve(socket);
				});

				LiWebSocket.logger.log(`Did create LiSocket instance from WS socket.`);


			};

		});

	}

}