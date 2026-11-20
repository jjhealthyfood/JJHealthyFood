"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "es";

const en = {
  common: {
    back: "Back",
    next: "Next",
    edit: "Edit",
    duplicate: "Duplicate",
    remove: "Remove",
    cancel: "Cancel",
    close: "Close",
    done: "Done",
    undo: "Undo",
    orderTotal: "ORDER TOTAL",
    optional: "optional",
    free: "Free",
    meal: "Meal",
    meals: "meals",
    sending: "Sending...",
  },
  nav: {
    how: "How it works",
    menu: "Menu",
    reviews: "Reviews",
    order: "Start my order",
    orderShort: "Order",
  },
  status: {
    open: "Orders open now · close Friday 6pm",
    closed: "Orders closed · reopen Tuesday",
  },
  ribbon: {
    delivery: "Free delivery",
  },
  hero: {
    badge: "NEW · KETO MENU",
    title: "Build your healthy meal week in minutes",
    subtitle:
      "We save you time and effort: pick your meals, then choose pickup or delivery on the day that works for you.",
    cta: "Start my order",
    ctaSecondary: "See this week's menu",
    badges: ["Freshly prepared", "Never frozen", "Fully customizable", "Pickup or delivery"],
    tagline: "Healthy Meal Prep · Florida",
  },
  week: {
    badge: "THIS WEEK",
    title: "This week's menu",
    subtitle:
      "Real plates, prepared fresh. Swipe to see what you can order right now.",
    swipe: "Swipe to explore",
    cta: "Start my order",
    price: "Price",
    pricePending: "—",
  },
  how: {
    title: "How it works",
    subtitle: "A simple process to get fresh, healthy meals ready for you.",
    steps: [
      {
        title: "Pick your meals",
        description:
          "Choose how many meals you want and customize protein, carb and veggie in each one.",
      },
      {
        title: "Add extras if you want",
        description: "Add an extra protein, carb or veggie to any meal.",
      },
      {
        title: "Pickup or delivery",
        description:
          "Pick a pickup spot or enter your address, for Sunday or Monday. Orders open Tuesday through Friday 6pm for that week.",
      },
      {
        title: "Confirm on WhatsApp",
        description:
          "We send your confirmation instantly. Grab it at your pickup spot, or we bring it to you.",
      },
    ],
  },
  menu: {
    badge: "MENU",
    title: "Explore the menu",
    subtitle: "Pick a meal type to see what is on it. Keto is new.",
    tabs: { regular: "Regular meal", plato: "Plato", keto: "Keto", breakfast: "Breakfast" },
    new: "NEW",
    regular: {
      standardBadge: "Standard",
      premiumBadge: "Premium",
      sides: "Sides & Veggies",
      standardTitle: "Standard protein · $9",
      premiumTitle: "Premium protein · $12",
      sidesTitle: "Carbs & veggies included",
      carbsLabel: "Carbs",
      veggiesLabel: "Veggies",
      includesNote: "Each meal includes 1 protein, 1 carb and 1 veggie.",
      standardFooter: "Standard protein",
      premiumFooter: "Premium protein",
      included: "Included",
    },
    plato: {
      more: "More favorite platos",
      note: "Available in both regular portion and macro-measured formats in the builder.",
    },
    keto: {
      badge: "LOW CARB",
      badgeHigh: "HIGH PROTEIN / LOW CARB",
      badgeFresh: "KETO FRESH",
      note: "Keto plates come with your choice of protein. Lasagna is served with turkey or beef.",
      protein: "Protein",
      dishes: [
        {
          name: "Lasagna berenjena",
          ingredients: "Eggplant, cheese, ground beef.",
          protein: "Turkey or beef",
        },
        {
          name: "Spaghetti zucchini",
          ingredients: "Zucchini pasta, white mushroom sauce.",
          protein: "Chicken, beef or salmon",
        },
        {
          name: "Salmon bowl",
          ingredients: "Green salad, salmon.",
          protein: "Salmon",
        },
      ],
    },
    breakfast: {
      badge: "Morning Fuel",
      title: "Rotating breakfast menu",
      text: "Classic golden waffles paired with cage-free eggs, fresh berries or crispy turkey bacon, made fresh for your morning routine.",
      startingAt: "Starting at",
    },
    cta: "Start my order",
  },
  difference: {
    title: "The JJ difference",
    subtitle:
      "Eating well shouldn’t mean giving up flavor or convenience. No subscriptions, no commitments, just great food on your schedule.",
    items: [
      {
        title: "Always fresh, never frozen",
        description: "Every meal is cooked fresh, no freezers, no shortcuts.",
      },
      {
        title: "New menu weekly",
        description: "Proteins, carbs and veggies rotate, so it never gets boring.",
      },
      {
        title: "Pickup or delivery",
        description: "Swing by your nearest pickup spot, or have it delivered.",
      },
      {
        title: "Fully customizable",
        description:
          "Build every meal your way, with optional extras priced individually.",
      },
    ],
  },
  reviews: {
    title: "What our customers say",
    items: [
      { name: "Valeria Rojas", handle: "@valeriarojasfit", text: "Que delicia. Las comidas de esta semana estaaann 🔥" },
      { name: "Carlos López", handle: null, text: "Demasiado ricas las comidas! A mí y a mi esposa nos hace la vida más fácil." },
      { name: "Lina G.", handle: null, text: "Thanks for everything, I love how healthy and delicious I can eat for my lunches!" },
    ],
  },
  cta: {
    title: "Ready for your meal week?",
    button: "Start my order",
  },
  footer: {
    rights: "All rights reserved.",
  },
  wizard: {
    buildOrder: "Build your order",
    headerTagline: "BUILD YOUR ORDER",
    stepOf: (n: number) => `Step ${n} of 4`,
    stepSetup: "Step 1 of 4 · Order setup",
    stepMeal: (n: number, total: number) => `Step 2 of 4 · Meal ${n} of ${total}`,
    stepDeliveryPickup: "Step 3 of 4 · Pickup",
    stepDeliveryDelivery: "Step 3 of 4 · Delivery",
    stepSummary: "Step 4 of 4 · Summary",
    howMany: "HOW MANY MEALS DO YOU WANT?",
    howWant: "HOW DO YOU WANT YOUR MEALS?",
    appliesAll: "This applies to every meal in this order.",
    byPortion: "By Portion",
    byPortionDesc: "Standard portion of protein, carb, and veggie.",
    macro: "Macro",
    macroDesc: "Adjustable protein amount for your macros.",
    ordersOpen: "Orders open Tuesday through Friday 6pm for that week.",
    mealN: (n: number) => `Meal ${n}`,
    chooseType: "Choose the meal type, then build your ingredients.",
    mealType: "MEAL TYPE",
    regularMeal: "Regular meal",
    plato: "Plato",
    keto: "Keto",
    breakfast: "Breakfast",
    copyPreviousTitle: "SAME AS MEAL 1",
    copyPrevious: "Use the same meal",
    changeSomething: "Change something",
    orDifferent: "OR BUILD A DIFFERENT MEAL",
    chooseDish: "CHOOSE YOUR DISH",
    chooseBreakfast: "CHOOSE YOUR BREAKFAST",
    chooseKeto: "CHOOSE YOUR KETO DISH",
    ketoProtein: "PROTEIN",
    ketoProteinHint: "Pick the protein that comes with your dish.",
    ketoIncludes: "Keto meals come with your choice of protein and a green salad.",
    proteinStandard: "PROTEIN · STANDARD",
    proteinPremium: "PROTEIN · PREMIUM",
    proteinKeto: "PROTEIN · KETO",
    carb: "CARB",
    veggieOptional: "VEGGIE (OPTIONAL)",
    includesNote: "Includes 1 protein, 1 carb, and 1 veggie.",
    macrosNote: "Adjust the protein to hit your macros. Includes 1 protein, 1 carb, and 1 veggie.",
    proteinAmount: "PROTEIN AMOUNT (MACRO)",
    protein: "Protein",
    carbLabel: "Carb",
    addExtra: "ADD SOMETHING EXTRA?",
    extrasHint: "Optional extras are priced individually.",
    extraProtein: "EXTRA PROTEIN",
    extraCarb: "EXTRA CARB",
    extraVeggie: "EXTRA VEGGIE",
    anotherProtein: "Another protein",
    anotherCarb: "Another carb",
    anotherVeggie: "Another veggie",
    notes: "NOTES FOR THIS MEAL (OPTIONAL)",
    notesPlaceholder: "e.g. no onions, sauce on the side",
    deliveryDetails: "Delivery details",
    pickupDetails: "Pickup details",
    needDelivery: "We need these to deliver your order.",
    needPickup: "We need these to coordinate your pickup.",
    pickup: "Pickup",
    delivery: "Delivery",
    deliveryAddress: "DELIVERY ADDRESS",
    street: "Street address (e.g., 1015 S Dillard St)",
    apt: "Apt, suite, or unit (optional)",
    phone: "PHONE",
    phonePlaceholder: "(555) 123-4567",
    name: "NAME",
    namePlaceholder: "Your full name",
    additional: "ADDITIONAL DETAILS (OPTIONAL)",
    additionalDelivery: "Gate code, landmarks, instructions",
    additionalPickup: "Anything we should know about your pickup?",
    deliveryDay: "DELIVERY DAY",
    pickupDay: "PICKUP DAY",
    pickupLocation: "PICKUP LOCATION",
    welcomeBack: (name: string) => `Welcome back, ${name}! We've filled in your info.`,
    floridaOnly: "We currently only deliver within Florida.",
    invalidPhone: "Please enter a valid US phone number.",
    invalidAddress: "Please enter a full Florida address with a valid FL zip code.",
    schedulingNextWeek: "Scheduling for next week",
    summaryTitle: "Your order summary",
    summaryText: "Review everything before sending it via WhatsApp. Tap any card to edit it.",
    orderSetup: "Order setup",
    total: "Total",
    subtotal: "Subtotal",
    discount: (pct: number) => `Discount (${pct}% off)`,
    haveCode: "Have a discount code?",
    changeCode: "Change discount code",
    sendWhatsApp: "Send via WhatsApp",
    confirmWhatsApp: "Confirm on WhatsApp",
    checkWhatsApp: "Check WhatsApp",
    discountTitle: "Discount code",
    enterCode: "ENTER YOUR CODE",
    codePlaceholder: "Discount code",
    applyCode: "Apply code",
    checking: "Checking...",
    invalidCode: "That code isn't valid.",
    closedTitle: "Orders closed",
    closedText:
      "The order deadline for this week has passed (Friday 6 PM Orlando time).",
    closedQuestion: "Would you like to schedule your order for next week?",
    scheduleNext: "Schedule for next week",
    discard: "Discard",
    duplicateTitle: "Possible duplicate order",
    duplicateText:
      "You already have an order with these exact same meals for this day that hasn't been delivered yet. Did you mean to send it again?",
    sendAnyway: "Send anyway",
    limitTitle: "We're full for this weekend",
    limitText:
      "We've reached our meal capacity for this delivery weekend. Message us on WhatsApp and we'll let you know if we can make room for your order.",
    limitNote:
      "Don't close or reload this page while you wait — your meals are still saved here, so once we confirm you can just tap send again.",
    messageUs: "Message us",
    readyTitle: "Your order is ready",
    readyText: "Tap the button to send it via WhatsApp. We confirm it there.",
    openWhatsApp: "Open WhatsApp",
    copyOrder: "Didn't open? Copy order text",
    copied: "Order copied!",
    newOrder: "Start a new order",
    stepPickupDelivery: "Step 3 of 4 · Pickup & Delivery",
    stepSummaryCheckout: "Step 4 of 4 · Summary & Checkout",
    mealsSoFar: (n: number) => `Your meals so far (${n})`,
    mealsCount: (n: number) => `${n} ${n === 1 ? "meal" : "meals"}`,
    orderCopyTitle: "JJ Meals - New order",
    copyName: "Name",
    copyPhone: "Phone",
    copyDetails: "Details",
    note: "Note",
    summaryButton: "Summary",
    decreaseMeals: "Decrease meals",
    increaseMeals: "Increase meals",
    macroMeal: "Macro meal",
    ketoPickDishFirst: "Pick a dish to see the protein that comes with it.",
    ketoIncluded: "included",
    ketoPriceNote: (precio: string) =>
      `Protein comes included in the dish price — pay ${precio}.`,
    orderSetupEdit: "ORDER SETUP · EDIT",
    mealEdit: (n: number, tipo: string) => `MEAL ${n} · ${tipo} · EDIT`,
    deliveryEdit: "DELIVERY · EDIT",
    pickupEdit: "PICKUP · EDIT",
    gramsProtein: (g: number) => `${g}g protein`,
    gramsProteinCarb: (p: number, c: number) => `${p}g / ${c}g`,
    rememberDetails: "REMEMBER MY DETAILS FOR NEXT TIME",
    rememberDetailsHint: "Saved locally on this device",
    deliveryZoneNote: "Free delivery · Orlando Metro Area",
    editingMeal: (n: number, total: number) => `Editing meal ${n} of ${total}`,
    editingMealBadge: (n: number) => `Editing Meal ${n}`,
    saveAndReturn: "Save & Return",
    returnToSummary: "Back to summary",
    returnToOrder: "Back to order",
    mealDuplicated: "Meal duplicated",
  },
};

