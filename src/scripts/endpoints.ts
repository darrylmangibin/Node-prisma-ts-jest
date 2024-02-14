import 'reflect-metadata';

import listEnpoints from 'express-list-endpoints';
import { app } from '@main/server';

console.table(
	listEnpoints(app).filter((endpoint) =>
		endpoint.path.includes(process.argv[2] || ''),
	),
);
