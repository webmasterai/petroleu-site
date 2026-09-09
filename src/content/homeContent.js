import { pricingContent } from './pricingContent'

export const homeContent = {
  form: {
    title: 'Request a Demo',
    description: 'Please provide your details so we can tailor the demo to your needs.',
    submit: 'Submit Request',
    privacy: 'By submitting this form, you agree to our Privacy Policy and Terms of Service.',
  },
  formFields: [
    { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Your Full Name', required: true },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'Email Address', required: true },
    { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'Phone Number', required: true },
    { name: 'business_name', label: 'Business Name', type: 'text', placeholder: 'Your Business/Fuel Station Name', required: true },
    { name: 'city', label: 'Your City', type: 'text', placeholder: 'Your City', required: true },
    { name: 'address', label: 'Address', type: 'text', placeholder: 'Your Business Address', required: false },
    { name: 'message', label: 'Additional Information', type: 'textarea', placeholder: 'Tell us about your specific needs...', required: false },
  ],
  pricing: pricingContent,
}
