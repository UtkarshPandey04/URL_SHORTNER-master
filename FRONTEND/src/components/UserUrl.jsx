import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllUserUrls, toggleUrlStatus, deleteUrl, updateUrlExpiry } from '../api/user.api'

const UserUrl = () => {
  const queryClient = useQueryClient()
  const { data: urls, isLoading, isError, error } = useQuery({
    queryKey: ['userUrls'],
    queryFn: getAllUserUrls,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 30000,       // Data is considered fresh for 30 seconds
  })
  const [copiedId, setCopiedId] = useState(null)
  const [editingExpiry, setEditingExpiry] = useState(null)
  const [expiryDate, setExpiryDate] = useState('')

  const toggleStatusMutation = useMutation({
    mutationFn: ({id, status}) => toggleUrlStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries(['userUrls'])
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteUrl(id),
    onSuccess: () => queryClient.invalidateQueries(['userUrls'])
  })

  const updateExpiryMutation = useMutation({
    mutationFn: ({id, expiryDate}) => updateUrlExpiry(id, expiryDate),
    onSuccess: () => {
      queryClient.invalidateQueries(['userUrls'])
      setEditingExpiry(null)
      setExpiryDate('')
    }
  })
  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    
    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
        Error loading your URLs: {error.message}
      </div>
    )
  }

  if (!urls || !urls.urls || urls.urls.length === 0) {
    return (
      <div className="text-center text-gray-500 my-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        <p className="text-lg font-medium">No URLs found</p>
        <p className="mt-1">You haven't created any shortened URLs yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg mt-5 shadow-md overflow-hidden">
      
      <div className="overflow-x-auto h-56">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Original URL
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Short URL
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clicks
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiry Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                QR Code
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {urls.urls.reverse().map((url) => (
              <tr key={url._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 truncate max-w-xs">
                    {url.full_url}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <a
                      href={`http://localhost:3000/${url.short_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-900 hover:underline"
                    >
                      {`localhost:3000/${url.short_url}`}
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {url.clicks} {url.clicks === 1 ? 'click' : 'clicks'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    url.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {url.status ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {editingExpiry === url._id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="datetime-local"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      />
                      <button
                        onClick={() => updateExpiryMutation.mutate({id: url._id, expiryDate})}
                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingExpiry(null)}
                        className="bg-gray-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-900">
                      {url.expiry_date ? new Date(url.expiry_date).toLocaleString() : 'No expiry'}
                      <button
                        onClick={() => {
                          setEditingExpiry(url._id)
                          setExpiryDate(url.expiry_date ? new Date(url.expiry_date).toISOString().slice(0,16) : '')
                        }}
                        className="ml-2 text-blue-600 hover:text-blue-900 text-xs"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {url.qr_code && (
                    <img src={url.qr_code} alt="QR Code" className="w-16 h-16" />
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-medium space-x-2">
                  <button
                    onClick={() => toggleStatusMutation.mutate({id: url._id, status: !url.status})}
                    className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm ${
                      url.status ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {url.status ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(url._id)}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleCopy(`http://localhost:3000/${url.short_url}`, url._id)}
                    className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm ${
                      copiedId === url._id
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copiedId === url._id ? 'Copied!' : 'Copy'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserUrl