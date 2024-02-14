import { AuthRoutes } from '@resources/auth/AuthRoutes';
import { MainApp } from './MainApp';
import { UserRoutes } from '@resources/user/UserRoutes';
import { PostRoutes } from '@resources/post/PostRoutes';
import { CommentRoutes } from '@resources/comment/CommentRoutes';
import { CategoryRoutes } from '@resources/category/CategoryRoutes';

const routes: AppRoute[] = [
	new AuthRoutes(),
	new UserRoutes(),
	new PostRoutes(),
	new CommentRoutes(),
	new CategoryRoutes(),
];

export const server = new MainApp(Number(process.env.PORT || 500), routes);

export const app = server.app;
