import product11 from '@/assets/images/products/product-1(1).png';
import product2 from '@/assets/images/products/product-2.png';
import product3 from '@/assets/images/products/product-3.png';
import product4 from '@/assets/images/products/product-4.png';
import product5 from '@/assets/images/products/product-5.png';
import product6 from '@/assets/images/products/product-6.png';
import product12 from '@/assets/images/products/product-1(2).png';
export const ecommerceProductsData = [{
  id: '10001',
  categoryId: '1001',
  sellerId: '101',
  name: 'G15 Gaming Laptop',
  description: 'Power Your Laptop with a Long-Lasting and Fast-Charging Battery.',
  images: [product11],
  price: 999,
  quantity: 9,
  review: {
    count: 1055,
    stars: 5
  },
  sale: {
    discount: 50,
    type: 'percent'
  }
}, {
  id: '10002',
  categoryId: '1002',
  sellerId: '102',
  name: 'Sony Alpha ILCE 6000Y 24.3 MP Mirrorless Digital SLR Camera',
  description: 'Capture special moments and portraits to remember and share.',
  images: [product2],
  price: 485,
  quantity: 10,
  review: {
    count: 680,
    stars: 5
  }
}, {
  id: '10003',
  categoryId: '1003',
  sellerId: '103',
  name: 'Sony Over-Ear Wireless Headphone with Mic',
  description: "Headphones are a pair of small loudspeaker drivers worn on or around the head over a user's ears.",
  images: [product3],
  price: 698,
  quantity: 56,
  review: {
    count: 2394,
    stars: 4.5
  },
  sale: {
    discount: 5,
    type: 'amount'
  }
}, {
  id: '10004',
  categoryId: '1004',
  sellerId: '104',
  name: 'Apple iPad Pro with Apple M1 chip',
  description: 'The new iPad mini and iPad.',
  images: [product4],
  price: 356,
  quantity: 0,
  review: {
    count: 588,
    stars: 5
  }
}, {
  id: '10005',
  categoryId: '1005',
  sellerId: '105',
  name: 'Adam ROMA USB-C / USB-A 3.1 (2-in-1 Flash Drive) – 128GB',
  description: 'A USB flash drive is a data storage device that includes flash memory with an integrated USB interface.',
  images: [product5],
  price: 854,
  quantity: 390,
  review: {
    count: 650,
    stars: 5
  },
  sale: {
    discount: 12,
    type: 'amount'
  }
}, {
  id: '10006',
  categoryId: '1004',
  sellerId: '106',
  name: 'Apple iPHone 13',
  description: 'The new iPHone 1 and iPad.',
  images: [product6],
  price: 763,
  quantity: 209,
  review: {
    count: 129,
    stars: 5
  }
}, {
  id: '10007',
  categoryId: '1001',
  sellerId: '107',
  name: 'Apple Mac',
  description: 'Power Your Laptop with a Long-Lasting and Fast-Charging Battery.',
  images: [product12],
  price: 629,
  quantity: 2,
  review: {
    count: 523,
    stars: 5
  },
  sale: {
    discount: 40,
    type: 'percent'
  }
}];
export const ordersData = [{
  id: '3001',
  productId: '10001',
  customerId: '2001',
  createdAt: new Date('03/07/2021'),
  paymentMethod: 'Credit Card',
  status: 'Delivered'
}, {
  id: '3002',
  productId: '10002',
  customerId: '2002',
  createdAt: new Date('06/09/2018'),
  paymentMethod: 'Credit Card',
  status: 'Processing'
}, {
  id: '3003',
  productId: '10003',
  customerId: '2003',
  createdAt: new Date('12/07/2019'),
  paymentMethod: 'Pay Pal',
  status: 'Cancelled'
}, {
  id: '3004',
  productId: '10004',
  customerId: '2004',
  createdAt: new Date('01/12/2021'),
  paymentMethod: 'Credit Card',
  status: 'Delivered'
}, {
  id: '3005',
  productId: '10005',
  customerId: '2005',
  createdAt: new Date('01/05/2018'),
  paymentMethod: 'Pay Pal',
  status: 'Delivered'
}, {
  id: '3006',
  productId: '10006',
  customerId: '2006',
  createdAt: new Date('12/06/2020'),
  paymentMethod: 'Pay Pal',
  status: 'Processing'
}, {
  id: '3007',
  productId: '10007',
  customerId: '2007',
  createdAt: new Date('04/08/2017'),
  paymentMethod: 'Credit Card',
  status: 'Processing'
}, {
  id: '3008',
  productId: '10003',
  customerId: '2008',
  createdAt: new Date('03/07/2018'),
  paymentMethod: 'Credit Card',
  status: 'Cancelled'
}, {
  id: '3009',
  productId: '10002',
  customerId: '2009',
  createdAt: new Date('08/11/2019'),
  paymentMethod: 'Google Pay',
  status: 'Delivered'
}, {
  id: '3010',
  productId: '10005',
  customerId: '2010',
  createdAt: new Date('07/03/2019'),
  paymentMethod: 'Google Pay',
  status: 'Processing'
}];
export const inventoryData = [{
  id: '4001',
  productId: '10001',
  condition: 'New',
  location: 'WareHouse 1',
  quantity: 3521,
  reserved: 6532,
  onHand: 1236,
  lastModifiedAt: new Date('12/03/2021')
}, {
  id: '4002',
  productId: '10002',
  condition: 'New',
  location: 'WareHouse 2',
  quantity: 4562,
  reserved: 256,
  onHand: 214,
  lastModifiedAt: new Date('06/04/2021')
}, {
  id: '4003',
  productId: '10003',
  condition: 'Returned',
  location: 'WareHouse 3',
  quantity: 125,
  reserved: 4512,
  onHand: 412,
  lastModifiedAt: new Date('21/05/2020')
}, {
  id: '4004',
  productId: '10004',
  condition: 'Damaged',
  location: 'WareHouse 1',
  quantity: 4523,
  reserved: 1241,
  onHand: 852,
  lastModifiedAt: new Date('15/03/2021')
}, {
  id: '4005',
  productId: '10005',
  condition: 'New',
  location: 'WareHouse 2',
  quantity: 1475,
  reserved: 2345,
  onHand: 1256,
  lastModifiedAt: new Date('15/10/2020')
}];
export const invoicesData = [{
  id: 'RB6985',
  productId: '10001',
  customerId: '2001',
  orderId: '3001'
}, {
  id: 'RB1002',
  productId: '10002',
  customerId: '2002',
  orderId: '3002'
}, {
  id: 'RB3652',
  productId: '10003',
  customerId: '2003',
  orderId: '3003'
}, {
  id: 'RB7854',
  productId: '10004',
  customerId: '2004',
  orderId: '3004'
}, {
  id: 'RB9521',
  productId: '10005',
  customerId: '2005',
  orderId: '3005'
}, {
  id: 'RB9634',
  productId: '10006',
  customerId: '2006',
  orderId: '3006'
}, {
  id: 'RB8520',
  productId: '10007',
  customerId: '2007',
  orderId: '3007'
}, {
  id: 'RB3590',
  productId: '10003',
  customerId: '2008',
  orderId: '3008'
}, {
  id: 'RB5872',
  productId: '10005',
  customerId: '2009',
  orderId: '3009'
}, {
  id: 'RB1158',
  productId: '10002',
  customerId: '2010',
  orderId: '3010'
}];