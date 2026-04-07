export const ROUTES = {
  RADIATIONS: "/",
};

export type RouteKeyType = keyof typeof ROUTES;
export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  RADIATIONS: "Каталог излучений",
};