export interface UsesItem {
  label: string;
  name: string;
  link: string;
}

export interface UsesCategory {
  category: string;
  items: UsesItem[];
}

export const usesData: UsesCategory[] = [
  {
    category: 'Software',
    items: [
      {
        label: 'Video Screening',
        name: 'OBS Studio + OpenScreen',
        link: 'https://obsproject.com/',
      },
      {
        label: 'Screenshots Mockup',
        name: 'Shots so',
        link: 'https://shots.so/',
      },
      {
        label: 'Video Editing',
        name: 'VN Android App',
        link: 'https://www.vlognow.me/',
      },
      {
        label: 'Image Editing',
        name: 'PixelLab Android App',
        link: 'https://play.google.com/store/apps/details?id=com.imaginstudio.imagetools.pixellab',
      },
      {
        label: 'Auto Caption',
        name: 'AutoCap Android App ( Paid )',
        link: 'https://play.google.com/store/apps/details?id=com.autocap',
      },
      {
        label: 'Notes',
        name: 'Notion',
        link: 'https://www.notion.so/',
      },
      {
        label: 'Chat / Community',
        name: 'Discord',
        link: 'https://discord.com/',
      },
      {
        label: 'Music',
        name: 'YouTube Music',
        link: 'https://music.youtube.com/',
      },
      {
        label: 'Website Inspiration',
        name: 'Pinterest',
        link: 'https://pinterest.com/',
      },
      {
        label: 'Coding / Development',
        name: 'VsCode',
        link: 'https://code.visualstudio.com/',
      },
    ],
  },
  {
    category: 'Hardware',
    items: [
      {
        label: 'Keyboard',
        name: 'EvoFox Katana S Mini Mechanical Keyboards',
        link: 'https://www.amkette.com/products/evofox-katana-s-mini-mechanical-gaming-keyboard',
      },
      {
        label: 'Mouse',
        name: 'Arctic Fox Pureview Transparent Wireless Mouse',
        link: 'https://arcticfox.com/',
      },
      {
        label: 'Laptop',
        name: 'Macbook M5 pro',
        link: 'https://www.apple.com/macbook-pro/',
      },
      {
        label: 'Monitor',
        name: 'Kreo Obsidian 27|100Q 27" QHD IPS Monitor',
        link: 'https://kreo-tech.com/',
      },
    ],
  },
];
