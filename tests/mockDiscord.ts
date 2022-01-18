export const mockMember = (id = "") => ({
	id: id,
	roles: {
		cache: {
			has: jest.fn(),
		},
	},
});
