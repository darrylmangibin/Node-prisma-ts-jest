export type ErrorStatusCode = 400 | 401 | 403 | 404 | 422 | 500 | 502 | 503;

class ErrorException extends Error {
	static errorStatusCode: Record<ErrorStatusCode, string>;
	constructor(
		public statusCode: ErrorStatusCode,
		public error?: Record<string, unknown>,
	) {
		const errorStatusCode: Record<ErrorStatusCode, string> = {
			400: 'Bad request',
			401: 'Unauthorized',
			403: 'Forbidden',
			404: 'Not found',
			422: 'Unprocessable entity',
			500: 'Internal server error',
			502: 'Bad gateway',
			503: 'Service unavailable',
		};
		super(errorStatusCode[statusCode]);

		ErrorException.errorStatusCode = errorStatusCode;
	}
}

export default ErrorException;