type Dict = typeof en;
export type { Dict };

const es: Dict = {
  common: {
    back: "Atrás",
    next: "Siguiente",
    edit: "Editar",
    duplicate: "Duplicar",
    remove: "Eliminar",
    cancel: "Cancelar",
    close: "Cerrar",
    done: "Listo",
    undo: "Deshacer",
    orderTotal: "TOTAL DEL PEDIDO",
    optional: "opcional",
    free: "Gratis",
    meal: "Comida",
    meals: "comidas",
    sending: "Enviando...",
  },
  nav: {
    how: "Cómo funciona",
    menu: "Menú",
    reviews: "Reseñas",
    order: "Empezar mi pedido",
    orderShort: "Pedir",
  },
  status: {
    open: "Pedidos abiertos · cierra viernes 6pm",
    closed: "Pedidos cerrados · reabren el martes",
  },
  ribbon: {
    delivery: "Delivery gratis",
  },
  hero: {
    badge: "NUEVO · MENÚ KETO",
    title: "Arma tu semana de comidas saludables en minutos",
    subtitle:
      "Te ahorramos tiempo y esfuerzo: elige tus comidas y luego retiro o entrega el día que mejor te venga.",
    cta: "Empezar mi pedido",
    ctaSecondary: "Ver el menú de la semana",
    badges: ["Recién preparado", "Nunca congelado", "100% personalizable", "Retiro o entrega"],
    tagline: "Comida saludable preparada · Florida",
  },
  week: {
    badge: "ESTA SEMANA",
    title: "El menú de esta semana",
    subtitle:
      "Platos reales, recién preparados. Desliza para ver lo que puedes pedir ahora.",
    swipe: "Desliza para ver más",
    cta: "Empezar mi pedido",
    price: "Precio",
    pricePending: "—",
  },
  how: {
    title: "Cómo funciona",
    subtitle: "Un proceso simple para tener comidas frescas y saludables listas para ti.",
    steps: [
      {
        title: "Elige tus comidas",
        description:
          "Escoge cuántas comidas quieres y personaliza proteína, carbohidrato y vegetal en cada una.",
      },
      {
        title: "Agrega extras si quieres",
        description: "Añade una proteína, carbohidrato o vegetal extra a cualquier comida.",
      },
      {
        title: "Retiro o entrega",
        description:
          "Elige un punto de retiro o tu dirección, para domingo o lunes. Los pedidos abren de martes a viernes 6pm para esa semana.",
      },
      {
        title: "Confirma por WhatsApp",
        description:
          "Te enviamos la confirmación al instante. Retíralo en tu punto o te lo llevamos.",
      },
    ],
  },
  menu: {
    badge: "MENÚ",
    title: "Explora el menú",
    subtitle: "Elige un tipo de comida para ver qué incluye. Keto es nuevo.",
    tabs: { regular: "Comida regular", plato: "Plato", keto: "Keto", breakfast: "Desayuno" },
    new: "NUEVO",
    regular: {
      standardBadge: "Estándar",
      premiumBadge: "Premium",
      sides: "Acompañantes y vegetales",
      standardTitle: "Proteína estándar · $9",
      premiumTitle: "Proteína premium · $12",
      sidesTitle: "Carbohidratos y vegetales incluidos",
      carbsLabel: "Carbohidratos",
      veggiesLabel: "Vegetales",
      includesNote: "Cada comida incluye 1 proteína, 1 carbohidrato y 1 vegetal.",
      standardFooter: "Proteína estándar",
      premiumFooter: "Proteína premium",
      included: "Incluido",
    },
    plato: {
      more: "Más platos favoritos",
      note: "Disponibles en porción regular y en formato macro dentro del armador.",
    },
    keto: {
      badge: "BAJO EN CARB",
      badgeHigh: "ALTO EN PROTEÍNA / BAJO EN CARB",
      badgeFresh: "KETO FRESCO",
      note: "Los platos keto se sirven con proteína a elección. La lasaña viene con pavo o carne molida.",
      protein: "Proteína",
      dishes: [
        {
          name: "Lasaña de berenjena",
          ingredients: "Berenjena, queso, carne molida.",
          protein: "Pavo o molida",
        },
        {
          name: "Spaghetti de zucchini",
          ingredients: "Pasta de zucchini, salsa blanca de champiñones.",
          protein: "Pollo, carne o salmón",
        },
        {
          name: "Salmon bowl",
          ingredients: "Ensalada verde, salmón.",
          protein: "Salmón",
        },
      ],
    },
    breakfast: {
      badge: "Energía matutina",
      title: "Menú rotativo de desayunos",
      text: "Waffles dorados clásicos con huevos de campo, frutos frescos o turkey bacon crujiente, hechos frescos para tu mañana.",
      startingAt: "Desde",
    },
    cta: "Empezar mi pedido",
  },
  difference: {
    title: "La diferencia JJ",
    subtitle:
      "Comer bien no debería significar renunciar al sabor o a la comodidad. Sin suscripciones, sin compromisos, solo buena comida en tu horario.",
    items: [
      {
        title: "Siempre fresco, nunca congelado",
        description: "Cada comida se cocina fresca, sin congeladores ni atajos.",
      },
      {
        title: "Menú nuevo cada semana",
        description: "Las proteínas, carbohidratos y vegetales rotan para que nunca aburra.",
      },
      {
        title: "Retiro o entrega",
        description: "Pasa por tu punto de retiro más cercano o pide entrega a domicilio.",
      },
      {
        title: "100% personalizable",
        description:
          "Arma cada comida a tu manera, con extras opcionales con precio individual.",
      },
    ],
  },
  reviews: {
    title: "Lo que dicen nuestras clientas",
    items: [
      { name: "Valeria Rojas", handle: "@valeriarojasfit", text: "Que delicia. Las comidas de esta semana estaaann 🔥" },
      { name: "Carlos López", handle: null, text: "Demasiado ricas las comidas! A mí y a mi esposa nos hace la vida más fácil." },
      { name: "Lina G.", handle: null, text: "Thanks for everything, I love how healthy and delicious I can eat for my lunches!" },
    ],
  },
  cta: {
    title: "¿Lista para tu semana de comidas?",
    button: "Empezar mi pedido",
  },
  footer: {
    rights: "Todos los derechos reservados.",
  },
  wizard: {
    buildOrder: "Arma tu pedido",
    headerTagline: "ARMA TU PEDIDO",
    stepOf: (n: number) => `Paso ${n} de 4`,
    stepSetup: "Paso 1 de 4 · Configuración",
    stepMeal: (n: number, total: number) => `Paso 2 de 4 · Comida ${n} de ${total}`,
    stepDeliveryPickup: "Paso 3 de 4 · Retiro",
    stepDeliveryDelivery: "Paso 3 de 4 · Entrega",
    stepSummary: "Paso 4 de 4 · Resumen",
    howMany: "¿CUÁNTAS COMIDAS QUIERES?",
    howWant: "¿CÓMO QUIERES TUS COMIDAS?",
    appliesAll: "Esto aplica a todas las comidas de este pedido.",
    byPortion: "Por porción",
    byPortionDesc: "Porción estándar de proteína, carbohidrato y vegetal.",
    macro: "Macro",
    macroDesc: "Cantidad de proteína ajustable para tus macros.",
    ordersOpen: "Los pedidos abren de martes a viernes 6pm para esa semana.",
    mealN: (n: number) => `Comida ${n}`,
    chooseType: "Elige el tipo de comida y luego arma los ingredientes.",
    mealType: "TIPO DE COMIDA",
    regularMeal: "Comida regular",
    plato: "Plato",
    keto: "Keto",
    breakfast: "Desayuno",
    copyPreviousTitle: "IGUAL A LA COMIDA 1",
    copyPrevious: "Usar la misma comida",
    changeSomething: "Cambiar algo",
    orDifferent: "O ARMA UNA COMIDA DIFERENTE",
    chooseDish: "ELIGE TU PLATO",
    chooseBreakfast: "ELIGE TU DESAYUNO",
    chooseKeto: "ELIGE TU PLATO KETO",
    ketoProtein: "PROTEÍNA",
    ketoProteinHint: "Elige la proteína que acompaña tu plato.",
    ketoIncludes: "Los platos keto incluyen proteína a elección y ensalada verde.",
    proteinStandard: "PROTEÍNA · ESTÁNDAR",
    proteinPremium: "PROTEÍNA · PREMIUM",
    proteinKeto: "PROTEÍNA · KETO",
    carb: "CARBOHIDRATO",
    veggieOptional: "VEGETAL (OPCIONAL)",
    includesNote: "Incluye 1 proteína, 1 carbohidrato y 1 vegetal.",
    macrosNote: "Ajusta la proteína para tus macros. Incluye 1 proteína, 1 carbohidrato y 1 vegetal.",
    proteinAmount: "CANTIDAD DE PROTEÍNA (MACRO)",
    protein: "Proteína",
    carbLabel: "Carbohidrato",
    addExtra: "¿AGREGAR ALGO EXTRA?",
    extrasHint: "Los extras opcionales tienen precio individual.",
    extraProtein: "PROTEÍNA EXTRA",
    extraCarb: "CARBOHIDRATO EXTRA",
    extraVeggie: "VEGETAL EXTRA",
    anotherProtein: "Otra proteína",
    anotherCarb: "Otro carbohidrato",
    anotherVeggie: "Otro vegetal",
    notes: "NOTAS PARA ESTA COMIDA (OPCIONAL)",
    notesPlaceholder: "ej. sin cebolla, salsa aparte",
    deliveryDetails: "Datos de entrega",
    pickupDetails: "Datos de retiro",
    needDelivery: "Necesitamos estos datos para entregar tu pedido.",
    needPickup: "Necesitamos estos datos para coordinar tu retiro.",
    pickup: "Retiro",
    delivery: "Entrega",
    deliveryAddress: "DIRECCIÓN DE ENTREGA",
    street: "Dirección (ej. 1015 S Dillard St)",
    apt: "Apto, suite o unidad (opcional)",
    phone: "TELÉFONO",
    phonePlaceholder: "(555) 123-4567",
    name: "NOMBRE",
    namePlaceholder: "Tu nombre completo",
    additional: "DETALLES ADICIONALES (OPCIONAL)",
    additionalDelivery: "Código de portón, referencias, instrucciones",
    additionalPickup: "¿Algo que debamos saber sobre tu retiro?",
    deliveryDay: "DÍA DE ENTREGA",
    pickupDay: "DÍA DE RETIRO",
    pickupLocation: "PUNTO DE RETIRO",
    welcomeBack: (name: string) => `¡Bienvenida de nuevo, ${name}! Ya llenamos tus datos.`,
    floridaOnly: "Por ahora solo entregamos dentro de Florida.",
    invalidPhone: "Ingresa un número de teléfono válido de EE. UU.",
    invalidAddress: "Ingresa una dirección completa de Florida con zip válido.",
    schedulingNextWeek: "Programando para la próxima semana",
    summaryTitle: "Resumen de tu pedido",
    summaryText: "Revisa todo antes de enviarlo por WhatsApp. Toca cualquier tarjeta para editarla.",
    orderSetup: "Configuración",
    total: "Total",
    subtotal: "Subtotal",
    discount: (pct: number) => `Descuento (${pct}% off)`,
    haveCode: "¿Tienes un código de descuento?",
    changeCode: "Cambiar código de descuento",
    sendWhatsApp: "Enviar por WhatsApp",
    confirmWhatsApp: "Confirmar por WhatsApp",
    checkWhatsApp: "Revisa WhatsApp",
    discountTitle: "Código de descuento",
    enterCode: "INGRESA TU CÓDIGO",
    codePlaceholder: "Código de descuento",
    applyCode: "Aplicar código",
    checking: "Verificando...",
    invalidCode: "Ese código no es válido.",
    closedTitle: "Pedidos cerrados",
    closedText:
      "Ya pasó la fecha límite de pedidos para esta semana (viernes 6 PM hora de Orlando).",
    closedQuestion: "¿Quieres programar tu pedido para la próxima semana?",
    scheduleNext: "Programar para la próxima semana",
    discard: "Descartar",
    duplicateTitle: "Posible pedido duplicado",
    duplicateText:
      "Ya tienes un pedido con estas mismas comidas para este día que aún no ha sido entregado. ¿Querías enviarlo de nuevo?",
    sendAnyway: "Enviar igual",
    limitTitle: "Estamos llenos este fin de semana",
    limitText:
      "Alcanzamos nuestra capacidad de comidas para este fin de semana de entrega. Escríbenos por WhatsApp y te diremos si podemos hacer espacio para tu pedido.",
    limitNote:
      "No cierres ni recargues esta página mientras esperas: tus comidas siguen guardadas aquí, así que cuando confirmemos solo tienes que volver a enviar.",
    messageUs: "Escríbenos",
    readyTitle: "Tu pedido está listo",
    readyText: "Toca el botón para enviarlo por WhatsApp. Ahí lo confirmamos.",
    openWhatsApp: "Abrir WhatsApp",
    copyOrder: "¿No se abrió? Copiar el pedido",
    copied: "¡Pedido copiado!",
    newOrder: "Empezar un pedido nuevo",
    stepPickupDelivery: "Paso 3 de 4 · Retiro o entrega",
    stepSummaryCheckout: "Paso 4 de 4 · Resumen y envío",
    mealsSoFar: (n: number) => `Tus comidas hasta ahora (${n})`,
    mealsCount: (n: number) => `${n} ${n === 1 ? "comida" : "comidas"}`,
    orderCopyTitle: "JJ Meals - Nuevo pedido",
    copyName: "Nombre",
    copyPhone: "Teléfono",
    copyDetails: "Detalles",
    note: "Nota",
    summaryButton: "Resumen",
    decreaseMeals: "Quitar una comida",
    increaseMeals: "Agregar una comida",
    macroMeal: "Comida macro",
    ketoPickDishFirst: "Elige un plato para ver la proteína que lo acompaña.",
    ketoIncluded: "incluida",
    ketoPriceNote: (precio: string) =>
      `La proteína va incluida en el precio del plato — pagas ${precio}.`,
    orderSetupEdit: "PEDIDO · EDITAR",
    mealEdit: (n: number, tipo: string) => `COMIDA ${n} · ${tipo} · EDITAR`,
    deliveryEdit: "ENTREGA · EDITAR",
    pickupEdit: "RETIRO · EDITAR",
    gramsProtein: (g: number) => `${g}g proteína`,
    gramsProteinCarb: (p: number, c: number) => `${p}g / ${c}g`,
    rememberDetails: "RECORDAR MIS DATOS PARA LA PRÓXIMA VEZ",
    rememberDetailsHint: "Guardado de forma local en este dispositivo",
    deliveryZoneNote: "Entrega gratis · Orlando Metro Area",
    editingMeal: (n: number, total: number) => `Editando comida ${n} de ${total}`,
    editingMealBadge: (n: number) => `Editando Comida ${n}`,
    saveAndReturn: "Guardar y volver",
    returnToSummary: "Volver al resumen",
    returnToOrder: "Volver al pedido",
    mealDuplicated: "Comida duplicada",
  },
};

const dictionaries: Record<Lang, Dict> = { en, es };

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: Dict;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "jj-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "es" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "es" : "en");
  }, [lang, setLang]);

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, t: dictionaries[lang] }),
    [lang, setLang, toggleLang]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  return (
    <span
      className={`inline-flex items-center justify-center min-h-[44px] px-4 rounded-full bg-white border-[1.5px] border-[#CFCBA8] text-[#17330A] text-xs font-semibold tracking-wider ${className}`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`inline-flex min-h-[44px] items-center px-1 ${lang === "en" ? "text-[#2F6E00] font-extrabold" : "hover:text-[#2F6E00]"}`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <span className="mx-1.5 text-[#CFCBA8]" aria-hidden="true">·</span>
      <button
        type="button"
        onClick={() => setLang("es")}
        className={`inline-flex min-h-[44px] items-center px-1 ${lang === "es" ? "text-[#2F6E00] font-extrabold" : "hover:text-[#2F6E00]"}`}
        aria-pressed={lang === "es"}
      >
        ES
      </button>
    </span>
  );
}
