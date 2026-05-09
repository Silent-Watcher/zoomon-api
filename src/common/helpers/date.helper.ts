export function toMinutes(time: `${number}:${number}`): number {
	const [h, m] = time.split(':').map(Number);
	return h * 60 + m;
}
