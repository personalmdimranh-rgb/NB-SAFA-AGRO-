"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronRight,
  LayoutDashboard,
  ShoppingBag,
  Tag,
  FileText,
  Users,
  Image as ImageIcon,
  Settings,
  Megaphone,
  Store,
  Mail
} from "lucide-react"
import { Logo } from "@/components/ui/logo"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Overview",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
        }
      ],
    },
    {
      title: "Accounts & P&L",
      url: "#",
      icon: FileText,
      roles: ['super_admin', 'admin', 'manager'],
      items: [
        {
          title: "General Ledger",
          url: "/admin/accounts",
        },
        {
          title: "Profit & Loss",
          url: "/admin/accounts/profit-loss",
        },
      ],
    },
    {
      title: "Sales & Dealers",
      url: "#",
      icon: Store,
      roles: ['super_admin', 'admin', 'manager'],
      items: [
        {
          title: "New Order",
          url: "/admin/sales/new",
        },
        {
          title: "Sales Ledger",
          url: "/admin/sales",
        },
        {
          title: "Dealer Portal Admin",
          url: "/admin/dealers",
        },
      ],
    },
    {
      title: "Farmer CRM",
      url: "#",
      icon: Users,
      roles: ['super_admin', 'admin', 'manager'],
      items: [
        {
          title: "Farmers List",
          url: "/admin/farmers",
        },
      ],
    },
    {
      title: "Production & Inventory",
      url: "#",
      icon: ShoppingBag,
      roles: ['super_admin', 'admin', 'manager'],
      items: [
        {
          title: "Silage Production",
          url: "/admin/inventory/production",
        },
        {
          title: "Stock Levels",
          url: "/admin/inventory/stocks",
        },
      ],
    },
    {
      title: "Employee Portal",
      url: "#",
      icon: Users,
      roles: ['super_admin', 'admin', 'manager'],
      items: [
        {
          title: "Employees Directory",
          url: "/admin/employees",
        },
        {
          title: "Daily Attendance",
          url: "/admin/employees/attendance",
        },
        {
          title: "Payroll Sheet",
          url: "/admin/employees/payroll",
        },
      ],
    },
    {
      title: "Director Panel",
      url: "#",
      icon: Tag,
      roles: ['super_admin', 'director'],
      items: [
        {
          title: "Director Panel",
          url: "/admin/director",
        },
      ],
    },

    {
      title: "CMS Manager",
      url: "#",
      icon: ImageIcon,
      roles: ['super_admin', 'admin', 'manager'],
      items: [
        {
          title: "Banners",
          url: "/admin/cms/banners",
        },
        {
          title: "Testimonials",
          url: "/admin/cms/testimonials",
        },
        {
          title: "FAQs",
          url: "/admin/cms/faqs",
        },
        {
          title: "Team Members",
          url: "/admin/team",
        },
      ],
    },
    {
      title: "Blogs",
      url: "#",
      icon: FileText,
      roles: ['super_admin', 'admin', 'manager'],
      items: [
        {
          title: "Manage Blog",
          url: "/admin/blogs",
        },
        {
          title: "Add New Blog",
          url: "/admin/blogs/new",
        },
      ],
    },
    {
      title: "User Management",
      url: "#",
      icon: Users,
      roles: ['super_admin', 'admin'],
      items: [
        {
          title: "All Users",
          url: "/admin/users",
        },
      ],
    },
    {
      title: "System Settings",
      url: "#",
      icon: Settings,
      roles: ['super_admin', 'admin'],
      items: [
        {
          title: "Coupons",
          url: "/admin/coupons",
          superOnly: true
        },
        {
          title: "General Settings",
          url: "/admin/settings",
          superOnly: true
        },
        {
          title: "Subscribers",
          url: "/admin/subscribers",
          icon: Mail,
          superOnly: true
        },
        {
          title: "Infrastructure & Marketing",
          url: "/admin/system-design",
          superOnly: true
        },
      ],
    },
  ],
}


import { useSession } from "next-auth/react"

function NavMain({ items, pathname, role }: { items: any; pathname: string; role?: string }) {
  const { setOpenMobile, isMobile } = useSidebar()

  // Filter items based on role
  const filteredItems = items.map((item: any) => ({
    ...item,
    items: item.items.filter((subItem: any) => !subItem.superOnly || role === 'super_admin')
  })).filter((item: any) => {
    if (item.roles && !item.roles.includes(role)) {
      return false;
    }
    return item.items.length > 0;
  });

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {filteredItems.map((item: any) => {
          const isParentActive =
            item.items.some(
              (subItem: any) =>
                pathname === subItem.url ||
                (subItem.url !== "#" &&
                  subItem.url !== "/admin" &&
                  pathname.startsWith(subItem.url + "/"))
            ) || pathname === item.url

          return (
            <Collapsible
              key={item.title}
              defaultOpen={isParentActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger render={<SidebarMenuButton tooltip={item.title} isActive={isParentActive} />}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-open/collapsible:rotate-90 group-[[data-state=open]]/collapsible:rotate-90" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem: any) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          render={<Link href={subItem.url} onClick={handleLinkClick} />}
                          isActive={
                            pathname === subItem.url ||
                            (subItem.url !== "#" &&
                              subItem.url !== "/admin" &&
                              pathname.startsWith(subItem.url + "/") &&
                              !item.items.some(
                                (otherItem: any) =>
                                  otherItem !== subItem &&
                                  otherItem.url.length > subItem.url.length &&
                                  (pathname === otherItem.url || pathname.startsWith(otherItem.url + "/"))
                              ))
                          }
                        >
                          <span>{subItem.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b h-14 lg:h-[60px] px-4 flex items-center">
        <Logo textClassName="text-sm md:text-base font-black tracking-wide whitespace-nowrap" />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <NavMain items={data.navMain} pathname={pathname} role={role} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

