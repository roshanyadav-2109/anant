import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { cx, IconButton } from '@/components/ui'
import {
  Chat,
  ChevronDown,
  Connectors,
  Insights,
  Logout,
  Mark,
  Memory,
  Panel,
  Search,
  Settings,
  Workspace,
  type IconProps,
} from '@/icons'
import type { ComponentType } from 'react'

interface NavItem {
  to: string
  label: string
  icon: ComponentType<IconProps>
}

const primary: NavItem[] = [
  { to: '/chat', label: 'Chat', icon: Chat },
  { to: '/memory', label: 'Memory', icon: Memory },
  { to: '/connectors', label: 'Connectors', icon: Connectors },
  { to: '/insights', label: 'Insights', icon: Insights },
  { to: '/search', label: 'Search', icon: Search },
]

const secondary: NavItem[] = [
  { to: '/workspace', label: 'Workspace', icon: Workspace },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function NavRow({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const { icon: Icon } = item
  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cx(
          // floating tab with a 2px corner
          'focus-ring group/nav relative flex items-center gap-3 rounded-[4px] px-3 py-2 text-[0.9rem] transition-colors duration-150',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-white/[0.07] font-[600] text-white'
            : 'font-[400] text-[var(--color-sidebar-ink)] hover:bg-white/[0.06] hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* vertical blue indicator line on the left of the selected tab */}
          {isActive && (
            <span className="absolute left-[3px] top-1/2 h-[64%] w-[3px] -translate-y-1/2 rounded-full bg-[var(--color-royal-line)]" />
          )}
          <Icon
            size={22}
            strokeWidth={1.9}
            className={cx(isActive ? 'text-white' : 'text-[var(--color-sidebar-faint)] group-hover/nav:text-white')}
          />
          {!collapsed && <span>{item.label}</span>}
        </>
      )}
    </NavLink>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = (user?.workspace ?? 'A')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 1)
    .join('')

  return (
    <div className="flex h-screen w-full overflow-hidden bg-paper">
      {/* Left navigation rail — black, floating tabs */}
      <aside
        className={cx(
          'flex shrink-0 flex-col bg-[var(--color-sidebar)] transition-[width] duration-200',
          collapsed ? 'w-[68px]' : 'w-[236px]',
        )}
      >
        {/* Brand + collapse toggle */}
        <div className={cx('flex items-center gap-3 px-4 pb-3 pt-5', collapsed && 'flex-col gap-3 px-0')}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] bg-royal text-white">
            <Mark size={22} />
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-[1.15rem] font-[500] tracking-[-0.02em] text-white">Anant</div>
              <div className="text-[0.6875rem] tracking-[0.04em] text-[var(--color-sidebar-faint)]">by Neural AI</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? 'Expand' : 'Collapse to icons'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] text-[var(--color-sidebar-faint)] transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <Panel size={19} />
          </button>
        </div>

        <nav className="mt-3 flex flex-1 flex-col gap-1 px-2.5">
          {!collapsed && (
            <div className="px-3 pb-1.5 pt-2 text-[0.625rem] font-[500] uppercase tracking-[0.14em] text-[var(--color-sidebar-faint)]">
              Workspace
            </div>
          )}
          {primary.map((i) => (
            <NavRow key={i.to} item={i} collapsed={collapsed} />
          ))}
          <div className="my-3 h-px bg-white/[0.08]" />
          {secondary.map((i) => (
            <NavRow key={i.to} item={i} collapsed={collapsed} />
          ))}
        </nav>

        {/* Workspace / account switcher */}
        <div className="relative border-t border-white/[0.08] p-2.5">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={cx(
              'focus-ring flex w-full items-center gap-3 rounded-[4px] px-2 py-2 text-left transition-colors hover:bg-white/[0.06]',
              collapsed && 'justify-center px-0',
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-white/[0.08] text-[0.85rem] font-[500] text-white">
              {initials}
            </span>
            {!collapsed && (
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-[0.875rem] font-[500] text-white">{user?.workspace}</span>
                <span className="block truncate text-[0.75rem] text-[var(--color-sidebar-faint)]">
                  {user?.name} · {user?.role}
                </span>
              </span>
            )}
            {!collapsed && <ChevronDown size={15} className="text-[var(--color-sidebar-faint)]" />}
          </button>

          {menuOpen && (
            <div className="rise absolute bottom-[calc(100%+6px)] left-2.5 right-2.5 z-20 overflow-hidden rounded-[var(--radius)] border border-rule bg-paper-raised shadow-[var(--shadow-pop)]">
              <div className="border-b border-rule px-3.5 py-2.5">
                <div className="text-[0.8125rem] font-[500] text-ink">{user?.name}</div>
                <div className="text-[0.75rem] text-ink-muted">{user?.email}</div>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  signOut().then(() => navigate('/login'))
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[0.875rem] text-ink-soft hover:bg-paper-sunk"
              >
                <Logout size={17} className="text-ink-muted" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  )
}

/**
 * The top bar for every screen: page title + one-line intent on the left,
 * the persistent sovereignty indicator on the right.
 */
export function TopBar({
  title,
  intent,
  actions,
}: {
  title: string
  intent: string
  actions?: ReactNode
}) {
  return (
    <header className="flex shrink-0 items-center gap-4 border-b border-rule bg-paper px-8 py-4">
      <div className="min-w-0">
        <h1 className="text-[1.4rem] font-[500] leading-none tracking-[-0.02em] text-ink">{title}</h1>
        <p className="mt-1.5 truncate text-[0.875rem] text-ink-muted">{intent}</p>
      </div>
      {actions && <div className="ml-auto flex items-center gap-3">{actions}</div>}
    </header>
  )
}

export { IconButton }
