// src/pages/public/About.jsx
import PublicNavbar from '../../components/layout/PublicNavbar'
import Footer from './Footer'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div>
      <PublicNavbar />
      <section className="pt-28 pb-20 px-6 md:px-16 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <p className="text-gold-600 text-xs tracking-widest uppercase mb-3">Our Story</p>
          <h1 className="text-5xl font-light text-gray-900 mb-8" style={{fontFamily:'Cormorant Garamond,serif'}}>About <em>Nexus</em></h1>
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <p className="text-gray-600 leading-relaxed mb-4">Every business owner in India who has tried to set up a new office knows the nightmare — 8 different contractors, missed deadlines, poor quality, and constant follow-up calls.</p>
              <p className="text-gray-600 leading-relaxed mb-4">We built Nexus because that problem deserved a real solution. One company, one call, complete accountability.</p>
              <p className="text-gray-600 leading-relaxed">Based in Lucknow, we serve premium clients across Uttar Pradesh who value their time above everything else.</p>
            </div>
            <div className="space-y-6">
              {[['200+','Projects delivered across Lucknow'],['40+','Verified vendors in our network'],['98%','On-time delivery rate'],['4hrs','Maximum response time to any enquiry']].map(([n,d]) => (
                <div key={n} className="flex items-center gap-4 border-b border-gray-100 pb-4">
                  <p className="text-3xl font-light text-gold-500 w-20 flex-shrink-0" style={{fontFamily:'Cormorant Garamond,serif'}}>{n}</p>
                  <p className="text-sm text-gray-600">{d}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-900 p-10 text-center">
            <h2 className="text-3xl font-light text-white mb-4" style={{fontFamily:'Cormorant Garamond,serif'}}>Ready to work with us?</h2>
            <Link to="/contact" className="bg-gold-500 text-black px-8 py-3 text-sm font-medium hover:bg-gold-400 transition-colors inline-block mt-2">Get in Touch →</Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
