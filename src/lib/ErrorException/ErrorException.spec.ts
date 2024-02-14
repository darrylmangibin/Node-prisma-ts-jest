import ErrorException from '.';

describe('ErrorException', () => {
	it('should return correct props', () => {
		const statusCode = 500;
		const error = {
			cause: 'Network failed',
		};

		const errorException = new ErrorException(statusCode, error);

		console.log(errorException);

		expect(errorException).toEqual(
			expect.objectContaining({
				statusCode,
				error,
				message: ErrorException.errorStatusCode[statusCode],
			}),
		);
	});
});
