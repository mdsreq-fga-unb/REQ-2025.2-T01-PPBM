import { Pair } from "../utils/utils";
import { Request, Response } from 'express';
import { WebsocketRequestHandler } from 'express-ws';

export enum RequestType {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
}

export interface EndpointController {
    name: string;
    routes: {
        [key: string]: Pair<RequestType, (req: Request, res: Response) => Promise<Response | void>>
    };
}

export interface WebSocketEndpointController {
    name: string;
    wsRoutes: {
        [key: string]: WebsocketRequestHandler;
    };
}