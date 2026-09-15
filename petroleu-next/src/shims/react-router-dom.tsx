'use client'

import NextLink from 'next/link'
import {
  useRouter,
  usePathname,
  useParams as useNextParams,
  useSearchParams,
} from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
  type AnchorHTMLAttributes,
  type MouseEvent,
} from 'react'

type To = string | { pathname?: string; search?: string; hash?: string }

function toHref(to: To): string {
  if (typeof to === 'string') return to
  return `${to.pathname || ''}${to.search || ''}${to.hash || ''}`
}

export function Link({
  to,
  href,
  children,
  replace,
  onClick,
  className,
  end,
  ...rest
}: {
  to?: To
  href?: string
  replace?: boolean
  end?: boolean
  children?: ReactNode
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
  className?: string | ((args: { isActive: boolean }) => string)
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'>) {
  const pathname = usePathname() || '/'
  const dest = href || (to ? toHref(to) : '/')
  const isActive = end
    ? pathname === dest
    : pathname === dest || (dest !== '/' && pathname.startsWith(dest + '/'))
  const resolvedClass =
    typeof className === 'function' ? className({ isActive }) : className
  return (
    <NextLink href={dest} replace={replace} onClick={onClick} className={resolvedClass} {...rest}>
      {children}
    </NextLink>
  )
}

export const NavLink = Link


export function useNavigate() {
  const router = useRouter()
  return useCallback(
    (to: To | number, options?: { replace?: boolean }) => {
      if (typeof to === 'number') {
        if (to < 0) router.back()
        return
      }
      const href = toHref(to)
      if (options?.replace) router.replace(href)
      else router.push(href)
    },
    [router],
  )
}

export function useLocation() {
  const pathname = usePathname() || '/'
  const searchParams = useSearchParams()
  const search = searchParams?.toString()
  return useMemo(
    () => ({
      pathname,
      search: search ? `?${search}` : '',
      hash: typeof window !== 'undefined' ? window.location.hash : '',
      state: null,
      key: 'default',
    }),
    [pathname, search],
  )
}

export function useParams<T extends Record<string, string>>() {
  return useNextParams() as T
}

export function Navigate({ to, replace }: { to: To; replace?: boolean }) {
  const router = useRouter()
  const href = toHref(to)
  useEffect(() => {
    if (replace) router.replace(href)
    else router.push(href)
  }, [href, replace, router])
  return null
}

export function Outlet() {
  return null
}

export function BrowserRouter({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function MemoryRouter({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function Routes({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function Route(_props: Record<string, unknown>) {
  void _props
  return null
}

const NavCtx = createContext(true)
export function useNavigationType() {
  return 'POP'
}
export function UNSAFE_NavigationContext() {
  return useContext(NavCtx)
}

const reactRouterShim = {
  Link,
  useNavigate,
  useLocation,
  useParams,
  Navigate,
  Outlet,
  BrowserRouter,
  Routes,
  Route,
}

export default reactRouterShim

