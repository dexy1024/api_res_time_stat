import { Grid } from 'antd'

export function useIsMobile(breakpoint: 'sm' | 'md' | 'lg' = 'md') {
  const screens = Grid.useBreakpoint()
  return !screens[breakpoint]
}
