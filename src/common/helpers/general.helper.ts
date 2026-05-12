export async function sleep(ms: number) {
	return new Promise((res, _rej) => setTimeout(res, ms));
}
