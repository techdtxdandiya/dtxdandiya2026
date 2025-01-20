import React from 'react';
import { TeamInfo } from '../../../types/team';

interface InformationProps {
  information: TeamInfo['information'];
}

export function Information({ information }: InformationProps) {
  return (
    <div className="space-y-8">
      {/* Liaisons Information */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
        <h3 className="text-2xl font-semibold text-white mb-6">Liaisons Information</h3>
        <div className="space-y-4">
          {information?.liaisons?.map((liaison, index) => (
            <div key={index} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-blue-500/5 rounded-lg">
              <div className="flex flex-col space-y-1">
                <p className="text-white text-lg font-medium">{liaison.name}</p>
                {liaison.phone && (
                  <a 
                    href={`tel:${liaison.phone.replace(/[^0-9]/g, '')}`}
                    className="text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    {liaison.phone}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Information */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
        <h3 className="text-2xl font-semibold text-white mb-6">Tech Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-500/5 rounded-lg">
            <h4 className="text-blue-300 text-sm font-medium mb-2">Danceable Space</h4>
            <p className="text-white">{information?.tech.danceableSpace}</p>
          </div>
          <div className="p-4 bg-blue-500/5 rounded-lg">
            <h4 className="text-blue-300 text-sm font-medium mb-2">Backdrop Space</h4>
            <p className="text-white">{information?.tech.backdropSpace}</p>
          </div>
          <div className="p-4 bg-blue-500/5 rounded-lg">
            <h4 className="text-blue-300 text-sm font-medium mb-2">Apron Space</h4>
            <p className="text-white">{information?.tech.apronSpace}</p>
          </div>
          <div className="p-4 bg-blue-500/5 rounded-lg">
            <h4 className="text-blue-300 text-sm font-medium mb-2">Props Box</h4>
            <p className="text-white">{information?.tech.propsBox}</p>
          </div>
          {information?.tech.additionalNotes && (
            <div className="md:col-span-2">
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-200">{information.tech.additionalNotes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Venue Information */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
        <h3 className="text-2xl font-semibold text-white mb-6">Venue Information</h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-blue-300 text-sm font-medium mb-2">Name</h4>
            <p className="text-white text-lg">{information?.venue.name}</p>
          </div>
          <div>
            <h4 className="text-blue-300 text-sm font-medium mb-2">Address</h4>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <p className="text-white">{information?.venue.address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(information?.venue.address || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-200"
              >
                View in Google Maps
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-blue-300 text-sm font-medium mb-2">Seating Capacity</h4>
            <p className="text-white">{information?.venue.seatingCapacity}</p>
          </div>
        </div>
      </div>

      {/* Hotel Information */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
        <h3 className="text-2xl font-semibold text-white mb-6">Hotel Information</h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-blue-300 text-sm font-medium mb-2">Name</h4>
            <p className="text-white text-lg">{information?.hotel.name}</p>
          </div>
          <div>
            <h4 className="text-blue-300 text-sm font-medium mb-2">Address</h4>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <p className="text-white">{information?.hotel.address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(information?.hotel.address || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-200"
              >
                View in Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 