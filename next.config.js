const isGithubActions = process.env.GITHUB_ACTIONS || false;

let assetPrefix = '';
let basePath = 'daily-tracker';

if (isGithubActions) {
  const repo = process.env.GITHUB_REPOSITORY.replace(/.*?\//, ''); // Extract the repository name
  assetPrefix = `/${repo}/`;
  basePath = `/${repo}`;
}

module.exports = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true, // Disable image optimization for static export
  },
  assetPrefix: assetPrefix || '', // Ensure assetPrefix is always defined
  basePath: basePath || 'daily-tracker', // Ensure basePath is always defined
};
