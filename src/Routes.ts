export const ROUTES = {
  HOME: "/",
  RADIATIONS: "/radiations",
  CART: "/cart",
}

export type RouteKeyType = keyof typeof ROUTES;
export const ROUTE_LABELS: {[key in RouteKeyType]: string} = {
  HOME: "Главная",
  RADIATIONS: "Услуги излучения",
  CART: "Заявка (Корзина)"
};