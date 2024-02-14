import express, { Express } from 'express';
import 'colors';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { notFoundMiddleware } from '@middlewares/notFoundMiddleware';
import { errorMiddleware } from '@middlewares/errorMiddleware';
import boolParser from 'express-query-boolean';

export class MainApp {
	public app: Express = express();

	constructor(public port: number, routes: AppRoute[]) {
		this.initializeMiddlewares();
		this.initializeRoutes(routes);
		this.initializeNotFoundMiddleware();

		this.initializeErrorMiddleware();
	}

	public listen() {
		this.app.listen(this.port, () => {
			console.log(
				`Server running in ${process.env.NODE_ENV} at port ${this.port}`.yellow
					.underline.bold,
			);
		});
	}

	private initializeMiddlewares() {
		this.app.use(express.json());
		this.app.use(boolParser());
		this.app.use(cors());
		this.app.use(helmet());
		this.app.use(compression());
		this.app.use(morgan('dev'));
	}

	private initializeRoutes(routes: AppRoute[]) {
		routes.forEach((route) => {
			this.app.use(`/api/${route.path}`, route.router);
		});
	}

	private initializeNotFoundMiddleware() {
		this.app.use(notFoundMiddleware);
	}

	private initializeErrorMiddleware() {
		this.app.use(errorMiddleware);
	}
}
