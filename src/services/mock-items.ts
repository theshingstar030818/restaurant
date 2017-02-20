export let ITEMS = [
  {
    id: 1,
    name: "Rib eye steak",
    price: 14.20,
    offer: 40,
    thumb: "assets/img/items/thumbs/rib_eyes.jpg",
    images: [
      "assets/img/items/rib_eye_2.jpg",
      "assets/img/items/rib_eye_3.jpg",
      "assets/img/items/rib_eye_4.jpg"
    ],
    description: "Beef steak, sauce, french fries",
    faved: true,
    options: [
      {
        id: 1,
        name: "Tomatoes"
      },
      {
        id: 2,
        name: "Olives"
      },
      {
        id: 3,
        name: "Oregano"
      }
    ],
    extras: [
      {
        id: 1,
        name: "Cheese",
        price: 1.2
      },
      {
        id: 2,
        name: "Cheese x2",
        price: 1.5
      }
    ],
    sizes: [
      {
        id: 1,
        name: "Standard",
        price: 8
      },
      {
        id: 2,
        name: "Large",
        price: 12
      }
    ],
    reviews: [
      {
        id: 1,
        user_id: 1,
        username: "Adam",
        face: "assets/img/people/adam.jpg",
        text: "Incredibly delicious tender steak! Be sure to order more",
        images: []
      },
      {
        id: 2,
        user_id: 3,
        username: "Ben",
        face: "assets/img/people/ben.png",
        text: "Mmm.... Amazing! Steaks are very good",
        images: []
      },
      {
        id: 3,
        user_id: 3,
        username: "Max",
        face: "assets/img/people/max.png",
        text: "Incredibly delicious tender steak! Be sure to order more",
        images: []
      }
    ]
  },
  {
    id: 2,
    name: "Seared Tuna",
    price: 15.20,
    offer: 20,
    thumb: "assets/img/items/thumbs/seared_tuna.jpg"
  },
  {
    id: 3,
    name: "Brick chicken",
    price: 16.20,
    offer: 40,
    thumb: "assets/img/items/thumbs/brick_chicken.jpg"
  },
  {
    id: 4,
    name: "Fried calamari",
    price: 17.20,
    offer: 50,
    thumb: "assets/img/items/thumbs/fried_calamari.jpg"
  },
  {
    id: 5,
    name: "Zuppa",
    price: 17.20,
    offer: 20,
    thumb: "assets/img/items/thumbs/zuppa.jpg"
  }
]
