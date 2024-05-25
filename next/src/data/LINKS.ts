export const LINKS: Link[] = [
	{
		name: "Sell",
		href: "/sell",
	},
	{
		name: "Listings",
		href: "/listings",
	},
	{
		name: "Messages",
		href: "/messageboard",
	},
];

export interface Link {
	name: string;
	href: string;
}
