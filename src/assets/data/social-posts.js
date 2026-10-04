import { addOrSubtractDaysFromDate, addOrSubtractMinutesFromDate } from '@/utils/date';
import avatar1 from '@/assets/images/users/avatar-1.jpg';
import avatar2 from '@/assets/images/users/avatar-2.jpg';
import avatar3 from '@/assets/images/users/avatar-3.jpg';
import avatar4 from '@/assets/images/users/avatar-4.jpg';
import avatar5 from '@/assets/images/users/avatar-5.jpg';
import avatar6 from '@/assets/images/users/avatar-6.jpg';
import avatar7 from '@/assets/images/users/avatar-7.jpg';
import avatar8 from '@/assets/images/users/avatar-8.jpg';
import avatar9 from '@/assets/images/users/avatar-9.jpg';
import avatar10 from '@/assets/images/users/avatar-10.jpg';
import avatar11 from '@/assets/images/users/avatar-11.jpg';
import avatar12 from '@/assets/images/users/avatar-12.jpg';
import groupImg1 from '@/assets/images/app-social/group-1.jpg';
import groupImg2 from '@/assets/images/app-social/group-2.jpg';
import groupImg3 from '@/assets/images/app-social/group-3.jpg';
import groupImg4 from '@/assets/images/app-social/group-4.jpg';
import groupImg5 from '@/assets/images/app-social/group-5.jpg';
import groupImg6 from '@/assets/images/app-social/group-6.jpg';
import groupImg7 from '@/assets/images/app-social/group-7.jpg';
import groupImg8 from '@/assets/images/app-social/group-8.jpg';
import groupImg9 from '@/assets/images/app-social/group-9.jpg';
import postImg1 from '@/assets/images/app-social/post-1.jpg';
import postImg2 from '@/assets/images/app-social/post-2.jpg';
import postImg3 from '@/assets/images/app-social/post-3.jpg';
import postImg4 from '@/assets/images/app-social/post-4.jpg';
import postImg6 from '@/assets/images/app-social/post-6.jpg';
import postImg7 from '@/assets/images/app-social/post-7.jpg';
import favorite1 from '@/assets/images/app-social/favorite-1.jpg';
import favorite2 from '@/assets/images/app-social/favorite-2.jpg';
import favorite3 from '@/assets/images/app-social/favorite-3.jpg';
import favorite4 from '@/assets/images/app-social/favorite-4.jpg';
import small1 from '@/assets/images/small/img-1.jpg';
import small2 from '@/assets/images/small/img-2.jpg';
import small3 from '@/assets/images/small/img-3.jpg';
export const socialCommentsData = [{
  id: '401',
  postId: '10002',
  comment: 'Nice work, makes me think of The Money Pit.',
  likesCount: 7,
  socialUserId: '103',
  children: [{
    id: '402',
    comment: "i'm in the middle of a timelapse animation myself! (Very different though.) Awesome stuff.",
    likesCount: 1,
    postId: '10002',
    replyTo: '401',
    socialUserId: '104',
    children: [{
      id: '404',
      comment: 'Nice work, makes me think of The Money Pit.',
      likesCount: 3,
      postId: '10002',
      replyTo: '401',
      socialUserId: '105'
    }]
  }, {
    id: '405',
    comment: "i'm in the middle of a timelapse animation myself! (Very different though.) Awesome stuff.",
    likesCount: 5,
    postId: '10002',
    replyTo: '401',
    socialUserId: '106'
  }]
}, {
  id: '403',
  postId: '10008',
  comment: "i'm in the middle of a timelapse animation myself! (Very different though.) Awesome stuff.",
  likesCount: 2,
  socialUserId: '105'
}];
export const socialPostsData = [{
  id: '10001',
  socialUserId: '101',
  caption: 'Story based around the idea of time lapse, animation to post soon!',
  photos: [postImg1, postImg2, postImg3, postImg4, postImg7, postImg6],
  likesCount: 1504,
  commentsCount: 521,
  createdAt: addOrSubtractMinutesFromDate(2)
}, {
  id: '10002',
  socialUserId: '102',
  caption: '🌟✨ Just spent the most amazing weekend camping in the wilderness! 🏕️🌲 Nothing beats disconnecting from the hustle and bustle of city life and reconnecting with nature.',
  likesCount: 260,
  commentsCount: 234,
  createdAt: addOrSubtractMinutesFromDate(61)
}, {
  id: '10003',
  socialUserId: '103',
  caption: 'The parallax is a little odd but O.o that house build is awesome!!',
  likesCount: 3560,
  commentsCount: 897,
  embedLink: 'https://player.vimeo.com/video/87993762',
  createdAt: addOrSubtractMinutesFromDate(662)
}, {
  id: '10004',
  socialUserId: '104',
  likesCount: 1504,
  liked: true,
  commentsCount: 653,
  photos: [postImg2, postImg3],
  createdAt: addOrSubtractMinutesFromDate(895),
  saved: true
}, {
  id: '10005',
  socialUserId: '105',
  likesCount: 1005,
  liked: true,
  commentsCount: 895,
  photos: [postImg4],
  createdAt: addOrSubtractMinutesFromDate(896),
  saved: true
}, {
  id: '10006',
  socialUserId: '106',
  likesCount: 6350,
  commentsCount: 2203,
  liked: true,
  caption: '“Not only must we be good, but we must also be good for something.”',
  createdAt: addOrSubtractMinutesFromDate(1200),
  saved: true
}, {
  id: '10007',
  socialUserId: '107',
  likesCount: 3560,
  commentsCount: 523,
  embedLink: 'https://www.youtube.com/embed/i8KnCFq4Sw0',
  createdAt: addOrSubtractMinutesFromDate(1325),
  saved: true
}, {
  id: '10008',
  socialUserId: '108',
  likesCount: 1503,
  liked: true,
  commentsCount: 720,
  caption: 'Cant go wrong with Bernadette Clothes \n Affordable Price and Top Quality \n COD Available, 10 days return policy',
  tags: ['#Clothes', '#Trendy', '#Shirts'],
  photos: [favorite1],
  createdAt: addOrSubtractMinutesFromDate(301),
  saved: true
}, {
  id: '10009',
  socialUserId: '109',
  likesCount: 1301,
  liked: true,
  commentsCount: 451,
  caption: 'Cant go wrong with Bernadette Clothes \n Affordable Price and Top Quality \n COD Available, 10 days return policy',
  tags: ['#Grocery', '#HomeMaterial', '#Foods', '#Market'],
  photos: [favorite2],
  createdAt: addOrSubtractMinutesFromDate(361),
  saved: true
}, {
  id: '10010',
  socialUserId: '110',
  likesCount: 1250,
  commentsCount: 256,
  caption: 'Land of elves in Norse mythology. \n The "otherworld" of Welsh mythology. \n The city in which King Arthur reigned.',
  tags: ['#Travelling', '#Nature'],
  photos: [favorite3],
  createdAt: addOrSubtractMinutesFromDate(361),
  saved: true
}, {
  id: '10011',
  socialUserId: '111',
  likesCount: 1001,
  liked: true,
  commentsCount: 345,
  caption: 'Academic Library \n Special Library. \n Public Library.',
  tags: ['#LoveReading', '#Book'],
  photos: [favorite4],
  createdAt: addOrSubtractMinutesFromDate(985),
  saved: true
}, {
  id: '10012',
  socialUserId: '112',
  likesCount: 9520,
  liked: true,
  commentsCount: 4020,
  embedLink: 'https://www.youtube.com/embed/c9Wg6Cb_YlU',
  createdAt: addOrSubtractDaysFromDate(1)
}, {
  id: '10013',
  socialUserId: '101',
  likesCount: 91220,
  commentsCount: 8651,
  embedLink: 'https://www.youtube.com/embed/CXkjHLBr_y0',
  createdAt: addOrSubtractDaysFromDate(1)
}, {
  id: '10014',
  socialUserId: '102',
  likesCount: 854,
  commentsCount: 102,
  embedLink: 'https://www.youtube.com/embed/IJ_LDIlYnjw',
  createdAt: addOrSubtractDaysFromDate(3)
}, {
  id: '10015',
  socialUserId: '103',
  likesCount: 3850,
  commentsCount: 663,
  embedLink: 'https://www.youtube.com/embed/ehmsJLZlCZ0',
  createdAt: addOrSubtractDaysFromDate(4)
}];
export const socialUsersData = [{
  id: '101',
  avatar: avatar1,
  name: 'Victoria P. Miller',
  mutualCount: 43,
  email: 'hildabbridges@teleworm.us',
  message: 'How are you today?',
  time: addOrSubtractMinutesFromDate(10),
  phone: '456 9595 9594',
  location: 'California, USA',
  languages: ['English', 'German', 'Spanish'],
  activityStatus: 'online'
}, {
  id: '102',
  avatar: avatar2,
  name: 'Dallas C. Payne',
  mutualCount: 856,
  email: 'kevinmbacon@dayrep.com',
  message: "Hey! a reminder for tommorow's meeting...",
  time: addOrSubtractMinutesFromDate(20),
  status: '** no status **',
  phone: '456 9595 9486',
  location: 'New Jersey, USA',
  languages: ['English', 'German', 'Spanish'],
  activityStatus: 'offline'
}, {
  id: '103',
  avatar: avatar3,
  name: 'Florence A. Lopez',
  mutualCount: 52,
  email: 'sherriewtorres@dayrep.com',
  message: "Hello! I just got your assignment, everything's alright, exce",
  time: addOrSubtractMinutesFromDate(50),
  activityStatus: 'typing',
  status: '|| Karma ||',
  phone: '456 9595 9562',
  location: 'California, USA',
  languages: ['English', 'German', 'Spanish']
}, {
  id: '104',
  avatar: avatar4,
  name: 'Gail A. Nix',
  mutualCount: 12,
  email: 'davidrwill@teleworm.us',
  message: "Are we going to have this week's planning meeting today?",
  time: addOrSubtractMinutesFromDate(100),
  status: 'Hey there! I am using Chat.',
  phone: '456 9595 8956',
  location: 'New York, USA',
  languages: ['English', 'German', 'Spanish'],
  activityStatus: 'offline'
}, {
  id: '105',
  avatar: avatar5,
  name: 'Lynne J. Petty',
  mutualCount: 548,
  email: 'darylvdonnellan@teleworm.us',
  message: 'Please check this template...',
  time: addOrSubtractMinutesFromDate(150),
  status: 'TM',
  phone: '456 9595 9594',
  location: 'California, USA',
  languages: ['English', 'German', 'Spanish'],
  activityStatus: 'offline'
}, {
  id: '106',
  avatar: avatar6,
  name: 'Victoria P. Miller',
  mutualCount: 0,
  email: 'risahcuevas@jourrapide.com',
  message: 'Are free for 10 minutes? would like to discuss something...',
  time: addOrSubtractMinutesFromDate(200),
  status: 'Available',
  phone: '456 9595 9594',
  location: 'California, USA',
  languages: ['English', 'German', 'Spanish'],
  activityStatus: 'online'
}, {
  id: '107',
  avatar: avatar7,
  name: 'Dallas C. Payne',
  mutualCount: 856,
  hasRequested: true,
  email: 'darylvdonnellan@teleworm.us',
  message: 'How are you?',
  time: addOrSubtractMinutesFromDate(250),
  status: 'Hey there! I am using Chat.',
  phone: '456 9595 9594',
  location: 'California, USA',
  languages: ['English', 'German', 'Spanish'],
  activityStatus: 'online'
}, {
  id: '108',
  avatar: avatar8,
  name: 'Florence A. Lopez',
  mutualCount: 52,
  email: 'florencevdonnellan@teleworm.us',
  message: 'Whats going on?',
  time: addOrSubtractMinutesFromDate(350),
  phone: '456 9595 9865',
  location: 'California, USA',
  languages: ['English', 'German', 'Spanish'],
  activityStatus: 'offline'
}, {
  id: '109',
  avatar: avatar9,
  name: 'Gail A. Nix',
  mutualCount: 12,
  email: 'gaila@teleworm.us',
  message: 'Would you like to join us?',
  time: addOrSubtractMinutesFromDate(450),
  phone: '456 9595 9594',
  location: 'California, USA',
  languages: ['English', 'German', 'Spanish'],
  activityStatus: 'offline'
}, {
  id: '110',
  avatar: avatar10,
  name: 'Lynne J. Petty',
  mutualCount: 54,
  email: 'lynnepetty@teleworm.us',
  message: 'Hello! You asked me for some extra excercises to train CO. Here you are, like I promissed.',
  time: addOrSubtractMinutesFromDate(500),
  phone: '456 9595 9594',
  location: 'California, USA',
  languages: ['English', 'German', 'Spanish'],
  activityStatus: 'typing'
}, {
  id: '111',
  avatar: avatar11,
  name: 'Tonya J. Hill',
  mutualCount: 123,
  hasRequested: true,
  email: 'tonyahill@teleworm.us',
  message: 'Hey! Okay, thank you for letting me know. See you!',
  time: addOrSubtractMinutesFromDate(600),
  phone: '456 9595 3265',
  location: 'California, USA',
  languages: ['English', 'German', 'Spanish'],
  activityStatus: 'online'
}, {
  id: '112',
  avatar: avatar12,
  name: 'James A. Briggs',
  mutualCount: 56,
  email: 'jamesbridge@teleworm.us',
  message: 'Hey! Okay, thank you for letting me know. See you!',
  time: addOrSubtractMinutesFromDate(650),
  phone: '456 9595 9594',
  location: 'California, USA',
  languages: ['English', 'German', 'Spanish'],
  activityStatus: 'offline'
}];