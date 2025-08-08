import type { JSX } from "react";
import * as React from "react";
import { NavLink, useMatch } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Brand } from "@/components/brand";
import { NavUser } from "@/components/nav-user";
import {
  BarChart3,
  Boxes,
  FileText,
  LayoutDashboard,
  Users,
} from "lucide-react";

type Item = {
  title: string;
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  end?: boolean;
};

type User = { name: string; email: string; avatar: string };

const general: Item[] = [
  { title: "Dashboard", to: "/", icon: LayoutDashboard, end: true },
  { title: "Learning Kits", to: "/learning-kits", icon: Boxes },
  { title: "Statistics", to: "/statistics", icon: BarChart3 },
];

const configuration: Item[] = [
  { title: "Users", to: "/users", icon: Users },
  { title: "Files", to: "/files", icon: FileText },
];

// TODO //: Replace with your own user data or fetch it from an API
const defaultUser: User = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
};

function SidebarLink({ title, to, icon: Icon, end }: Item) {
  const match = useMatch({ path: to, end: !!end });
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={!!match}>
        <NavLink to={to} end={end}>
          <Icon className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">{title}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar(
  props: React.ComponentProps<typeof Sidebar>,
): JSX.Element {
  return (
    <Sidebar collapsible="icon" className="group" {...props}>
      <SidebarHeader>
        <Brand />
      </SidebarHeader>

      <SidebarContent className="flex flex-1 flex-col pt-2 group-data-[collapsible=icon]:pt-0">
        <SidebarGroup className="mt-1 group-data-[collapsible=icon]:mt-0">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            General
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {general.map((it) => (
                <SidebarLink key={it.to} {...it} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-2 group-data-[collapsible=icon]:mt-1">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Configuration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configuration.map((it) => (
                <SidebarLink key={it.to} {...it} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={defaultUser} onLogout={() => console.log("logout")} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
