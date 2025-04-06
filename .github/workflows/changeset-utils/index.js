const getChangesetContents = async (pullRequest) => {
  const title = pullRequest.title;
  const releaseType = title.split(':')[0];
  return `---\n'@asyncapi/cli': ${releaseType}\n---\n\n ${title}\n`;
};

module.exports = {
  getChangesetContents,
};
