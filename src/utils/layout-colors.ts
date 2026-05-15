/**
 * Layout Colors & Styles
 * Centralized color palette for Header, Sidebar, and PageShell
 */

export const layoutColors = {
  header: {
    background: "bg-background",
    border: "border-b border-border",
    shadow: "shadow-sm",
    combined: "bg-background border-b border-border shadow-sm",
  },
  sidebar: {
    container: {
      background: "bg-background",
      border: "border-r border-border",
      shadow: "shadow-xl",
    },
    overlay: "bg-black/50",
    header: {
      border: "border-b border-border",
    },
    items: {
      default: "text-foreground hover:bg-primary/10 hover:text-foreground",
      active: "bg-primary/10 text-primary border-r-2 border-primary",
      nested: "text-foreground hover:bg-primary/5",
      icon: {
        default: "text-primary",
        muted: "text-muted-foreground group-hover:text-foreground",
      },
    },
    transitions: "transition-colors duration-200",
  },
  pageshell: {
    background: "bg-background",
    breadcrumb: {
      text: "text-xs sm:text-sm text-muted-foreground",
      link: "hover:text-foreground transition-colors",
      separator: "text-muted-foreground",
    },
  },
};

export const headerStyles = {
  container: `fixed top-0 left-0 right-0 z-50 ${layoutColors.header.combined}`,
  content: "flex items-center justify-between h-16 px-4",
  logo: "h-10 md:h-12 w-auto object-contain cursor-pointer",
  actionGroup: "flex items-center gap-2 md:gap-4",
};

export const sidebarStyles = {
  overlay: `fixed inset-0 z-40 transition-opacity duration-300 ${layoutColors.sidebar.overlay}`,
  container: `fixed top-0 left-0 z-50 h-full w-80 transform transition-transform duration-200 ease-in-out ${layoutColors.sidebar.container.background} ${layoutColors.sidebar.container.border} ${layoutColors.sidebar.container.shadow}`,
  header: `flex items-center justify-between p-4 ${layoutColors.sidebar.header.border}`,
  menuContainer: "p-4 flex-1 space-y-2 flex flex-col h-full overflow-y-auto",
  menuGroup: "space-y-2",
  menuItem: {
    primary: `w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground ${layoutColors.sidebar.transitions}`,
    secondary: `w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground ${layoutColors.sidebar.transitions}`,
    tertiary: `w-full justify-start sidebar-fixed-height-xs px-4 pl-20 text-left sidebar-text-xs hover:bg-primary/10 hover:text-foreground ${layoutColors.sidebar.transitions}`,
  },
  menuIcon: {
    primary: "mr-3 sidebar-icon-sm text-primary group-hover:text-primary",
    secondary: "mr-2 sidebar-icon-xs text-muted-foreground group-hover:text-foreground",
    tertiary: "mr-2 sidebar-icon-xxs",
    chevron: "sidebar-icon-xs text-muted-foreground group-hover:text-foreground",
  },
};
