const r = [
	{ suffix: 'a', url: 'aaaa' },
	{ suffix: 'b', url: 'bbbb' },
	{ suffix: 'c', url: 'cccc' },
];

console.log(
	Object.assign(
		{},
		...r.map((i) => {
			return { [i['suffix']]: i['url'] };
		}),
	),
);
