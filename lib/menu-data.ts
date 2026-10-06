export type MenuItem = { id: string; name: string; description?: string; price: number; imageKey?: string; imageUrl?: string };
export type MenuCategory = { id: string; name: string; tone: "pink" | "green"; note?: string; items: MenuItem[] };
export type MenuData = {
  business: { name: string; tagline: string; address: string; hours: string; instagram: string };
  categories: MenuCategory[];
};

const item = (id: string, name: string, price: number, description?: string): MenuItem => ({ id, name, price, ...(description ? { description } : {}) });

export const defaultMenu: MenuData = {
  business: { name: "CATÚ", tagline: "El mundo es dulce.", address: "Campillo 466 · Cofico · Córdoba", hours: "Todos los días · 7:30 a 22:00", instagram: "catupasteleria" },
  categories: [
    { id: "cafeteria", name: "Cafetería", tone: "pink", items: [
      item("espresso", "Espresso", 3500), item("ristretto", "Ristretto", 3500), item("jarro", "Café en jarro", 4000), item("doble", "Café doble", 4500),
      item("americano-cafe", "Americano", 4500), item("lagrima", "Lágrima", 4800), item("flat-white", "Flat White", 4800), item("cafe-leche", "Café con leche", 4800),
      item("submarino", "Submarino", 5700), item("te-negro", "Té negro", 4300), item("mate-cocido", "Mate cocido", 4300), item("cappuccino", "Cappuccino", 5500),
      item("cap-nutella", "Cappuccino Catú Nutella", 5700), item("cap-pistacho", "Cappuccino de pistacho", 5800), item("cap-frambuesa", "Cappuccino de frambuesa", 5700),
      item("espresso-tonic", "Espresso tonic de naranja", 5000), item("frappe", "Frappé", 5500), item("frap-dulce", "Frappuccino de dulce de leche", 6000),
      item("iced-pistacho", "Iced latte de pistacho", 5800), item("iced-caramelo", "Iced latte de caramelo", 5800), { ...item("iced-frambuesa", "Iced latte de frambuesa", 5700), imageUrl: "/images/catu-2.webp" },
      item("matcha", "Matcha latte", 5200), item("chocolatada", "Chocolatada", 4900),
    ]},
    { id: "licuados", name: "Licuados", tone: "pink", items: [
      item("lic-banana", "Banana", 5700), item("lic-frutilla", "Frutilla", 5700), item("lic-naranja", "Naranja, maracuyá y durazno", 5900),
      item("lic-detox", "Detox", 5900, "Melón, jengibre, menta y pepino"), item("lic-tropical", "Tropical", 5900, "Ananá, frutilla y arándanos"), item("lic-summer", "Summer", 5900, "Kiwi, banana y frutilla"),
    ]},
    { id: "bebidas", name: "Bebidas", tone: "green", items: [
      item("lim-menta-jarra", "Limonada con menta y jengibre · Jarra", 8800), item("lim-menta-vaso", "Limonada con menta y jengibre · Vaso", 4600),
      item("lim-rojos-jarra", "Limonada con frutos rojos · Jarra", 9000), item("lim-rojos-vaso", "Limonada con frutos rojos · Vaso", 4800),
      item("jugo-naranja", "Jugo de naranja", 5000), item("gaseosa", "Gaseosa", 4000), item("agua", "Agua con y sin gas", 3600), item("corona", "Cerveza Corona", 5000),
    ]},
    { id: "pasteleria", name: "Pastelería", tone: "green", items: [
      item("croissant-simple", "Croissant", 2600), item("alfajor", "Alfajor", 4800), item("scon-dulce", "Scon dulce", 4100), item("scon-queso", "Scon de queso", 4100),
      item("budin", "Porción de budín", 4700), item("macarons", "Macarons", 3100), { ...item("torta", "Porción de torta", 10500), imageUrl: "/images/catu-1.webp" }, item("cookie", "Cookie", 3600), item("medialuna", "Medialuna", 1600),
    ]},
    { id: "te-hebras", name: "Té en hebras", tone: "green", note: "By Tesai Infusiones de Diseño", items: [
      item("siete-lagos", "Siete lagos", 5400, "Té verde orgánico, hibiscus, rosa mosqueta y frutilla"), item("noche-azteca", "Noche Azteca", 5400, "Té negro, cacao, naranja y pimienta rosa"),
      item("beautea", "Beautea", 5400, "Té oolong y té blanco, pétalos de rosas, cascaritas de naranja, caléndulas y centella asiática"), item("apple-pie", "Apple Pie", 5400, "Té rojo, manzanas en trocitos y canela"),
    ]},
    { id: "waffles", name: "Waffles", tone: "pink", items: [
      item("waffle-banana", "Banana, crema chantillí, dulce de leche y nueces", 8500), item("waffle-frutas", "Frutas de estación, miel, avena y granola", 8500),
      item("waffle-rojos", "Frutos rojos, crema chantillí y Nutella", 8700), item("waffle-cream", "Creamcheese", 8500, "Queso crema, jamón crudo, cherrys, huevos y queso"),
      item("waffle-green", "Green Waffle", 8700, "Waffle de espinaca, queso crema, queso, pollo, pimientos asados y cherrys"),
    ]},
    { id: "sandwiches", name: "Sandwiches", tone: "green", items: [
      item("tostadete", "Tostadete", 9800, "Ciabatta de jamón cocido, queso y aderezo"), item("tostadete-rec", "Tostadete recargado", 10000, "Ciabatta de jamón cocido, queso, tomate, lechuga y aderezo"),
      item("chipa-fungi", "Chipa fungi", 7800, "Pan de chipa, champiñones salteados, cebolla caramelizada, queso y mostaza con miel"), item("sand-veggie", "Veggie", 9800, "Queso tybo, hummus, berenjena, zanahoria, cebolla morada y pepinos encurtidos"),
      item("chipa-sandwich", "Chipa-sandwich", 7800, "Pan de chipa, bondiola y queso"), item("croissant-relleno", "Croissant", 8900, "Jamón crudo, rúcula, queso y huevo"),
      item("croissant-americana", "Croissant americana", 8900, "Queso, panceta, aderezo, rúcula y champiñones"), item("croissant-veggie", "Croissant veggie", 8900, "Palta, huevo y queso"),
      item("mafalda", "Mafalda", 6100, "Croissant con jamón y queso"), item("ciabatta-pollo", "Ciabatta de pollo", 14000, "Pollo, queso tybo, panceta, lechuga y tomate"),
      item("ciabatta-xl", "Ciabatta XL", 15100, "Carne desmechada, queso, pimientos asados y champiñones"), item("bacon", "Bacon-sandwich", 9400, "Pan de papa, aderezo, queso, panceta, rúcula, huevo y tomate"),
      item("avocado", "Avocado", 10600, "Tostón de campo con queso crema, palta y huevo"), item("avocado-catu", "Avocado Catú", 10800, "Tostón de campo, hummus, champiñones, cebolla morada y rabanitos encurtidos"),
      item("deluxe", "Deluxe", 12100, "Queso tybo, tomates confitados, rúcula, jamón crudo, aderezo y focaccia"),
    ]},
    { id: "wraps", name: "Wraps", tone: "pink", items: [
      item("wrap-pollo", "Pollo mix", 11500, "Pollo, hojas verdes, tomate y zanahoria"), item("wrap-veggie", "Veggie", 11500, "Hojas verdes, queso, zanahoria, pepino encurtido, tomate y aderezo"),
      item("wrap-caesar", "Caesar", 11500, "Pollo, parmesano, hojas verdes y aderezo Caesar"), item("wrap-meat", "Desmechado meat", 12900, "Carne desmechada, rúcula, zanahoria y repollo colorado"),
    ]},
    { id: "ensaladas", name: "Ensaladas", tone: "green", items: [
      item("ens-caesar", "Caesar", 8800, "Aderezo, pollo, mix de verdes y croutons"), item("ens-blue", "Bluechesse", 8800, "Rúcula, cherrys, jamón crudo, nueces y queso azul"), item("ens-summer", "Summer", 8800, "Pollo, palta, queso, hojas verdes y tomate"),
    ]},
    { id: "tartas", name: "Tartas con masa casera", tone: "pink", items: [
      item("tarta-acelga", "Acelga", 9500), item("tarta-pollo", "Pollo, verdeo, puerro y pimientos", 9900), item("tarta-calabaza", "Calabaza y roquefort", 9500), item("tarta-jyq", "Jamón y queso", 9600),
    ]},
    { id: "desayunos", name: "Desayunos y meriendas", tone: "pink", note: "Todos vienen con infusión", items: [
      item("granola", "Granola bowl", 14000, "Yogurt natural, granola y frutas"), item("con-tuti", "Con tuti", 14500, "Tostadas, jamón cocido, queso, palta y huevo; incluye queso crema y jugo de naranja chico"),
      item("classic", "Classic", 9000, "Tostadas con dos dips a elección"), item("pancakes", "Pancakes fit", 15000, "Avena, banana, frutas de estación, miel y mantequilla de maní"),
      item("power", "Power", 16000, "Tostadas, hojas verdes, queso, jamón crudo, cherrys y huevo revuelto"), item("livianito", "Livianito", 11600, "Tostadas, huevo, queso y cherry; incluye queso crema y jugo de naranja chico"),
      item("french", "French toast", 17000, "Pan de molde, crema chantillí, frutas frescas y miel"), item("des-americano", "Americano", 16000, "Panceta, huevo revuelto, queso, tostadas y tomate cherry"),
    ]},
  ],
};

export function isMenuData(value: unknown): value is MenuData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as MenuData;
  return Boolean(candidate.business?.name && Array.isArray(candidate.categories));
}
