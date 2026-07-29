import { HiOutlineHome, HiOutlineCollection, HiOutlineUserGroup, HiOutlineChartBar, HiOutlineDocumentText, HiOutlineChatAlt2, HiOutlineCog, HiOutlineBriefcase } from 'react-icons/hi';

export const sidebarMenu = [
  {
    title: 'Dashboard',
    icon: HiOutlineHome,
    path: '/admin/dashboard',
    roles: ['SUPER_ADMIN', 'EDITOR', 'MARKETING_MANAGER', 'SEO_MANAGER', 'MEDIA_MANAGER'],
  },
  {
    title: 'Homepage',
    icon: HiOutlineCollection,
    path: '/admin/homepage',
    roles: ['SUPER_ADMIN', 'EDITOR'],
  },
  {
    title: 'Pages',
    icon: HiOutlineDocumentText,
    path: '/admin/pages',
    roles: ['SUPER_ADMIN', 'EDITOR'],
  },
  {
    title: 'Services',
    icon: HiOutlineBriefcase,
    path: '/admin/services',
    roles: ['SUPER_ADMIN', 'EDITOR'],
  },
  {
    title: 'Blogs',
    icon: HiOutlineChatAlt2,
    path: '/admin/blogs',
    roles: ['SUPER_ADMIN', 'EDITOR'],
  },
  {
    title: 'Media',
    icon: HiOutlineCog,
    path: '/admin/media',
    roles: ['SUPER_ADMIN', 'MEDIA_MANAGER'],
  },
  // add more items as needed
];
