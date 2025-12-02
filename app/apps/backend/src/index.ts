import { SupabaseWrapper } from './utils/supabase_wrapper'
import expressws from "express-ws";

import express, { Express, NextFunction, Request, Response } from 'express';
import fileUpload from 'express-fileupload';

import dotenv from "dotenv";
import { Utils } from './utils/utils';
import bodyParser from 'body-parser';
import cors from "cors";

import logger from './logger';
import { environment, SUPABASE_URL } from './environment';
import { EndpointController, RequestType, WebSocketEndpointController } from './interfaces/index';
import { usuarioController } from './controllers/usuarios';
import { alunoController } from './controllers/alunos';
import { docenteController } from './controllers/docentes';
import { turmaController } from './controllers/turmas';
import { presencaController } from './controllers/presencas';
import { justificativaController } from './controllers/justificativas';
import { advertenciaController } from './controllers/advertencias';
import { authController } from './controllers/auth';
import { notificacaoController } from './controllers/notificacoes';
import { responsavelController } from './controllers/responsaveis';
import { acompanhamentoController } from './controllers/acompanhamentos';
import { conteudosController } from './controllers/conteudos';
import { documentosController } from './controllers/documentos';
import { logsController } from './controllers/logs';


dotenv.config();

SupabaseWrapper.init();

const router = express.Router();

import { AlunosController } from './controllers/alunosController';

const controllers: EndpointController[] = [
    authController,
    usuarioController,
    alunoController,
    docenteController,
    turmaController,
    presencaController,
    justificativaController,
    advertenciaController,
    notificacaoController,
    responsavelController,
    acompanhamentoController,
    conteudosController,
    documentosController,
    logsController,
    new AlunosController()
];

const wsControllers: WebSocketEndpointController[] = [
];

controllers.forEach(controller => {
    logger.info(`registering controller: ${controller.name}`);
    Object.keys(controller.routes).forEach(route_name => {
        const routePairs = controller.routes[route_name];

        if (!routePairs) return;

        routePairs.forEach(routePair => {
            const method = routePair.key;
            const callback = routePair.value;

            switch (method) {
                case RequestType.GET:
                    router.get(`/${controller.name}/${route_name}`, async (req: Request, res: Response) => {
                        try {
                            await callback(req, res);
                        } catch (error) {
                            res.status(500).json({ error: 'Internal server error' });
                        }
                    });
                    break;
                case RequestType.POST:
                    router.post(`/${controller.name}/${route_name}`, async (req: Request, res: Response) => {
                        try {
                            await callback(req, res);
                        } catch (error) {
                            res.status(500).json({ error: 'Internal server error' });
                        }
                    });
                    break;
                case RequestType.PUT:
                    router.put(`/${controller.name}/${route_name}`, async (req: Request, res: Response) => {
                        try {
                            await callback(req, res);
                        } catch (error) {
                            res.status(500).json({ error: 'Internal server error' });
                        }
                    });
                    break;
                case RequestType.PATCH:
                    router.patch(`/${controller.name}/${route_name}`, async (req: Request, res: Response) => {
                        try {
                            await callback(req, res);
                        } catch (error) {
                            res.status(500).json({ error: 'Internal server error' });
                        }
                    });
                    break;
                case RequestType.DELETE:
                    router.delete(`/${controller.name}/${route_name}`, async (req: Request, res: Response) => {
                        try {
                            await callback(req, res);
                        } catch (error) {
                            res.status(500).json({ error: 'Internal server error' });
                        }
                    });
                    break;
                default:
                    break;
            }
        });
    });
});

const app: Express = express();

expressws(app);

app.use(cors());
app.options('*', cors());

app.use(fileUpload())
app.use(bodyParser.json({ limit: 500 * 1024 * 1024, }));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    logger.info('[health][get] Health check requested');
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: environment.NODE_ENV,
        uptime: process.uptime()
    });
});

app.use(router);

// Register WebSocket routes
wsControllers.forEach(wsController => {
    Object.keys(wsController.wsRoutes).forEach(routeName => {
        const handler = wsController.wsRoutes[routeName];
        // @ts-ignore - express-ws augments app with ws()
        (app as any).ws(`/${wsController.name}/${routeName}`, handler);
    });
});
// Redirect Velopack feed/assets under a catch-all to Supabase Storage using signed URLs,
// so it works whether the bucket is public or private.




// Global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Global error handler:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
    });

    res.status(500).json({
        error: 'Internal server error',
        message: environment.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        ...(environment.NODE_ENV === 'development' && { stack: error.stack })
    });
});

const PORT = process.env.PORT ?? 6140;

// Start server
const server = app.listen(PORT, () => {
    console.log(`Starting server on port ${PORT}`);
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📊 Health check: http://localhost:${PORT}/health`);
    logger.info(`🔗 API: http://localhost:${PORT}/`);
    logger.info(`🌍 Environment: ${environment.NODE_ENV}`);
    logger.info(`🔌 Supabase URL: ${SUPABASE_URL ? 'Configured' : 'Not configured'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

export { app };