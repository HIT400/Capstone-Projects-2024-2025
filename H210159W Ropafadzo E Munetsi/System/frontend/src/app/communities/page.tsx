'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FaBuilding, FaUsers, FaHandshake, FaGraduationCap } from 'react-icons/fa'

export default function Communities() {
  // Sample community events
  const events = [
    {
      id: 1,
      title: 'Building Standards Workshop',
      date: 'June 15, 2023',
      location: 'Harare City Council Chambers',
      description: 'Learn about the latest building standards and regulations in Zimbabwe.'
    },
    {
      id: 2,
      title: 'Sustainable Construction Forum',
      date: 'July 22, 2023',
      location: 'Bulawayo Convention Center',
      description: 'Join industry experts to discuss sustainable construction practices in Zimbabwe.'
    },
    {
      id: 3,
      title: 'Digital Building Approval Seminar',
      date: 'August 10, 2023',
      location: 'Virtual Event',
      description: 'A comprehensive overview of the digital building approval process.'
    }
  ]
  
  // Sample success stories
  const successStories = [
    {
      id: 1,
      title: 'Mbare Community Center',
      image: '/community-center.jpg',
      description: 'A community center in Mbare that was approved and built in record time using the ZimBuilds platform.',
      quote: 'The digital approval process saved us months of waiting and allowed us to start construction quickly.',
      author: 'John Moyo, Project Manager'
    },
    {
      id: 2,
      title: 'Chitungwiza Housing Development',
      image: '/housing-development.jpg',
      description: 'A large-scale housing development in Chitungwiza that benefited from the streamlined approval process.',
      quote: 'ZimBuilds made it possible for us to get approvals for 200 housing units efficiently and transparently.',
      author: 'Sarah Ndlovu, Developer'
    }
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0]">
      {/* Header */}
      <header className="bg-[#224057] text-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 relative">
              <Image
                src="/logo.png"
                alt="ZIMBUILDS Logo"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <div className="text-2xl font-bold">ZIMBUILDS</div>
          </div>
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="hover:text-gray-300 transition">HOME</Link>
            <Link href="/about" className="hover:text-gray-300 transition">ABOUT</Link>
            <Link href="/contacts" className="hover:text-gray-300 transition">CONTACTS</Link>
            <Link href="/learn-more" className="hover:text-gray-300 transition">LEARN MORE</Link>
            <div className="border-l border-white h-6 mx-2"></div>
            <Link href="/auth/login" className="hover:text-gray-300 transition">LOGIN</Link>
          </div>
          <button className="md:hidden">☰</button>
        </div>
      </header>

      {/* Hero Section */}
      <div
        className="text-white py-16 px-4 relative"
        style={{
          backgroundImage: "linear-gradient(rgba(34, 64, 87, 0.9), rgba(34, 64, 87, 0.9)), url('/community-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Building Communities Together</h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl mb-8">
            ZimBuilds is more than just a building approval platform. We're committed to fostering 
            stronger communities through collaboration, education, and shared success.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Community Initiatives Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[#224057] mb-8 text-center">Our Community Initiatives</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
              <div className="text-[#224057] text-4xl mb-4 flex justify-center">
                <FaBuilding />
              </div>
              <h3 className="text-xl font-bold mb-2">Urban Development</h3>
              <p className="text-gray-600">
                Supporting sustainable urban development projects that benefit local communities.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
              <div className="text-[#224057] text-4xl mb-4 flex justify-center">
                <FaUsers />
              </div>
              <h3 className="text-xl font-bold mb-2">Community Engagement</h3>
              <p className="text-gray-600">
                Involving local communities in the planning and development process.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
              <div className="text-[#224057] text-4xl mb-4 flex justify-center">
                <FaHandshake />
              </div>
              <h3 className="text-xl font-bold mb-2">Industry Partnerships</h3>
              <p className="text-gray-600">
                Collaborating with construction industry stakeholders to improve standards.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
              <div className="text-[#224057] text-4xl mb-4 flex justify-center">
                <FaGraduationCap />
              </div>
              <h3 className="text-xl font-bold mb-2">Education & Training</h3>
              <p className="text-gray-600">
                Providing resources and training on building standards and regulations.
              </p>
            </div>
          </div>
        </section>
        
        {/* Success Stories Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[#224057] mb-8 text-center">Success Stories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {successStories.map(story => (
              <div key={story.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 relative">
                  <Image
                    src={story.image}
                    alt={story.title}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#224057] mb-2">{story.title}</h3>
                  <p className="text-gray-600 mb-4">{story.description}</p>
                  <blockquote className="border-l-4 border-[#224057] pl-4 italic text-gray-700 mb-2">
                    "{story.quote}"
                  </blockquote>
                  <p className="text-sm text-gray-500">- {story.author}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link
              href="/contacts"
              className="inline-block bg-[#224057] text-white px-6 py-3 rounded-md font-medium hover:bg-[#1a344d] transition-colors"
            >
              Share Your Success Story
            </Link>
          </div>
        </section>
        
        {/* Upcoming Events Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[#224057] mb-8 text-center">Upcoming Community Events</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="text-[#224057] font-bold text-lg mb-2">{event.title}</div>
                <div className="text-gray-500 mb-1">📅 {event.date}</div>
                <div className="text-gray-500 mb-3">📍 {event.location}</div>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <button className="text-[#224057] font-medium hover:underline">
                  Register for Event →
                </button>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-100 rounded-lg p-6 mt-8">
            <h3 className="text-xl font-bold text-[#224057] mb-2">Host a Community Event</h3>
            <p className="text-gray-600 mb-4">
              Are you interested in hosting a community event related to building and development?
              We can help promote your event to our network of professionals and community members.
            </p>
            <Link
              href="/contacts"
              className="inline-block bg-[#224057] text-white px-4 py-2 rounded-md font-medium hover:bg-[#1a344d] transition-colors"
            >
              Contact Us to Learn More
            </Link>
          </div>
        </section>
        
        {/* Community Resources Section */}
        <section>
          <h2 className="text-3xl font-bold text-[#224057] mb-8 text-center">Community Resources</h2>
          
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-[#224057] mb-4">Educational Resources</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-[#224057] mr-2">📄</span>
                    <span>Building Standards and Regulations Guide</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#224057] mr-2">📄</span>
                    <span>Sustainable Building Practices in Zimbabwe</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#224057] mr-2">📄</span>
                    <span>Understanding the Building Approval Process</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#224057] mr-2">📄</span>
                    <span>Guide to Building Inspections</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-[#224057] mb-4">Community Support</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-[#224057] mr-2">🤝</span>
                    <span>Local Building Associations Directory</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#224057] mr-2">🤝</span>
                    <span>Contractor and Professional Services Directory</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#224057] mr-2">🤝</span>
                    <span>Community Development Projects</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#224057] mr-2">🤝</span>
                    <span>Funding and Grant Opportunities</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Link
                href="/learn-more"
                className="inline-block bg-[#224057] text-white px-6 py-3 rounded-md font-medium hover:bg-[#1a344d] transition-colors"
              >
                Access Resources
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#224057] text-white py-8 px-4 mt-12">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 flex items-center space-x-2">
              <div className="h-8 w-8 relative">
                <Image
                  src="/logo.png"
                  alt="ZIMBUILDS Logo"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <div>
                <h3 className="font-bold">ZimBuilds</h3>
                <p className="text-sm">Government Building Plan Approval Portal</p>
              </div>
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="hover:text-gray-300 transition">About</Link>
              <Link href="/contacts" className="hover:text-gray-300 transition">Contact</Link>
              <Link href="/terms" className="hover:text-gray-300 transition">Terms</Link>
              <Link href="/privacy" className="hover:text-gray-300 transition">Privacy</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-600 text-center text-sm">
            <p>© {new Date().getFullYear()} Zimbabwe Ministry of Local Government. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
