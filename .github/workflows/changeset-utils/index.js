const path = require('path');
const readPackageUp = require('read-package-up');

// @todo
// Check if maintainer can modify the head
// Put a suitable comments

const getFormattedCommits = async (pullRequest, github) => {
  const commits = await github.rest.pulls.listCommits({
    owner: pullRequest.base.repo.owner.login,
    repo: pullRequest.base.repo.name,
    pull_number: pullRequest.number,
  });

  return commits.data.map((commit) => {
    return {
      commit_sha: commit.sha.slice(0, 7), // first 7 characters of the commit sha is enough to identify the commit
      commit_message: commit.commit.message,
    };
  });
}

const getReleasedPackages = async (pullRequest, github) => {
  const files = await github.rest.pulls.listFiles({
    owner: pullRequest.base.repo.owner.login,
    repo: pullRequest.base.repo.name,
    pull_number: pullRequest.number,
  });

  const releasedPackages = [];
  const ignoredFiles = ['yarn.lock', 'package-lock.json', 'pnpm-lock.yaml'];
  for (const file of files.data) {
    if (!ignoredFiles.includes(file.filename)) {
      const cwd = path.resolve(path.dirname(file.filename));
      const { packageJson } = await readPackageUp(cwd);
      if (!releasedPackages.includes(packageJson.name)) {
        releasedPackages.push(packageJson.name);
      }
    } 
  }
  return releasedPackages;
}


const getReleaseNotes = async (pullRequest, github) => {
  const commits = await getFormattedCommits(pullRequest, github);
  /**
   * Release notes are generated from the commits.
   * Format:
   * - title
   * - commit_sha: commit_message (Array of commits)
   */
  const releaseNotes = pullRequest.title + '\n\n' + commits.map((commit) => {
    return `- ${commit.commit_sha}: ${commit.commit_message}`;
  }).join('\n');

  return releaseNotes;
}


const getChangesetContents = async (pullRequest, github) => {
  const title = pullRequest.title;
  const releaseType = title.split(':')[0];
  let releaseVersion = 'patch';
  switch (releaseType) {
    case 'fix':
      releaseVersion = 'patch';
    case 'feat':
      releaseVersion = 'minor';
    case 'fix!':
      releaseVersion = 'major';
    case 'feat!':
      releaseVersion = 'major';
    default:
      releaseVersion = 'patch';
  }

  const releaseNotes = await getReleaseNotes(pullRequest, github);
  const releasedPackages = await getReleasedPackages(pullRequest, github);

  const changesetContents = releasedPackages.map((pkg) => {
    return `---\n'${pkg}': ${releaseVersion}\n---\n\n${releaseNotes}\n\n`;
  }).join('\n');

  return changesetContents;
};

module.exports = {
  getChangesetContents,
};
