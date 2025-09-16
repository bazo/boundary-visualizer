import * as z from "zod";

export const BoundarySchema = z.object({
	id: z.string(),
	p: z.array(z.array(z.number())),
});
export type Country = z.infer<typeof BoundarySchema>;

export const CountriesSchema = z.record(z.string(), z.array(BoundarySchema));
export type Countries = z.infer<typeof CountriesSchema>;
