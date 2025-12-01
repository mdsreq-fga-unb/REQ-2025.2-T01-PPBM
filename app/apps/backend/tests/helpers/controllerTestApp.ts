import express, { Express, Request, Response } from 'express';
import { EndpointController, RequestType } from '../../src/interfaces';

export function registerController(app: Express, controller: EndpointController): void {
  Object.entries(controller.routes).forEach(([routeName, handlers]) => {
    handlers.forEach(({ key, value }) => {
      const path = `/${controller.name}/${routeName}`;
      switch (key) {
        case RequestType.GET:
          app.get(path, async (req: Request, res: Response) => {
            try {
              await value(req, res);
            } catch (error) {
              res.status(500).json({ error: 'Test handler failure', details: (error as Error).message });
            }
          });
          break;
        case RequestType.POST:
          app.post(path, async (req: Request, res: Response) => {
            try {
              await value(req, res);
            } catch (error) {
              res.status(500).json({ error: 'Test handler failure', details: (error as Error).message });
            }
          });
          break;
        case RequestType.PUT:
          app.put(path, async (req: Request, res: Response) => {
            try {
              await value(req, res);
            } catch (error) {
              res.status(500).json({ error: 'Test handler failure', details: (error as Error).message });
            }
          });
          break;
        case RequestType.PATCH:
          app.patch(path, async (req: Request, res: Response) => {
            try {
              await value(req, res);
            } catch (error) {
              res.status(500).json({ error: 'Test handler failure', details: (error as Error).message });
            }
          });
          break;
        case RequestType.DELETE:
          app.delete(path, async (req: Request, res: Response) => {
            try {
              await value(req, res);
            } catch (error) {
              res.status(500).json({ error: 'Test handler failure', details: (error as Error).message });
            }
          });
          break;
        default:
          throw new Error(`Unsupported method ${key}`);
      }
    });
  });
}

export function createControllerApp(controller: EndpointController): Express {
  const app = express();
  app.use(express.json());
  registerController(app, controller);
  return app;
}

