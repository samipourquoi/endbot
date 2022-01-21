/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const mockMember = (id = "") => ({
	id: id,
	roles: {
		cache: {
			has: jest.fn(),
		},
	},
});
