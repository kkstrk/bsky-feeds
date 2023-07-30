import jsonResponse from './utils/jsonResponse';

export default async (request) => {
	const host = request.headers.get('Host');
	return jsonResponse({
		'@context': ['https://www.w3.org/ns/did/v1'],
		id: `did:web:${host}`,
		alsoKnownAs: [],
		authentication: null,
		verificationMethod: [],
		service: [{
			id: '#bsky_fg',
			type: 'BskyFeedGenerator',
			serviceEndpoint: `https://${host}`,
		}],
	});
};
