export const setBearerToken = (token: string) => {
	return {
		Authorization: `Bearer ${token}`,
	};
};
