import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SERVICE_ICONS = {
  'Interior Design': '🏠',
  'Electrical Work': '⚡',
  'Solar Installation': '☀️',
  'Signage & Billboard': '📋',
  'Website & IT Setup': '💻'
}

const VALIDATION_RULES = {
  positiveNumber: (val) => !val || /^\d+$/.test(val) ? null : 'Must be a positive number',
  required: (val) => val ? null : 'This field is required'
}

export default function QuoteWizard({ services, onClose }) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  
  const selectedServices = services.map(s => s.name)
  const totalSteps = selectedServices.length
  const currentService = selectedServices[currentStep]
  
  function getServiceFields(serviceName) {
    const fields = {
      'Interior Design': [
        { key: 'spaceType', label: 'Space Type', type: 'radio', options: ['Office', 'Retail Shop', 'Clinic', 'Restaurant', 'Showroom', 'Other'], required: true },
        { key: 'areaSqFt', label: 'Total Area (sq ft)', type: 'number', required: true },
        { key: 'rooms', label: 'Number of Rooms/Cabins', type: 'number', required: false },
        { key: 'stylePreference', label: 'Style Preference', type: 'radio', options: ['Modern', 'Traditional', 'Minimalist', 'Luxury'], required: true },
        { key: 'falseCeiling', label: 'False Ceiling Required', type: 'toggle', required: false },
        { key: 'furniture', label: 'Furniture Required', type: 'toggle', required: false },
        { key: 'timeline', label: 'Timeline', type: 'select', options: ['Less than 1 month', '1-2 months', '2-3 months', 'Flexible'], required: false },
        { key: 'budget', label: 'Budget Range', type: 'select', options: ['Under 2L', '2L-5L', '5L-15L', 'Above 15L'], required: true },
        { key: 'notes', label: 'Additional Notes', type: 'textarea', required: false }
      ],
      'Electrical Work': [
        { key: 'workType', label: 'Work Type', type: 'radio', options: ['New Installation', 'Renovation', 'Repair', 'Upgrade'], required: true },
        { key: 'propertyType', label: 'Property Type', type: 'radio', options: ['Office', 'Shop', 'Warehouse', 'Industrial'], required: true },
        { key: 'areaSqFt', label: 'Area (sq ft)', type: 'number', required: true },
        { key: 'floors', label: 'Number of Floors', type: 'number', required: false },
        { key: 'threePhase', label: 'Three Phase Required', type: 'radio', options: ['Yes', 'No', 'Not Sure'], required: false },
        { key: 'backup', label: 'Generator/Inverter Backup', type: 'toggle', required: false },
        { key: 'timeline', label: 'Timeline', type: 'select', options: ['Urgent (within a week)', '2-4 weeks', '1-2 months', 'Flexible'], required: false },
        { key: 'budget', label: 'Budget Range', type: 'select', options: ['Under 50K', '50K-1L', '1L-3L', 'Above 3L'], required: true },
        { key: 'notes', label: 'Additional Notes', type: 'textarea', required: false }
      ],
      'Solar Installation': [
        { key: 'propertyType', label: 'Property Type', type: 'radio', options: ['Commercial Office', 'Factory/Warehouse', 'Hospital', 'School', 'Other'], required: true },
        { key: 'monthlyBill', label: 'Monthly Electricity Bill (₹)', type: 'number', required: true },
        { key: 'roofType', label: 'Roof Type', type: 'radio', options: ['RCC Flat', 'Sloped', 'Metal Sheet', 'Other'], required: false },
        { key: 'roofArea', label: 'Available Roof Area (sq ft)', type: 'number', required: false },
        { key: 'sanctionedLoad', label: 'Current Sanctioned Load (KW)', type: 'number', required: false },
        { key: 'netMetering', label: 'UPPCL Net Metering Required', type: 'radio', options: ['Yes', 'No', 'Not Sure'], required: false },
        { key: 'timeline', label: 'Timeline', type: 'select', options: ['ASAP', '1-3 months', '3-6 months', 'Flexible'], required: false },
        { key: 'budget', label: 'Budget Range', type: 'select', options: ['Under 3L', '3L-7L', '7L-15L', 'Above 15L'], required: true },
        { key: 'notes', label: 'Additional Notes', type: 'textarea', required: false }
      ],
      'Signage & Billboard': [
        { key: 'signageType', label: 'Signage Type', type: 'checkbox', options: ['Shop Fascia', 'Billboard', 'LED Display', 'Neon Sign', 'Vinyl Wrap', 'Multiple'], required: true },
        { key: 'location', label: 'Location of Installation', type: 'text', required: true },
        { key: 'size', label: 'Approximate Size (width x height in feet)', type: 'text', required: true },
        { key: 'illumination', label: 'Illumination', type: 'radio', options: ['Illuminated', 'Non-Illuminated', 'Not Sure'], required: false },
        { key: 'material', label: 'Material Preference', type: 'radio', options: ['Acrylic', 'Aluminum', 'Flex', 'LED', 'Not Sure'], required: false },
        { key: 'quantity', label: 'Quantity', type: 'number', required: false },
        { key: 'design', label: 'Design Available', type: 'radio', options: ['Yes I have design', 'Need design from you'], required: false },
        { key: 'timeline', label: 'Timeline', type: 'select', options: ['Within 1 week', '2-3 weeks', '1 month', 'Flexible'], required: false },
        { key: 'budget', label: 'Budget Range', type: 'select', options: ['Under 20K', '20K-50K', '50K-2L', 'Above 2L'], required: true },
        { key: 'notes', label: 'Additional Notes', type: 'textarea', required: false }
      ],
      'Website & IT Setup': [
        { key: 'serviceNeeded', label: 'Service Needed', type: 'checkbox', options: ['New Website', 'Redesign Existing', 'E-commerce', 'IT Network Setup', 'Email Setup', 'All of the above'], required: true },
        { key: 'businessType', label: 'Business Type', type: 'text', required: true, placeholder: 'e.g. Retail clothing store' },
        { key: 'hasDomain', label: 'Do you have existing domain', type: 'toggle', required: false },
        { key: 'domainName', label: 'Domain Name', type: 'text', required: false, conditional: 'hasDomain' },
        { key: 'pages', label: 'Number of pages needed', type: 'select', options: ['Less than 5', '5-10', '10-20', 'More than 20'], required: false },
        { key: 'features', label: 'Features Required', type: 'checkbox', options: ['Payment Gateway', 'WhatsApp Integration', 'Admin Panel', 'Booking System', 'SEO', 'Social Media'], required: false },
        { key: 'technology', label: 'Technology Preference', type: 'radio', options: ['No preference', 'WordPress', 'Custom Code', 'Other'], required: false },
        { key: 'timeline', label: 'Timeline', type: 'select', options: ['ASAP', '1 month', '1-3 months', 'Flexible'], required: false },
        { key: 'budget', label: 'Budget Range', type: 'select', options: ['Under 20K', '20K-50K', '50K-1.5L', 'Above 1.5L'], required: true },
        { key: 'notes', label: 'Additional Notes', type: 'textarea', required: false }
      ]
    }
    return fields[serviceName] || []
  }
  
  function validateStep() {
    const newErrors = {}
    const fields = getServiceFields(currentService)
    
    fields.forEach(field => {
      if (field.conditional && !formData[`${currentService}_${field.conditional}`]) {
        return
      }
      
      if (field.required) {
        const val = formData[`${currentService}_${field.key}`] || ''
        const error = VALIDATION_RULES.required(val)
        if (error) newErrors[`${currentService}_${field.key}`] = error
      }
      
      if (field.type === 'number' && formData[`${currentService}_${field.key}`]) {
        const val = formData[`${currentService}_${field.key}`]
        const error = VALIDATION_RULES.positiveNumber(val)
        if (error) newErrors[`${currentService}_${field.key}`] = error
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  function updateField(key, value) {
    setFormData(prev => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors(prev => {
        const newErr = { ...prev }
        delete newErr[key]
        return newErr
      })
    }
  }
  
  function handleNext() {
    if (!validateStep()) return
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Build service details
      const serviceDetails = {}
      selectedServices.forEach(service => {
        const fields = getServiceFields(service)
        const serviceData = {}
        fields.forEach(field => {
          const key = `${service}_${field.key}`
          if (formData[key] !== undefined && formData[key] !== '') {
            serviceData[field.key] = formData[key]
          }
        })
        serviceDetails[service] = serviceData
      })
      
      // Redirect to contact with service data
      navigate('/contact', {
        state: {
          servicesRequested: selectedServices,
          serviceDetails: serviceDetails
        }
      })
      onClose()
    }
  }
  
  function handleBack() {
    setCurrentStep(prev => prev - 1)
  }
  
  function handleClose() {
    if (window.confirm('Are you sure? Your answers will be lost.')) {
      onClose()
    }
  }
  
  const progressPercent = ((currentStep + 1) / totalSteps) * 100
  const fields = getServiceFields(currentService)
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gold-600 font-medium">
                Step {currentStep + 1} of {totalSteps}
              </p>
              <h2 className="text-2xl font-light text-gray-900 mt-1">
                {currentService}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-light">
              ×
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-gold-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-4xl mb-2">{SERVICE_ICONS[currentService]}</p>
            <h3 className="text-lg font-medium text-gray-900">{currentService}</h3>
          </div>
          
          <div className="space-y-5">
            {fields.map(field => {
              const fieldKey = `${currentService}_${field.key}`
              const value = formData[fieldKey] || ''
              const error = errors[fieldKey]
              
              if (field.conditional && !formData[`${currentService}_${field.conditional}`]) {
                return null
              }
              
              return (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>
                  
                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateField(fieldKey, e.target.value)}
                      placeholder={field.placeholder || ''}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-200 ${
                        error ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  )}
                  
                  {field.type === 'number' && (
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => updateField(fieldKey, e.target.value)}
                      placeholder="Enter number"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-200 ${
                        error ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  )}
                  
                  {field.type === 'textarea' && (
                    <textarea
                      value={value}
                      onChange={(e) => updateField(fieldKey, e.target.value)}
                      placeholder="Additional notes..."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-200"
                    />
                  )}
                  
                  {field.type === 'select' && (
                    <select
                      value={value}
                      onChange={(e) => updateField(fieldKey, e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-200 ${
                        error ? 'border-red-500' : 'border-gray-300'
                      }`}>
                      <option value="">Select...</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                  
                  {field.type === 'radio' && (
                    <div className="space-y-2">
                      {field.options.map(opt => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name={fieldKey}
                            value={opt}
                            checked={value === opt}
                            onChange={(e) => updateField(fieldKey, e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {field.type === 'checkbox' && (
                    <div className="space-y-2">
                      {field.options.map(opt => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Array.isArray(value) && value.includes(opt)}
                            onChange={(e) => {
                              const arr = Array.isArray(value) ? [...value] : []
                              if (e.target.checked) {
                                arr.push(opt)
                              } else {
                                arr.splice(arr.indexOf(opt), 1)
                              }
                              updateField(fieldKey, arr)
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {field.type === 'toggle' && (
                    <button
                      onClick={() => updateField(fieldKey, !value)}
                      className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${
                        value ? 'bg-gold-500' : 'bg-gray-300'
                      }`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  )}
                  
                  {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3 justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            ← Back
          </button>
          
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors">
            {currentStep === totalSteps - 1 ? 'Go to Contact Info →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
