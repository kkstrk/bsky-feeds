export default (agent, record) => ({
	...record,
	repo: agent.session?.did ?? '',
	collection: 'app.bsky.feed.generator',
});