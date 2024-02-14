import { MainApp } from '.';
import express, { Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { notFoundMiddleware } from '@middlewares/notFoundMiddleware';
import { errorMiddleware } from '@middlewares/errorMiddleware';

const mockJson = jest.fn();

const app = {
	listen: jest.fn(),
	use: jest.fn(),
};

jest.mock('express', () => () => app);
jest.mock('cors');
jest.mock('helmet');
jest.mock('compression');
jest.mock('morgan');

express.json = mockJson;

describe('MainApp', () => {
	const port = 5001;
	const route = {
		path: 'users',
		router: jest.fn() as unknown as Router,
		registerRoutes: jest.fn(),
	} satisfies AppRoute;

	it('should initialize the application', () => {
		const mainApp = new MainApp(port, [route]);

		mainApp.listen();

		expect(app.listen).toHaveBeenCalled();
		expect(app.use).toHaveBeenCalledWith(express.json());
		expect(app.use).toHaveBeenCalledWith(cors());
		expect(app.use).toHaveBeenCalledWith(helmet());
		expect(app.use).toHaveBeenCalledWith(compression());
		expect(app.use).toHaveBeenCalledWith(morgan('dev'));
		expect(app.use).toHaveBeenCalledWith(`/api/${route.path}`, route.router);
		expect(app.use).toHaveBeenCalledWith(notFoundMiddleware);
		expect(app.use).toHaveBeenCalledWith(errorMiddleware);
	});
});
