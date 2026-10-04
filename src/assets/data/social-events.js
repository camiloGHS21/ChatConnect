import { addOrSubtractDaysFromDate, addOrSubtractMinutesFromDate } from '@/utils/date';
import avatar10 from '@/assets/images/users/avatar-10.jpg';
import groupImg1 from '@/assets/images/app-social/group-1.jpg';
import groupImg2 from '@/assets/images/app-social/group-2.jpg';
import groupImg3 from '@/assets/images/app-social/group-3.jpg';
import groupImg4 from '@/assets/images/app-social/group-4.jpg';
import groupImg5 from '@/assets/images/app-social/group-5.jpg';
import groupImg6 from '@/assets/images/app-social/group-6.jpg';
import groupImg7 from '@/assets/images/app-social/group-7.jpg';
import groupImg8 from '@/assets/images/app-social/group-8.jpg';
import groupImg9 from '@/assets/images/app-social/group-9.jpg';
import small1 from '@/assets/images/small/img-1.jpg';
import small2 from '@/assets/images/small/img-2.jpg';
import small3 from '@/assets/images/small/img-3.jpg';
import { socialUsersData } from './social-posts';

export const socialEventsData = [{
  id: '201',
  image: groupImg2,
  startsAt: addOrSubtractDaysFromDate(2),
  type: 'togetherness',
  title: 'Musical Event : Des Moines',
  venue: '4436 Southern Avenue, Iowa-50309'
}, {
  id: '202',
  image: groupImg5,
  startsAt: addOrSubtractDaysFromDate(3),
  type: 'professional',
  title: 'Antisocial Darwinism : Evansville',
  venue: '1265 Lucy Lane, Indiana-47710'
}, {
  id: '203',
  image: groupImg6,
  startsAt: addOrSubtractDaysFromDate(4),
  type: 'celebration',
  title: 'Balls of the Bull Festival : Dallas',
  venue: '1422 Liberty Street, Texas-75204'
}, {
  id: '204',
  image: groupImg7,
  startsAt: addOrSubtractDaysFromDate(5),
  type: 'professional',
  title: 'Belch Blanket Babylon : LA Follette',
  venue: '2542 Cedar Street, Tennessee-37766'
}];
export const socialGroupsData = [{
  id: '301',
  image: groupImg1,
  name: 'Interior Design & Architech',
  description: "Some quick example text to build on the card title and make up the bulk of the card's content.",
  membersCount: 23345,
  friends: true
}, {
  id: '302',
  image: groupImg2,
  name: 'Event Management',
  description: "Some quick example text to build on the card title and make up the bulk of the card's content.",
  membersCount: 26312,
  joined: true
}, {
  id: '303',
  image: groupImg3,
  name: 'Commercial University, Delhi.',
  description: "Some quick example text to build on the card title and make up the bulk of the card's content.",
  membersCount: 39678,
  friends: true
}, {
  id: '304',
  image: groupImg4,
  name: 'Tourist Place of Potland',
  description: "Some quick example text to build on the card title and make up the bulk of the card's content.",
  membersCount: 2345,
  friends: true
}, {
  id: '305',
  image: groupImg5,
  name: 'Promote Your Business',
  description: "Some quick example text to build on the card title and make up the bulk of the card's content.",
  membersCount: 7980,
  suggested: true
}, {
  id: '306',
  image: groupImg6,
  name: 'The Greasy Mullets',
  description: "Some quick example text to build on the card title and make up the bulk of the card's content.",
  membersCount: 98231,
  suggested: true
}, {
  id: '307',
  image: groupImg7,
  name: 'Tourist Place of Portland',
  description: "Some quick example text to build on the card title and make up the bulk of the card's content.",
  membersCount: 2015,
  joined: true
}, {
  id: '308',
  image: groupImg8,
  name: 'UI / UX Design',
  description: "Some quick example text to build on the card title and make up the bulk of the card's content.",
  membersCount: 1450,
  joined: true
}, {
  id: '309',
  image: groupImg9,
  name: 'Music Circle',
  description: "Some quick example text to build on the card title and make up the bulk of the card's content.",
  membersCount: 9387,
  friends: true
}, {
  id: '310',
  image: groupImg1,
  name: 'Travelling The World',
  description: "Some quick example text to build on the card title and make up the bulk of the card's content.",
  membersCount: 25800020,
  joined: true
}];
export const teamMembers = [{
  id: '701',
  memberId: '101',
  role: 'HR Manager',
  projects: 342,
  duration: '2y',
  tasks: 1032
}, {
  id: '702',
  memberId: '102',
  role: 'Web Designer',
  projects: 231,
  duration: '1.3y',
  tasks: 543
}, {
  id: '703',
  memberId: '103',
  role: 'UI/UX Designer',
  projects: 123,
  duration: '7m',
  tasks: 231
}, {
  id: '704',
  memberId: '104',
  role: 'Software Engineer',
  projects: 452,
  duration: '4y',
  tasks: 331
}, {
  id: '705',
  memberId: '105',
  role: 'Lead Product Design',
  projects: 352,
  duration: '6m',
  tasks: 463
}, {
  id: '706',
  memberId: '106',
  role: 'Project Manager',
  projects: 231,
  duration: '4y',
  tasks: 573
}];
export const messages = [];
const defaultTo = {
  id: '112',
  mutualCount: 56,
  name: 'Gilbert Chicoine',
  avatar: avatar10,
  email: 'jamesbridge@teleworm.us',
  message: 'Hey! Okay, thank you for letting me know. See you!',
  time: addOrSubtractMinutesFromDate(650),
  phone: '456 9595 9594',
  location: 'California, USA',
  languages: ['English', 'German', 'Spanish'],
  activityStatus: 'online'
};
for (const user of socialUsersData) {
  messages.push({
    id: '101',
    to: defaultTo,
    from: user,
    message: {
      type: 'text',
      value: 'Hey 😊'
    },
    sentOn: addOrSubtractMinutesFromDate(110)
  }, {
    id: '102',
    to: user,
    from: defaultTo,
    message: {
      type: 'text',
      value: 'Hii'
    },
    sentOn: addOrSubtractMinutesFromDate(110)
  }, {
    id: '103',
    to: defaultTo,
    from: user,
    message: {
      type: 'text',
      value: "Hi Gaston, thanks for joining the meeting. Let's dive into our quarterly performance review."
    },
    sentOn: addOrSubtractMinutesFromDate(110)
  }, {
    id: '104',
    to: user,
    from: defaultTo,
    message: {
      type: 'text',
      value: "Hi Gilbert, thanks for having me. I'm ready to discuss how things have been going."
    },
    sentOn: addOrSubtractMinutesFromDate(110)
  }, {
    id: '105',
    to: defaultTo,
    from: user,
    message: {
      type: 'file',
      value: [{
        preview: small1
      }, {
        preview: small2
      }, {
        preview: small3
      }]
    },
    sentOn: addOrSubtractMinutesFromDate(110)
  }, {
    id: '106',
    to: user,
    from: defaultTo,
    message: {
      type: 'file',
      value: [{
        name: 'financial-report-2024.zip',
        size: 2.3
      }]
    },
    sentOn: addOrSubtractMinutesFromDate(20)
  }, {
    id: '107',
    to: defaultTo,
    from: user,
    message: {
      type: 'text',
      value: "Thanks, Emily. I appreciate your support. Overall, I'm optimistic about our team's performance and looking forward to tackling new challenges in the next quarter."
    },
    sentOn: addOrSubtractMinutesFromDate(10)
  });
}