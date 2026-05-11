import { HHMM } from '../../user-preference/user-preference.types';

export function toMinutes(time: HHMM): number {
	const [h, m] = time.split(':').map(Number);
	return h * 60 + m;
}
