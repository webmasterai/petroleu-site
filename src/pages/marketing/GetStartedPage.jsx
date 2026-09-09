import { Navigate } from 'react-router-dom'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MarketingPageJsonLd } from '../../components/marketing/MarketingJsonLd'

export default function GetStartedPage() {
  return (
    <>
      <MarketingSeo path="/get-started" />
      <MarketingPageJsonLd path="/get-started" />
      <Navigate to="/contact" replace />
    </>
  )
}
