import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { SovereigntyIndicator } from '@/components/Sovereignty'
import { cx, IconButton } from '@/components/ui'
import {
  Chat,
  ChevronDown,
  Connectors,
  Insights,
  Logout,
  Mark,
  Memory,
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
  hero?: boolean
}

const primary: NavItem[] = [
  { to: '/chat', label: 'Chat', icon: Chat },
  { to: '/memory', label: 'Memory', icon: Memory, hero: true },
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
          'focus-ring group/nav relative flex items-center gap-3 rounded-[var(--radius)] px-3 py-2 text-[0.9375rem] transition-colors',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-paper-raised text-ink font-[600] shadow-[inset_0_0_0_1px_var(--color-rule)]'
            : 'text-ink-muted hover:bg-paper-raised/60 hover:text-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cx(
              'absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full bg-evergreen transition-opacity',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
          />
          <Icon size={19} className={cx(isActive ? 'text-evergreen' : 'text-ink-faint group-hover/nav:text-ink-soft')} />
          {!collapsed && <span>{item.label}</span>}
          {!collapsed && item.hero && (
            <span className="ml-auto text-[0.5625rem] font-[600] uppercase tracking-[0.16em] text-ink-faint">
              hero
            </span>
          )}
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
      {/* Left navigation rail */}
      <aside
        className={cx(
          'flex shrink-0 flex-col border-r border-rule bg-paper-sunk/40 transition-[width] duration-200',
          collapsed ? 'w-[68px]' : 'w-[248px]',
        )}
      >
        {/* Brand */}
        <div className={cx('flex items-center gap-3 px-4 pb-2 pt-5', collapsed && 'justify-center px-0')}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-evergreen text-veil">
            <Mark size={22} />
          </span>
          {!collapsed && (
            <div className="leading-tight">
              <div
                className="font-display text-[1.35rem] font-[600] text-ink"
                style={{ fontVariationSettings: "'SOFT' 2, 'WONK' 1, 'opsz' 144" }}
              >
                Anant
              </div>
              <div className="text-[0.6875rem] tracking-[0.06em] text-ink-faint">by Neural AI</div>
            </div>
          )}
        </div>

        <nav className="mt-4 flex flex-1 flex-col gap-0.5 px-3">
          {!collapsed && <div className="eyebrow px-3 pb-1 pt-2">Workspace</div>}
          {primary.map((i) => (
            <NavRow key={i.to} item={i} collapsed={collapsed} />
          ))}
          <div className="my-3 h-px bg-rule/70" />
          {secondary.map((i) => (
            <NavRow key={i.to} item={i} collapsed={collapsed} />
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className={cx('px-3 pb-2', collapsed && 'flex justify-center px-0')}>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="focus-ring flex w-full items-center justify-center gap-2 rounded-[var(--radius)] py-1.5 text-[0.75rem] text-ink-faint hover:bg-paper-raised/60 hover:text-ink-soft"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <ChevronDown size={15} className={cx('transition-transform', collapsed ? '-rotate-90' : 'rotate-90')} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* Workspace / account switcher */}
        <div className="relative border-t border-rule p-3">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={cx(
              'focus-ring flex w-full items-center gap-3 rounded-[var(--radius)] px-2 py-2 text-left hover:bg-paper-raised',
              collapsed && 'justify-center px-0',
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-rule bg-veil font-display text-[0.9rem] font-[600] text-evergreen">
              {initials}
            </span>
            {!collapsed && (
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-[0.875rem] font-[600] text-ink">{user?.workspace}</span>
                <span className="block truncate text-[0.75rem] text-ink-muted">
                  {user?.name} · {user?.role}
                </span>
              </span>
            )}
            {!collapsed && <ChevronDown size={15} className="text-ink-faint" />}
          </button>

          {menuOpen && (
            <div className="rise absolute bottom-[calc(100%+6px)] left-3 right-3 z-20 overflow-hidden rounded-[var(--radius)] border border-rule bg-paper-raised shadow-[var(--shadow-pop)]">
              <div className="border-b border-rule px-3.5 py-2.5">
                <div className="text-[0.8125rem] font-[600] text-ink">{user?.name}</div>
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
    <header className="flex shrink-0 items-center gap-4 border-b border-rule bg-paper/80 px-8 py-4 backdrop-blur">
      <div className="min-w-0">
        <h1
          className="font-display text-[1.5rem] font-[600] leading-none text-ink"
          style={{ fontVariationSettings: "'SOFT' 2, 'WONK' 1, 'opsz' 144" }}
        >
          {title}
        </h1>
        <p className="mt-1.5 truncate text-[0.875rem] text-ink-muted">{intent}</p>
      </div>
      <div className="ml-auto flex items-center gap-3">
        {actions}
        <SovereigntyIndicator />
      </div>
    </header>
  )
}

export { IconButton }
