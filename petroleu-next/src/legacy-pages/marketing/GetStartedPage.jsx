import { Navigate } from 'react-router-dom'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MarketingPageJsonLd } from '../../components/marketing/MarketingJsonLd'
import { useUiCopy } from '../../hooks/useUiCopy'

export default function GetStartedPage() {
  const { mp } = useUiCopy()
  return (
    <>
      <MarketingSeo path="/get-started" />
      <MarketingPageJsonLd path="/get-started" />
      <Navigate to={mp('/contact')} replace />
    </>
  )
}
