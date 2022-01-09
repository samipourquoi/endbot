module.exports = {
	root: true,
	env: {
		es2021: true,
		node: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 2021,
		sourceType: "module",
	},
	plugins: [
		"@typescript-eslint",
		"prettier",
	],
	rules: {
		"no-duplicate-imports": ["error", { includeExports: true }],
		"no-unreachable-loop": "error",

		// The following are formatting rules
		"brace-style": ["error", "allman", { allowSingleLine: true }],
		"comma-dangle": [
			"error",
			{
				arrays: "always-multiline",
				objects: "always-multiline",
				imports: "always-multiline",
				exports: "always-multiline",
				functions: "always-multiline",
			},
		],
		"eol-last": ["error", "never"],
		"function-call-argument-newline": ["error", "consistent"],
		indent: ["error", "tab"],
		"line-comment-position": "off",
		"linebreak-style": ["error", "unix"],
		"max-statements-per-line": ["error", { max: 1 }],
		"multiline-ternary": ["error", "always-multiline"],
		"no-whitespace-before-property": "error",
		"padded-blocks": ["error", "never"],
		quotes: ["error", "double", { avoidEscape: true }],
		semi: ["error", "always"],
		"space-infix-ops": "error",
	},
};