// Mock categories with nested menu items and option groups
export const mockCategories = [
  {
    id: "cat-1",
    name: "Noodles",
    slug: "noodles",
    order: 1,
    visible: true,
    menuItems: [
      {
        id: "item-1",
        name: "Spicy Ramen",
        description: "Rich pork broth with egg and vegetables.",
        price: 12.5,
        imageUrl: "https://cdn.pixabay.com/photo/2017/03/10/13/57/cooking-2132874_1280.jpg",
        available: true,
        categoryId: "cat-1",
        deleted: false,
        optionGroups: [
          {
            id: "group-1",
            name: "Spice Level",
            required: true,
            options: [
              { id: "opt-1", optionName: "Mild", priceDelta: 0 },
              { id: "opt-2", optionName: "Medium", priceDelta: 0 },
              { id: "opt-3", optionName: "Hot", priceDelta: 0 },
              { id: "opt-4", optionName: "Extra Hot", priceDelta: 0.5 },
            ],
          },
          {
            id: "group-2",
            name: "Add-ons",
            required: false,
            options: [
              { id: "opt-5", optionName: "Extra Egg", priceDelta: 1.0 },
              { id: "opt-6", optionName: "Nori", priceDelta: 0.5 },
              { id: "opt-7", optionName: "Corn", priceDelta: 0.75 },
              { id: "opt-8", optionName: "Green Onions", priceDelta: 0.25 },
            ],
          },
        ],
      },
      {
        id: "item-2",
        name: "Miso Udon",
        description: "Thick noodles in a miso soup base.",
        price: 10.0,
        imageUrl: "https://cdn.pixabay.com/photo/2016/11/20/09/06/bowl-1842294_1280.jpg",
        available: true,
        categoryId: "cat-1",
        deleted: false,
        optionGroups: [
          {
            id: "group-3",
            name: "Noodle Texture",
            required: true,
            options: [
              { id: "opt-9", optionName: "Soft", priceDelta: 0 },
              { id: "opt-10", optionName: "Firm", priceDelta: 0 },
              { id: "opt-11", optionName: "Extra Firm", priceDelta: 0.5 },
            ],
          },
        ],
      },
      {
        id: "item-3",
        name: "Tonkotsu Ramen",
        description: "Rich pork bone broth with tender chashu.",
        price: 14.0,
        imageUrl: "https://cdn.pixabay.com/photo/2017/03/10/13/57/cooking-2132874_1280.jpg",
        available: true,
        categoryId: "cat-1",
        deleted: false,
        optionGroups: [
          {
            id: "group-4",
            name: "Chashu",
            required: false,
            options: [
              { id: "opt-12", optionName: "Extra Chashu", priceDelta: 2.0 },
              { id: "opt-13", optionName: "Lean Chashu", priceDelta: 1.5 },
            ],
          },
        ],
      },
      {
        id: "item-4",
        name: "Vegetarian Ramen",
        description: "Plant-based broth with fresh vegetables.",
        price: 11.0,
        imageUrl: "https://cdn.pixabay.com/photo/2016/11/20/09/06/bowl-1842294_1280.jpg",
        available: true,
        categoryId: "cat-1",
        deleted: false,
        optionGroups: [],
      },
      {
        id: "item-5",
        name: "Seafood Udon",
        description: "Fresh seafood in clear dashi broth.",
        price: 15.5,
        imageUrl: "https://cdn.pixabay.com/photo/2017/03/10/13/57/cooking-2132874_1280.jpg",
        available: false,
        categoryId: "cat-1",
        deleted: false,
        optionGroups: [],
      },
    ],
  },
  {
    id: "cat-2",
    name: "Salads",
    slug: "salads",
    order: 2,
    visible: true,
    menuItems: [
      {
        id: "item-6",
        name: "Cucumber Salad",
        description: "Cold cucumber salad with sesame dressing.",
        price: 5.0,
        imageUrl:
          "https://sjc.microlink.io/AiT80RfpM8nx_mc9H9McFei_eoyghd2ZuYdDEkJLIppv43OHi1iPSmS5zTSPE8d7dYG1OSu_fUm7xOLa87qm1Q.jpeg",
        available: true,
        categoryId: "cat-2",
        deleted: false,
        optionGroups: [],
      },
      {
        id: "item-7",
        name: "Seaweed Salad",
        description: "Fresh wakame with ponzu dressing.",
        price: 6.5,
        imageUrl:
          "https://sjc.microlink.io/AiT80RfpM8nx_mc9H9McFei_eoyghd2ZuYdDEkJLIppv43OHi1iPSmS5zTSPE8d7dYG1OSu_fUm7xOLa87qm1Q.jpeg",
        available: true,
        categoryId: "cat-2",
        deleted: false,
        optionGroups: [
          {
            id: "group-5",
            name: "Dressing",
            required: true,
            options: [
              { id: "opt-14", optionName: "Ponzu", priceDelta: 0 },
              { id: "opt-15", optionName: "Sesame", priceDelta: 0 },
              { id: "opt-16", optionName: "Spicy Mayo", priceDelta: 0.5 },
            ],
          },
        ],
      },
      {
        id: "item-8",
        name: "Mixed Green Salad",
        description: "Fresh mixed greens with house dressing.",
        price: 7.0,
        imageUrl:
          "https://sjc.microlink.io/AiT80RfpM8nx_mc9H9McFei_eoyghd2ZuYdDEkJLIppv43OHi1iPSmS5zTSPE8d7dYG1OSu_fUm7xOLa87qm1Q.jpeg",
        available: true,
        categoryId: "cat-2",
        deleted: false,
        optionGroups: [
          {
            id: "group-6",
            name: "Protein",
            required: false,
            options: [
              { id: "opt-17", optionName: "Grilled Chicken", priceDelta: 3.0 },
              { id: "opt-18", optionName: "Tofu", priceDelta: 2.0 },
              { id: "opt-19", optionName: "Shrimp", priceDelta: 4.0 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "cat-3",
    name: "Rice Dishes",
    slug: "rice",
    order: 3,
    visible: true,
    menuItems: [
      {
        id: "item-9",
        name: "Chicken Teriyaki",
        description: "Grilled chicken with teriyaki sauce over rice.",
        price: 14.0,
        imageUrl: "https://cdn.pixabay.com/photo/2015/04/08/13/13/food-712665_1280.jpg",
        available: true,
        categoryId: "cat-3",
        deleted: false,
        optionGroups: [
          {
            id: "group-7",
            name: "Rice Type",
            required: true,
            options: [
              { id: "opt-20", optionName: "White Rice", priceDelta: 0 },
              { id: "opt-21", optionName: "Brown Rice", priceDelta: 1.0 },
              { id: "opt-22", optionName: "Fried Rice", priceDelta: 2.0 },
            ],
          },
        ],
      },
      {
        id: "item-10",
        name: "Beef Bowl",
        description: "Thinly sliced beef over rice with onions.",
        price: 15.0,
        imageUrl: "https://cdn.pixabay.com/photo/2017/05/07/08/56/pancakes-2291908_1280.jpg",
        available: true,
        categoryId: "cat-3",
        deleted: false,
        optionGroups: [
          {
            id: "group-8",
            name: "Size",
            required: true,
            options: [
              { id: "opt-23", optionName: "Regular", priceDelta: 0 },
              { id: "opt-24", optionName: "Large", priceDelta: 3.0 },
              { id: "opt-25", optionName: "Extra Large", priceDelta: 5.0 },
            ],
          },
          {
            id: "group-9",
            name: "Toppings",
            required: false,
            options: [
              { id: "opt-26", optionName: "Extra Beef", priceDelta: 2.5 },
              { id: "opt-27", optionName: "Egg", priceDelta: 1.0 },
              { id: "opt-28", optionName: "Cheese", priceDelta: 1.0 },
              { id: "opt-29", optionName: "Pickled Vegetables", priceDelta: 0.5 },
            ],
          },
        ],
      },
      {
        id: "item-11",
        name: "Salmon Teriyaki",
        description: "Grilled salmon with teriyaki glaze.",
        price: 16.5,
        imageUrl: "https://cdn.pixabay.com/photo/2015/04/08/13/13/food-712665_1280.jpg",
        available: true,
        categoryId: "cat-3",
        deleted: false,
        optionGroups: [],
      },
      {
        id: "item-12",
        name: "Pork Katsu",
        description: "Crispy breaded pork cutlet with tonkatsu sauce.",
        price: 13.5,
        imageUrl: "https://cdn.pixabay.com/photo/2017/05/07/08/56/pancakes-2291908_1280.jpg",
        available: true,
        categoryId: "cat-3",
        deleted: false,
        optionGroups: [
          {
            id: "group-10",
            name: "Sauce",
            required: true,
            options: [
              { id: "opt-30", optionName: "Tonkatsu Sauce", priceDelta: 0 },
              { id: "opt-31", optionName: "Curry Sauce", priceDelta: 1.0 },
              { id: "opt-32", optionName: "Spicy Mayo", priceDelta: 0.5 },
            ],
          },
        ],
      },
      {
        id: "item-13",
        name: "Vegetable Curry",
        description: "Japanese curry with seasonal vegetables.",
        price: 12.0,
        imageUrl: "https://cdn.pixabay.com/photo/2015/04/08/13/13/food-712665_1280.jpg",
        available: true,
        categoryId: "cat-3",
        deleted: false,
        optionGroups: [],
      },
    ],
  },
  {
    id: "cat-4",
    name: "Drinks",
    slug: "drinks",
    order: 4,
    visible: true,
    menuItems: [
      {
        id: "item-14",
        name: "Green Tea",
        description: "Traditional Japanese green tea.",
        price: 3.0,
        imageUrl: "https://cdn.pixabay.com/photo/2016/11/20/09/06/bowl-1842294_1280.jpg",
        available: true,
        categoryId: "cat-4",
        deleted: false,
        optionGroups: [
          {
            id: "group-11",
            name: "Temperature",
            required: true,
            options: [
              { id: "opt-33", optionName: "Hot", priceDelta: 0 },
              { id: "opt-34", optionName: "Iced", priceDelta: 0.5 },
            ],
          },
        ],
      },
      {
        id: "item-15",
        name: "Ramune Soda",
        description: "Japanese marble soda in various flavors.",
        price: 4.0,
        imageUrl: "https://cdn.pixabay.com/photo/2015/04/08/13/13/food-712665_1280.jpg",
        available: true,
        categoryId: "cat-4",
        deleted: false,
        optionGroups: [
          {
            id: "group-12",
            name: "Flavor",
            required: true,
            options: [
              { id: "opt-35", optionName: "Original", priceDelta: 0 },
              { id: "opt-36", optionName: "Strawberry", priceDelta: 0 },
              { id: "opt-37", optionName: "Melon", priceDelta: 0 },
              { id: "opt-38", optionName: "Lychee", priceDelta: 0.5 },
            ],
          },
        ],
      },
      {
        id: "item-16",
        name: "Sake",
        description: "Premium Japanese rice wine.",
        price: 8.0,
        imageUrl: "https://cdn.pixabay.com/photo/2016/11/20/09/06/bowl-1842294_1280.jpg",
        available: true,
        categoryId: "cat-4",
        deleted: false,
        optionGroups: [
          {
            id: "group-13",
            name: "Temperature",
            required: true,
            options: [
              { id: "opt-39", optionName: "Cold", priceDelta: 0 },
              { id: "opt-40", optionName: "Warm", priceDelta: 0 },
            ],
          },
        ],
      },
      {
        id: "item-17",
        name: "Japanese Beer",
        description: "Crisp and refreshing Japanese lager.",
        price: 5.5,
        imageUrl: "https://cdn.pixabay.com/photo/2015/04/08/13/13/food-712665_1280.jpg",
        available: true,
        categoryId: "cat-4",
        deleted: false,
        optionGroups: [],
      },
      {
        id: "item-18",
        name: "Matcha Latte",
        description: "Creamy matcha green tea latte.",
        price: 4.5,
        imageUrl: "https://cdn.pixabay.com/photo/2016/11/20/09/06/bowl-1842294_1280.jpg",
        available: true,
        categoryId: "cat-4",
        deleted: false,
        optionGroups: [
          {
            id: "group-14",
            name: "Milk Type",
            required: true,
            options: [
              { id: "opt-41", optionName: "Regular Milk", priceDelta: 0 },
              { id: "opt-42", optionName: "Oat Milk", priceDelta: 0.5 },
              { id: "opt-43", optionName: "Almond Milk", priceDelta: 0.5 },
            ],
          },
          {
            id: "group-15",
            name: "Sweetness",
            required: false,
            options: [
              { id: "opt-44", optionName: "Extra Sweet", priceDelta: 0 },
              { id: "opt-45", optionName: "Half Sweet", priceDelta: 0 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "cat-5",
    name: "Appetizers",
    slug: "appetizers",
    order: 5,
    visible: true,
    menuItems: [
      {
        id: "item-19",
        name: "Gyoza",
        description: "Pan-fried pork dumplings with dipping sauce.",
        price: 7.5,
        imageUrl: "https://cdn.pixabay.com/photo/2017/05/07/08/56/pancakes-2291908_1280.jpg",
        available: true,
        categoryId: "cat-5",
        deleted: false,
        optionGroups: [
          {
            id: "group-16",
            name: "Quantity",
            required: true,
            options: [
              { id: "opt-46", optionName: "6 pieces", priceDelta: 0 },
              { id: "opt-47", optionName: "12 pieces", priceDelta: 6.0 },
            ],
          },
        ],
      },
      {
        id: "item-20",
        name: "Edamame",
        description: "Steamed soybeans with sea salt.",
        price: 4.5,
        imageUrl:
          "https://sjc.microlink.io/AiT80RfpM8nx_mc9H9McFei_eoyghd2ZuYdDEkJLIppv43OHi1iPSmS5zTSPE8d7dYG1OSu_fUm7xOLa87qm1Q.jpeg",
        available: true,
        categoryId: "cat-5",
        deleted: false,
        optionGroups: [
          {
            id: "group-17",
            name: "Seasoning",
            required: false,
            options: [
              { id: "opt-48", optionName: "Garlic Salt", priceDelta: 0 },
              { id: "opt-49", optionName: "Spicy Seasoning", priceDelta: 0.5 },
            ],
          },
        ],
      },
      {
        id: "item-21",
        name: "Takoyaki",
        description: "Octopus balls with takoyaki sauce and mayo.",
        price: 8.0,
        imageUrl: "https://cdn.pixabay.com/photo/2017/05/07/08/56/pancakes-2291908_1280.jpg",
        available: true,
        categoryId: "cat-5",
        deleted: false,
        optionGroups: [],
      },
      {
        id: "item-22",
        name: "Agedashi Tofu",
        description: "Lightly fried tofu in savory dashi broth.",
        price: 6.5,
        imageUrl: "https://cdn.pixabay.com/photo/2015/04/08/13/13/food-712665_1280.jpg",
        available: true,
        categoryId: "cat-5",
        deleted: false,
        optionGroups: [],
      },
    ],
  },
  {
    id: "cat-6",
    name: "Desserts",
    slug: "desserts",
    order: 6,
    visible: true,
    menuItems: [
      {
        id: "item-23",
        name: "Mochi Ice Cream",
        description: "Sweet rice cake filled with ice cream.",
        price: 5.5,
        imageUrl:
          "https://sjc.microlink.io/AiT80RfpM8nx_mc9H9McFei_eoyghd2ZuYdDEkJLIppv43OHi1iPSmS5zTSPE8d7dYG1OSu_fUm7xOLa87qm1Q.jpeg",
        available: true,
        categoryId: "cat-6",
        deleted: false,
        optionGroups: [
          {
            id: "group-18",
            name: "Flavor",
            required: true,
            options: [
              { id: "opt-50", optionName: "Vanilla", priceDelta: 0 },
              { id: "opt-51", optionName: "Green Tea", priceDelta: 0 },
              { id: "opt-52", optionName: "Red Bean", priceDelta: 0 },
              { id: "opt-53", optionName: "Mango", priceDelta: 0.5 },
            ],
          },
        ],
      },
      {
        id: "item-24",
        name: "Dorayaki",
        description: "Pancake sandwich filled with sweet red bean paste.",
        price: 4.0,
        imageUrl: "https://cdn.pixabay.com/photo/2017/05/07/08/56/pancakes-2291908_1280.jpg",
        available: true,
        categoryId: "cat-6",
        deleted: false,
        optionGroups: [],
      },
      {
        id: "item-25",
        name: "Matcha Cheesecake",
        description: "Creamy cheesecake with matcha flavor.",
        price: 6.0,
        imageUrl:
          "https://sjc.microlink.io/AiT80RfpM8nx_mc9H9McFei_eoyghd2ZuYdDEkJLIppv43OHi1iPSmS5zTSPE8d7dYG1OSu_fUm7xOLa87qm1Q.jpeg",
        available: true,
        categoryId: "cat-6",
        deleted: false,
        optionGroups: [],
      },
    ],
  },
]

// Flatten menu items for easier access
export const menuItems = mockCategories.flatMap((category) =>
  category.menuItems.map((item) => ({
    ...item,
    category: {
      id: category.id,
      name: category.name,
    },
  }))
)


// Mock cart/order data with more items
export const mockOrder = {
  "id": "035879b9-243f-45ec-97ac-8e667ecf3199",
  "orderNumber": "R250525-0001",
  "phone": "555000001",
  "name": "Customer 1",
  "status": "PENDING",
  "subtotal": 16.0,
  "taxAmount": 1.4,
  "serviceFee": 0.5,
  "total": 17.9,
  "paymentStatus": "UNPAID",
  "orderSource": "mobile",
  "customerNote": "Please make it quick!",
  "userId": null,
  "createdAt": "2025-05-25T00:03:51.086340",
  "items": [
    {
      "id": "105f6370-b559-4f91-b373-ca4f4c26f541",
      "orderId": "035879b9-243f-45ec-97ac-8e667ecf3199",
      "menuItemId": "item-1",
      "nameSnapshot": "Spicy Ramen",
      "imageUrlSnapshot": "https://cdn.pixabay.com/photo/2017/03/10/13/57/cooking-2132874_1280.jpg",
      "categorySnapshot": "Noodles",
      "quantity": 2,
      "note": "Extra spicy",
      "unitPrice": 8.0,
      "finalPrice": 16.0,
      "options": [
        {
          "id": "9576de84-16a3-40a8-befa-38b7c644011c",
          "orderItemId": "order_item_1",
          "menuOptionId": "opt-2",
          "priceDelta": 0,
          "quantity": 1,
          "optionNameSnapshot": "Medium",
          "groupNameSnapshot": "Spice Level"
        }
      ]
    }
  ]
};

export const mockOrders = [
  {
    "id": "035879b9-243f-45ec-97ac-8e667ecf3199",
    "orderNumber": "R250525-0001",
    "phone": "555000001",
    "name": "Customer 1",
    "status": "PENDING",
    "subtotal": 16.0,
    "taxAmount": 1.4,
    "serviceFee": 0.5,
    "total": 17.9,
    "paymentStatus": "UNPAID",
    "orderSource": "mobile",
    "customerNote": "Please make it quick!",
    "userId": null,
    "createdAt": "2025-05-25T00:03:51.086340",
    "items": [
      {
        "id": "105f6370-b559-4f91-b373-ca4f4c26f541",
        "orderId": "035879b9-243f-45ec-97ac-8e667ecf3199",
        "menuItemId": "item-1",
        "nameSnapshot": "Spicy Ramen",
        "imageUrlSnapshot": "https://cdn.pixabay.com/photo/2017/03/10/13/57/cooking-2132874_1280.jpg",
        "categorySnapshot": "Noodles",
        "quantity": 2,
        "note": "Extra spicy",
        "unitPrice": 8.0,
        "finalPrice": 16.0,
        "options": [
          {
            "id": "9576de84-16a3-40a8-befa-38b7c644011c",
            "orderItemId": "order_item_1",
            "menuOptionId": "opt-2",
            "priceDelta": 0,
            "quantity": 1,
            "optionNameSnapshot": "Medium",
            "groupNameSnapshot": "Spice Level"
          }
        ]
      }
    ]
  },
  {
    "id": "bd019bfb-89b3-4d83-a7f2-ede1f5232d90",
    "orderNumber": "R250525-0002",
    "phone": "555000002",
    "name": "Customer 2",
    "status": "PENDING",
    "subtotal": 17.0,
    "taxAmount": 1.49,
    "serviceFee": 0.5,
    "total": 18.99,
    "paymentStatus": "UNPAID",
    "orderSource": "mobile",
    "customerNote": "Please make it quick!",
    "userId": null,
    "createdAt": "2025-05-24T23:53:51.088715",
    "items": [
      {
        "id": "b3120834-346d-4db5-9101-fe78787e8c3b",
        "orderId": "bd019bfb-89b3-4d83-a7f2-ede1f5232d90",
        "menuItemId": "item-1",
        "nameSnapshot": "Spicy Ramen",
        "imageUrlSnapshot": "https://cdn.pixabay.com/photo/2017/03/10/13/57/cooking-2132874_1280.jpg",
        "categorySnapshot": "Noodles",
        "quantity": 2,
        "note": "Extra spicy",
        "unitPrice": 8.5,
        "finalPrice": 17.0,
        "options": [
          {
            "id": "c6afd751-c863-453a-b43a-80aeddd5df32",
            "orderItemId": "order_item_1",
            "menuOptionId": "opt-2",
            "priceDelta": 0,
            "quantity": 1,
            "optionNameSnapshot": "Medium",
            "groupNameSnapshot": "Spice Level"
          }
        ]
      }
    ]
  },
  {
    "id": "821ebed7-067a-4ac0-b199-c7d91295397f",
    "orderNumber": "R250525-0003",
    "phone": "555000003",
    "name": "Customer 3",
    "status": "PENDING",
    "subtotal": 15.0,
    "taxAmount": 1.31,
    "serviceFee": 0.5,
    "total": 16.81,
    "paymentStatus": "UNPAID",
    "orderSource": "mobile",
    "customerNote": "Please make it quick!",
    "userId": null,
    "createdAt": "2025-05-24T23:43:51.089261",
    "items": [
      {
        "id": "8e145046-5b23-4db5-abee-21497510817d",
        "orderId": "821ebed7-067a-4ac0-b199-c7d91295397f",
        "menuItemId": "item-1",
        "nameSnapshot": "Spicy Ramen",
        "imageUrlSnapshot": "https://cdn.pixabay.com/photo/2017/03/10/13/57/cooking-2132874_1280.jpg",
        "categorySnapshot": "Noodles",
        "quantity": 2,
        "note": "Extra spicy",
        "unitPrice": 7.5,
        "finalPrice": 15.0,
        "options": [
          {
            "id": "532de8ac-9354-445d-a7d2-f4d1ab70a8a7",
            "orderItemId": "order_item_1",
            "menuOptionId": "opt-2",
            "priceDelta": 0,
            "quantity": 1,
            "optionNameSnapshot": "Medium",
            "groupNameSnapshot": "Spice Level"
          }
        ]
      }
    ]
  },
  {
    "id": "6ed951a5-b308-45bd-99c0-efafe60e2ba6",
    "orderNumber": "R250525-0004",
    "phone": "555000004",
    "name": "Customer 4",
    "status": "PENDING",
    "subtotal": 15.0,
    "taxAmount": 1.31,
    "serviceFee": 0.5,
    "total": 16.81,
    "paymentStatus": "UNPAID",
    "orderSource": "mobile",
    "customerNote": "Please make it quick!",
    "userId": null,
    "createdAt": "2025-05-24T23:33:51.091236",
    "items": [
      {
        "id": "cf99a29d-91ca-4a16-92a4-103cfd273fb2",
        "orderId": "6ed951a5-b308-45bd-99c0-efafe60e2ba6",
        "menuItemId": "item-1",
        "nameSnapshot": "Spicy Ramen",
        "imageUrlSnapshot": "https://cdn.pixabay.com/photo/2017/03/10/13/57/cooking-2132874_1280.jpg",
        "categorySnapshot": "Noodles",
        "quantity": 2,
        "note": "Extra spicy",
        "unitPrice": 7.5,
        "finalPrice": 15.0,
        "options": [
          {
            "id": "1dd66985-3760-4603-9517-684c1ef9b24d",
            "orderItemId": "order_item_1",
            "menuOptionId": "opt-2",
            "priceDelta": 0,
            "quantity": 1,
            "optionNameSnapshot": "Medium",
            "groupNameSnapshot": "Spice Level"
          }
        ]
      }
    ]
  },
  {
    "id": "78d049fd-2a8b-45dc-ad93-d0954b27e388",
    "orderNumber": "R250525-0005",
    "phone": "555000005",
    "name": "Customer 5",
    "status": "PENDING",
    "subtotal": 23.0,
    "taxAmount": 2.01,
    "serviceFee": 0.5,
    "total": 25.51,
    "paymentStatus": "UNPAID",
    "orderSource": "mobile",
    "customerNote": "Please make it quick!",
    "userId": null,
    "createdAt": "2025-05-24T23:23:51.091374",
    "items": [
      {
        "id": "88653ccc-1738-4b89-a2de-1f089a5946d3",
        "orderId": "78d049fd-2a8b-45dc-ad93-d0954b27e388",
        "menuItemId": "item-1",
        "nameSnapshot": "Spicy Ramen",
        "imageUrlSnapshot": "https://cdn.pixabay.com/photo/2017/03/10/13/57/cooking-2132874_1280.jpg",
        "categorySnapshot": "Noodles",
        "quantity": 2,
        "note": "Extra spicy",
        "unitPrice": 11.5,
        "finalPrice": 23.0,
        "options": [
          {
            "id": "02264a91-1568-4c81-860f-1776506ca003",
            "orderItemId": "order_item_1",
            "menuOptionId": "opt-2",
            "priceDelta": 0,
            "quantity": 1,
            "optionNameSnapshot": "Medium",
            "groupNameSnapshot": "Spice Level"
          }
        ]
      }
    ]
  }
];
