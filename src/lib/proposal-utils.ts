export const isValidDestination = (id: string | null) => id !== null && id !== '';
export const isValidHotel = (id: string | null) => id !== null && id !== '';

export const calculateProposalCost = (days: any[], markupPct: number) => {
  const totalCost = days.reduce((acc, day) => acc + (Number(day.dayCost) || 0), 0);
  const markup = totalCost * (Number(markupPct) / 100);
  return { totalCost, sellingPrice: totalCost + markup };
};
