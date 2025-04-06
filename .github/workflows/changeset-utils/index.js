const getChangesetContents = async (pullRequest) => {
  const title = pullRequest.title;
  const releaseType = title.split(':')[0];
  const timestamp = Date.now();
  return `---\n'@asyncapi/cli': ${releaseType}\n---\n\n ${title}${timestamp}\n`;
};

module.exports = {
  getChangesetContents,
};
