export default {
    // Automatically clear mock calls, instances and results before every test
    clearMocks: true,
    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: true,
    // An array of glob patterns indicating a set of files for which coverage information should be
    // collected
    collectCoverageFrom: ["src/**/*.ts"],
    extensionsToTreatAsEsm: [".ts"],
    // A map from regular expressions to module names or to arrays of module names that allow to
    // stub out resources with a single module
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    // The root directory that Jest should scan for tests and modules within
    rootDir: "../",
    // A list of paths to directories that Jest should use to search for files in
    roots: ["src", "tests"],
    // A map from regular expressions to paths to transformers
    transform: {
        "^.+\\.tsx?$": "@swc/jest",
    },
};
